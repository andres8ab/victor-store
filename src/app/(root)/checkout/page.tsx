import { getCart } from "@/lib/actions/cart";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getCurrentUser } from "@/lib/auth/actions";

export default async function CheckoutPage() {
  const user = await getCurrentUser();  
  if (!user) {
    redirect("/sign-in?redirect=/checkout");
  }

  const cartItems = await getCart(user.id);

  if (cartItems.length === 0) {
    redirect("/cart");
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.variant.salePrice 
      ? Number(item.variant.salePrice) 
      : Number(item.variant.price);
    return sum + price * item.quantity;
  }, 0);

  const tax = subtotal * 0.19; // 19% IVA for Colombia
  const total = subtotal + tax;

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-heading-2 text-dark-900 mb-8">Finalizar Pedido</h1>
      
      <CheckoutForm 
        cartItems={cartItems}
        subtotal={subtotal}
        tax={tax}
        total={total}
        user={user}
      />
    </main>
  );
}

