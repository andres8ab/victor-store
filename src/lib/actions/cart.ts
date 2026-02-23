"use server";

import { db } from "@/lib/db";
import { carts, cartItems, products, productImages } from "@/lib/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type CartItemWithDetails = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: string;
    salePrice: string | null;
    inStock: number;
  };
  imageUrl: string | null;
};

export async function getCart(userId?: string): Promise<CartItemWithDetails[]> {
  if (!userId) {
    return [];
  }

  const userCart = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId))
    .orderBy(desc(carts.createdAt))
    .limit(1);

  if (!userCart.length) {
    return [];
  }

  const cart = userCart[0];

  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      productName: products.name,
      productDescription: products.description,
      productPrice: products.price,
      productSalePrice: products.salePrice,
      productInStock: products.inStock,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart.id));

  // Get primary images for products
  const productIds = items.map(item => item.productId);
  const images = productIds.length > 0
    ? await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
      })
      .from(productImages)
      .where(
        and(
          eq(productImages.isPrimary, true),
          inArray(productImages.productId, productIds)
        )
      )
    : [];

  const imageMap = new Map(images.map(img => [img.productId, img.url]));

  return items.map(item => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: {
      id: item.productId,
      name: item.productName,
      description: item.productDescription,
      price: item.productPrice,
      salePrice: item.productSalePrice,
      inStock: item.productInStock,
    },
    imageUrl: imageMap.get(item.productId) || null,
  }));
}

export async function addToCart(productId: string, userId: string, quantity: number = 1) {
  if (!userId) {
    return { success: false, requiresAuth: true };
  }

  // Verify product exists and is in stock
  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product.length) {
    return { success: false, error: "Producto no encontrado" };
  }

  if (product[0].inStock < quantity) {
    return { success: false, error: "Stock insuficiente" };
  }

  // Get or create cart
  let userCart = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId))
    .orderBy(desc(carts.createdAt))
    .limit(1);

  if (!userCart.length) {
    const newCart = await db
      .insert(carts)
      .values({ userId })
      .returning();
    userCart = newCart;
  }

  const cart = userCart[0];

  // Check if item already exists in cart
  const existingItem = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, cart.id),
        eq(cartItems.productId, productId)
      )
    )
    .limit(1);

  if (existingItem.length) {
    // Update quantity
    const newQuantity = existingItem[0].quantity + quantity;
    if (newQuantity > product[0].inStock) {
      return { success: false, error: "Stock insuficiente" };
    }
    await db
      .update(cartItems)
      .set({ quantity: newQuantity })
      .where(eq(cartItems.id, existingItem[0].id));
  } else {
    // Add new item
    await db.insert(cartItems).values({
      cartId: cart.id,
      productId,
      quantity,
    });
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number, userId: string) {
  if (!userId) {
    return { success: false, error: "Debes iniciar sesión" };
  }

  if (quantity <= 0) {
    return removeFromCart(cartItemId, userId);
  }

  // Get cart item and verify ownership
  const item = await db
    .select({
      cartItemId: cartItems.id,
      cartId: cartItems.cartId,
      productId: cartItems.productId,
      productInStock: products.inStock,
    })
    .from(cartItems)
    .innerJoin(carts, eq(cartItems.cartId, carts.id))
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(
      and(
        eq(cartItems.id, cartItemId),
        eq(carts.userId, userId)
      )
    )
    .limit(1);

  if (!item.length) {
    return { success: false, error: "Item no encontrado" };
  }

  if (quantity > item[0].productInStock) {
    return { success: false, error: "Stock insuficiente" };
  }

  await db
    .update(cartItems)
    .set({ quantity })
    .where(eq(cartItems.id, cartItemId));

  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCart(cartItemId: string, userId: string) {
  if (!userId) {
    return { success: false, error: "Debes iniciar sesión" };
  }

  // Verify ownership
  const item = await db
    .select()
    .from(cartItems)
    .innerJoin(carts, eq(cartItems.cartId, carts.id))
    .where(
      and(
        eq(cartItems.id, cartItemId),
        eq(carts.userId, userId)
      )
    )
    .limit(1);

  if (!item.length) {
    return { success: false, error: "Item no encontrado" };
  }

  await db.delete(cartItems).where(eq(cartItems.id, cartItemId));

  revalidatePath("/cart");
  return { success: true };
}

export async function clearCart(userId: string) {
  if (!userId) {
    return { success: false, error: "Debes iniciar sesión" };
  }

  const userCart = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId))
    .orderBy(desc(carts.createdAt))
    .limit(1);

  if (userCart.length) {
    await db.delete(cartItems).where(eq(cartItems.cartId, userCart[0].id));
  }

  revalidatePath("/cart");
  return { success: true };
}

