"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { dollarsToCents } from "@/lib/format";
import { getProductStock } from "@/lib/analytics";

export type SaleFormState = { error?: string };

const recordSaleSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .positive("Quantity must be greater than 0."),
  unitPrice: z.coerce.number().min(0, "Price can't be negative."),
});

export async function recordSale(
  _prevState: SaleFormState,
  formData: FormData,
): Promise<SaleFormState> {
  const userId = await requireUserId();

  const parsed = recordSaleSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
    unitPrice: formData.get("unitPrice"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { productId, quantity, unitPrice } = parsed.data;

  const product = await prisma.product.findFirst({
    where: { id: productId, userId },
    select: { id: true },
  });
  if (!product) {
    return { error: "Product not found." };
  }

  const stock = await getProductStock(productId);
  if (quantity > stock.remaining) {
    return {
      error: `Only ${stock.remaining} unit(s) left in stock for this product.`,
    };
  }

  await prisma.sale.create({
    data: {
      productId,
      userId,
      quantity,
      unitPriceCents: dollarsToCents(unitPrice),
      unitCostAtSaleCents: stock.avgUnitCostCents,
    },
  });

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
  revalidatePath("/dashboard");
  redirect(`/products/${productId}`);
}
