import { redirect } from "next/navigation";

// Stripe's success redirect lands on `<url>/allorders`; send people to the real orders page.
export default function AllOrdersRedirect() {
  redirect("/orders");
}
