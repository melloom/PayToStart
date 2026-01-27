"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Palette, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpdateStyleButtonProps {
  contractId: string;
}

export function UpdateStyleButton({ contractId }: UpdateStyleButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleUpdateStyle = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/update-style`, {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Style updated",
          description: "Contract style has been updated successfully.",
        });
        router.refresh();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update style",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      onClick={handleUpdateStyle}
      disabled={isUpdating}
      variant="outline"
      size="sm"
      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
    >
      {isUpdating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Updating...
        </>
      ) : (
        <>
          <Palette className="h-4 w-4 mr-2" />
          Update Style
        </>
      )}
    </Button>
  );
}
