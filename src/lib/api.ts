import { readSession } from "@/lib/authStore";
import type {
  Address,
  AuthResponse,
  Brand,
  Category,
  CartResponse,
  CheckoutSessionResponse,
  Order,
  Paginated,
  Product,
  Review,
  ShippingAddress,
  Single,
  SubCategory,
  TokenResponse,
  User,
} from "@/types";

export const BASE_URL = "https://ecommerce.routemisr.com";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type Query = Record<string, string | number | undefined | null>;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  query?: Query;
}

let unauthorizedHandler: (() => void) | null = null;

/** The AuthProvider registers a callback so an expired token logs the user out. */
export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}

function extractMessage(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const d = data as {
      message?: string;
      msg?: string;
      errors?: { msg?: string };
    };
    if (d.errors?.msg) return d.errors.msg;
    if (d.message) return d.message;
    if (d.msg) return d.msg;
  }
  return `Request failed (${status})`;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false, query } = opts;

  const url = new URL(BASE_URL + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = readSession()?.token;
    if (token) headers.token = token;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Network error – please check your connection.", 0);
  }

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && auth) unauthorizedHandler?.();
    throw new ApiError(extractMessage(data, res.status), res.status);
  }
  return data as T;
}

/** Run `primary`; if that route does not exist (404) fall back to `fallback`. */
async function withFallback<T>(primary: () => Promise<T>, fallback: () => Promise<T>) {
  try {
    return await primary();
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return fallback();
    throw e;
  }
}

/* ------------------------------------------------------------------ */

export interface ProductQuery {
  limit?: number;
  page?: number;
  sort?: string;
  fields?: string;
  keyword?: string;
  brand?: string;
  priceGte?: number | string;
  priceLte?: number | string;
  category?: string;
}

export const api = {
  /* ------------------------------ Categories ------------------------------ */
  getCategories: (q?: { limit?: number; page?: number; keyword?: string }) =>
    request<Paginated<Category>>("/api/v1/categories", { query: q }),
  getCategory: (id: string) => request<Single<Category>>(`/api/v1/categories/${id}`),

  /* ----------------------------- SubCategories ---------------------------- */
  getSubCategories: (q?: { limit?: number }) =>
    request<Paginated<SubCategory>>("/api/v1/subcategories", { query: q }),
  getSubCategory: (id: string) =>
    request<Single<SubCategory>>(`/api/v1/subcategories/${id}`),

  /* -------------------------------- Brands -------------------------------- */
  getBrands: (q?: { limit?: number; page?: number; keyword?: string }) =>
    request<Paginated<Brand>>("/api/v1/brands", { query: q }),
  getBrand: (id: string) => request<Single<Brand>>(`/api/v1/brands/${id}`),

  /* ------------------------------- Products ------------------------------- */
  getProducts: (q: ProductQuery = {}) =>
    request<Paginated<Product>>("/api/v1/products", {
      query: {
        limit: q.limit,
        page: q.page,
        sort: q.sort,
        fields: q.fields,
        keyword: q.keyword,
        brand: q.brand,
        "price[gte]": q.priceGte,
        "price[lte]": q.priceLte,
        "category[in]": q.category,
      },
    }),
  getProduct: (id: string) => request<Single<Product>>(`/api/v1/products/${id}`),

  /* --------------------------------- Auth --------------------------------- */
  signUp: (body: {
    name: string;
    email: string;
    password: string;
    rePassword: string;
    phone: string;
  }) => request<AuthResponse>("/api/v1/auth/signup", { method: "POST", body }),
  signIn: (body: { email: string; password: string }) =>
    request<AuthResponse>("/api/v1/auth/signin", { method: "POST", body }),
  forgotPassword: (email: string) =>
    request<{ statusMsg?: string; message: string }>("/api/v1/auth/forgotPasswords", {
      method: "POST",
      body: { email },
    }),
  verifyResetCode: (resetCode: string) =>
    request<{ status: string }>("/api/v1/auth/verifyResetCode", {
      method: "POST",
      body: { resetCode },
    }),
  resetPassword: (email: string, newPassword: string) =>
    request<TokenResponse>("/api/v1/auth/resetPassword", {
      method: "PUT",
      body: { email, newPassword },
    }),
  verifyToken: () =>
    request<{ message: string }>("/api/v1/auth/verifyToken", { auth: true }),
  updateMe: (body: { name?: string; email?: string; phone?: string }) =>
    request<{ message: string; user?: User }>("/api/v1/users/updateMe/", {
      method: "PUT",
      body,
      auth: true,
    }),
  changePassword: (body: {
    currentPassword: string;
    password: string;
    rePassword: string;
  }) =>
    request<TokenResponse>("/api/v1/users/changeMyPassword", {
      method: "PUT",
      body,
      auth: true,
    }),

  /* ------------------------------- Wishlist ------------------------------- */
  getWishlist: () =>
    request<{ status: string; count: number; data: Product[] }>("/api/v1/wishlist", {
      auth: true,
    }),
  addToWishlist: (productId: string) =>
    request<{ status: string; message: string; data: string[] }>("/api/v1/wishlist", {
      method: "POST",
      body: { productId },
      auth: true,
    }),
  removeFromWishlist: (productId: string) =>
    request<{ status: string; message: string; data: string[] }>(
      `/api/v1/wishlist/${productId}`,
      { method: "DELETE", auth: true },
    ),

  /* ------------------------------- Addresses ------------------------------ */
  getAddresses: () =>
    request<{ status: string; data: Address[] }>("/api/v1/addresses", { auth: true }),
  getAddress: (id: string) =>
    request<{ status: string; data: Address }>(`/api/v1/addresses/${id}`, { auth: true }),
  addAddress: (body: { name: string; details: string; phone: string; city: string }) =>
    request<{ status: string; message: string; data: Address[] }>("/api/v1/addresses", {
      method: "POST",
      body,
      auth: true,
    }),
  removeAddress: (id: string) =>
    request<{ status: string; message: string; data: Address[] }>(
      `/api/v1/addresses/${id}`,
      { method: "DELETE", auth: true },
    ),

  /* --------------------------------- Cart --------------------------------- */
  // Read + remove-one live on v1, add / update / clear on v2 (v1 as fallback).
  getCart: () => request<CartResponse>("/api/v1/cart", { auth: true }),
  addToCart: (productId: string) =>
    withFallback(
      () =>
        request<unknown>("/api/v2/cart", { method: "POST", body: { productId }, auth: true }),
      () =>
        request<unknown>("/api/v1/cart", { method: "POST", body: { productId }, auth: true }),
    ),
  updateCartQuantity: (productId: string, count: number) =>
    withFallback(
      () =>
        request<unknown>(`/api/v2/cart/${productId}`, {
          method: "PUT",
          body: { count },
          auth: true,
        }),
      () =>
        request<unknown>(`/api/v1/cart/${productId}`, {
          method: "PUT",
          body: { count },
          auth: true,
        }),
    ),
  removeCartItem: (productId: string) =>
    request<unknown>(`/api/v1/cart/${productId}`, { method: "DELETE", auth: true }),
  clearCart: () =>
    withFallback(
      () => request<unknown>("/api/v2/cart", { method: "DELETE", auth: true }),
      () => request<unknown>("/api/v1/cart", { method: "DELETE", auth: true }),
    ),

  /* -------------------------------- Reviews ------------------------------- */
  getProductReviews: (productId: string) =>
    request<Paginated<Review>>(`/api/v1/products/${productId}/reviews`),
  createReview: (productId: string, body: { review: string; rating: number }) =>
    request<unknown>(`/api/v1/products/${productId}/reviews`, {
      method: "POST",
      body,
      auth: true,
    }),
  getAllReviews: () => request<Paginated<Review>>("/api/v1/reviews"),
  getReview: (id: string) => request<Single<Review>>(`/api/v1/reviews/${id}`),
  updateReview: (id: string, body: { review: string; rating: number }) =>
    request<unknown>(`/api/v1/reviews/${id}`, { method: "PUT", body, auth: true }),
  deleteReview: (id: string) =>
    request<unknown>(`/api/v1/reviews/${id}`, { method: "DELETE", auth: true }),

  /* -------------------------------- Orders -------------------------------- */
  getAllOrders: () => request<Order[] | Paginated<Order>>("/api/v1/orders/"),
  getUserOrders: (userId: string) =>
    request<Order[] | Paginated<Order>>(`/api/v1/orders/user/${userId}`),
  createCashOrder: (cartId: string, shippingAddress: ShippingAddress) =>
    withFallback(
      () =>
        request<unknown>(`/api/v2/orders/${cartId}`, {
          method: "POST",
          body: { shippingAddress },
          auth: true,
        }),
      () =>
        request<unknown>(`/api/v1/orders/${cartId}`, {
          method: "POST",
          body: { shippingAddress },
          auth: true,
        }),
    ),
  createCheckoutSession: (
    cartId: string,
    shippingAddress: ShippingAddress,
    returnUrl: string,
  ) =>
    request<CheckoutSessionResponse>(`/api/v1/orders/checkout-session/${cartId}`, {
      method: "POST",
      body: { shippingAddress },
      query: { url: returnUrl },
      auth: true,
    }),
};
