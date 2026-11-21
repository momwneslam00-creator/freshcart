export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

export interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
}

export interface Product {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  description: string;
  quantity: number;
  sold?: number;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  images: string[];
  // Depending on the endpoint these are populated objects or plain ids.
  category: Category | string;
  brand: Brand | string;
  subcategory: SubCategory[] | string[];
  ratingsAverage: number;
  ratingsQuantity: number;
}

export interface PageMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
  prevPage?: number;
}

export interface Paginated<T> {
  results: number;
  metadata?: PageMetadata;
  data: T[];
}

export interface Single<T> {
  data: T;
}

/* ----------------------------- Auth / user ----------------------------- */

export interface User {
  name: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface TokenResponse {
  token: string;
  message?: string;
}

export interface JwtPayload {
  id: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

/* --------------------------------- Cart -------------------------------- */

export interface CartItem {
  _id: string;
  count: number;
  price: number;
  // Populated product on GET /cart, plain id on some mutation responses.
  product: Product | string;
}

export interface Cart {
  _id: string;
  cartOwner: string;
  products: CartItem[];
  totalCartPrice: number;
}

export interface CartResponse {
  status: string;
  numOfCartItems: number;
  cartId: string;
  data: Cart;
}

/* ------------------------------- Addresses ------------------------------ */

export interface ShippingAddress {
  details: string;
  phone: string;
  city: string;
  postalCode?: string;
}

export interface Address extends ShippingAddress {
  _id: string;
  name: string;
}

/* --------------------------------- Orders ------------------------------- */

export interface OrderItem {
  _id: string;
  count: number;
  price: number;
  product: Pick<Product, "_id" | "title" | "imageCover"> & Partial<Product>;
}

export interface Order {
  _id: string;
  id?: number | string;
  shippingAddress?: ShippingAddress;
  taxPrice: number;
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: "cash" | "card" | string;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
  cartItems: OrderItem[];
}

export interface CheckoutSessionResponse {
  status: string;
  session: { url: string; id?: string };
}

/* -------------------------------- Reviews ------------------------------- */

export interface Review {
  _id: string;
  review: string;
  rating: number;
  product: string;
  user: { _id: string; name: string };
  createdAt: string;
}
