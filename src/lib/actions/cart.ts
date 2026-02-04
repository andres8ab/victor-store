"use server";

import { db } from "@/lib/db";
import { carts, cartItems, productVariants, products, productImages } from "@/lib/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type CartItemWithDetails = {
  id: string;
  productVariantId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string;
  };
  variant: {
    id: string;
    name: string;
    image: string | null;
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
      productVariantId: cartItems.productVariantId,
      quantity: cartItems.quantity,
      productId: products.id,
      productName: products.name,
      productDescription: products.description,
      variantId: productVariants.id,
      variantName: productVariants.name,
      variantImage: productVariants.image,
      variantPrice: productVariants.price,
      variantSalePrice: productVariants.salePrice,
      variantInStock: productVariants.inStock,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(cartItems.cartId, cart.id));

  // Get images for products (fallback if variant has no image)
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
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    product: {
      id: item.productId,
      name: item.productName,
      description: item.productDescription,
    },
    variant: {
      id: item.variantId,
      name: item.variantName,
      image: item.variantImage,
      price: item.variantPrice,
      salePrice: item.variantSalePrice,
      inStock: item.variantInStock,
    },
    imageUrl: item.variantImage || imageMap.get(item.productId) || null,
  }));
}

export async function addToCart(productVariantId: string, userId: string, quantity: number = 1) {
  if (!userId) {
    return { success: false, requiresAuth: true };
  }

  // Verify variant exists and is in stock
  const variant = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, productVariantId))
    .limit(1);

  if (!variant.length) {
    return { success: false, error: "Variante de producto no encontrada" };
  }

  if (variant[0].inStock < quantity) {
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
        eq(cartItems.productVariantId, productVariantId)
      )
    )
    .limit(1);

  if (existingItem.length) {
    // Update quantity
    const newQuantity = existingItem[0].quantity + quantity;
    if (newQuantity > variant[0].inStock) {
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
      productVariantId,
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
      productVariantId: cartItems.productVariantId,
      variantInStock: productVariants.inStock,
    })
    .from(cartItems)
    .innerJoin(carts, eq(cartItems.cartId, carts.id))
    .innerJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
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

  if (quantity > item[0].variantInStock) {
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

