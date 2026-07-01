"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { dollarsToCents } from "@/lib/format";

export type BatchFormState = { error?: string };

const addBatchSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .positive("Quantity must be greater than 0."),
  unitCost: z.coerce.number().min(0, "Cost can't be negative."),
});

export async function addBatch(
  _prevState: BatchFormState,
  formData: FormData,
): Promise<BatchFormState> {
  const userId = await requireUserId();

  const parsed = addBatchSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
    unitCost: formData.get("unitCost"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { productId, quantity, unitCost } = parsed.data;

  const product = await prisma.product.findFirst({
    where: { id: productId, userId },
    select: { id: true },
  });
  if (!product) {
    return { error: "Product not found." };
  }

  await prisma.productBatch.create({
    data: {
      productId,
      userId,
      quantity,
      unitCostCents: dollarsToCents(unitCost),
    },
  });

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
  redirect(`/products/${productId}`);
}
