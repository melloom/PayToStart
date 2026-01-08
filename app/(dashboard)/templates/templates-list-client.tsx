"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus, FileText, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { ContractTemplate } from "@/lib/types";

export default function TemplatesListClient({ templates }: { templates: ContractTemplate[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Template deleted",
          description: "Template has been deleted successfully.",
        });
        router.refresh();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to delete template",
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
      setDeletingId(null);
    }
  };

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first template to get started with contract creation.
          </p>
          <Link href="/dashboard/templates/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card key={template.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-start justify-between">
              <span>{template.name}</span>
            </CardTitle>
            <CardDescription>
              {template.fields.length} field{template.fields.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 mb-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {template.content.substring(0, 150)}
                {template.content.length > 150 ? "..." : ""}
              </p>
            </div>
            <div className="text-xs text-muted-foreground mb-4">
              Updated {format(template.updatedAt, "MMM d, yyyy")}
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/templates/${template.id}/edit`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                onClick={() => handleDelete(template.id)}
                variant="outline"
                className="flex-1 text-destructive hover:text-destructive"
                disabled={deletingId === template.id}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deletingId === template.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

