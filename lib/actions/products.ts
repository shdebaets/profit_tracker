"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { dollarsToCents } from "@/lib/format";

export type ProductFormState = { error?: string };

const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200),
  sku: z.string().trim().max(100).optional(),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .positive("Quantity must be greater than 0."),
  unitCost: z.coerce.number().min(0, "Cost can't be negative."),
});

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const userId = await requireUserId();

  const parsed = createProductSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    quantity: formData.get("quantity"),
    unitCost: formData.get("unitCost"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, sku, quantity, unitCost } = parsed.data;

  const product = await prisma.product.create({
    data: {
      userId,
      name,
      sku: sku || null,
      batches: {
        create: {
          userId,
          quantity,
          unitCostCents: dollarsToCents(unitCost),
        },
      },
    },
  });

  revalidatePath("/products");
  redirect(`/products/${product.id}`);
}

const editProductSchema = z.object({
  productId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required.").max(200),
  sku: z.string().trim().max(100).optional(),
});

export async function updateProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const userId = await requireUserId();

  const parsed = editProductSchema.safeParse({
    productId: formData.get("productId"),
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { productId, name, sku } = parsed.data;

  const result = await prisma.product.updateMany({
    where: { id: productId, userId },
    data: { name, sku: sku || null },
  });

  if (result.count === 0) {
    return { error: "Product not found." };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  redirect(`/products/${productId}`);
}

export async function setProductArchived(productId: string, archived: boolean) {
  const userId = await requireUserId();

  await prisma.product.updateMany({
    where: { id: productId, userId },
    data: { archived },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}
