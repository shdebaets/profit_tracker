"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Archive, ArchiveRestore } from "lucide-react";
import { setProductArchived } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";

export function ArchiveProductButton({
  productId,
  archived,
}: {
  productId: string;
  archived: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await setProductArchived(productId, !archived);
      toast.success(archived ? "Product unarchived" : "Product archived");
    });
  };

  return (
    <Button variant="outline" onClick={handleClick} disabled={isPending}>
      {archived ? <ArchiveRestore /> : <Archive />}
      {archived ? "Unarchive" : "Archive"}
    </Button>
  );
}
