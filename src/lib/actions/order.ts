"use server";

import { db } from "@/lib/db";
import { orders, orderItems, addresses, carts, cartItems } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth/actions";

type CreateOrderItem = {
  productVariantId: string;
  quantity: number;
  priceAtPurchase: number;
};

type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
};

export async function createOrder({
  items,
  customerInfo,
  paymentMethod,
}: {
  items: CreateOrderItem[];
  customerInfo: CustomerInfo;
  paymentMethod: "whatsapp" | "payment";
}) {
  const user = await getCurrentUser();  
  if (!user) {
    return { success: false, error: "Debes iniciar sesión" };
  }

  if (items.length === 0) {
    return { success: false, error: "El pedido está vacío" };
  }

  try {
    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0
    );

    // Create or get address
    let addressId: string | null = null;
    if (customerInfo.address && customerInfo.city) {
      const existingAddress = await db
        .select()
        .from(addresses)
        .where(
          and(
            eq(addresses.userId, user.id),
            eq(addresses.line1, customerInfo.address),
            eq(addresses.city, customerInfo.city)
          )
        )
        .limit(1);

      if (existingAddress.length) {
        addressId = existingAddress[0].id;
      } else {
        const newAddress = await db
          .insert(addresses)
          .values({
            userId: user.id,
            type: "shipping",
            line1: customerInfo.address,
            city: customerInfo.city,
            state: customerInfo.city, // Using city as state for simplicity
            country: "Colombia",
            postalCode: "000000",
            isDefault: false,
          })
          .returning();
        addressId = newAddress[0].id;
      }
    }

    // Create order
    const newOrder = await db
      .insert(orders)
      .values({
        userId: user.id,
        status: paymentMethod === "whatsapp" ? "pending" : "pending",
        totalAmount: totalAmount.toFixed(2),
        shippingAddressId: addressId,
        billingAddressId: addressId,
      })
      .returning();

    const order = newOrder[0];

    // Create order items
    await db.insert(orderItems).values(
      items.map((item) => ({
        orderId: order.id,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase.toFixed(2),
      }))
    );

    // Clear cart
    const userCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, user.id))
      .orderBy(desc(carts.createdAt))
      .limit(1);

    if (userCart.length) {
      await db.delete(cartItems).where(eq(cartItems.cartId, userCart[0].id));
    }

    revalidatePath("/cart");
    revalidatePath("/checkout");

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Error al crear el pedido" };
  }
}

