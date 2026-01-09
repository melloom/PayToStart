"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2 } from "lucide-react";
import type { ContractTemplate } from "@/lib/types";

const fieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required"),
  type: z.enum(["text", "number", "date", "textarea"]),
  required: z.boolean(),
  placeholder: z.string().optional(),
});

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  content: z.string().min(1, "Content is required"),
  fields: z.array(fieldSchema).default([]),
});

type TemplateForm = z.infer<typeof templateSchema>;

export default function EditTemplateForm({ template }: { template: ContractTemplate }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template.name,
      content: template.content,
      fields: template.fields,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  const addField = () => {
    append({
      id: `field-${Date.now()}`,
      label: "",
      type: "text",
      required: false,
      placeholder: "",
    });
  };

  const onSubmit = async (data: TemplateForm) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Template updated",
          description: "Template has been updated successfully.",
        });
        router.push("/dashboard/templates");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update template",
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
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Template</CardTitle>
          <CardDescription>
            Update your contract template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                placeholder="Website Development Contract"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Template Content *</Label>
              <Textarea
                id="content"
                placeholder="Enter your contract template content. Use {{fieldName}} to insert field values."
                rows={15}
                {...register("content")}
              />
              {errors.content && (
                <p className="text-sm text-destructive">
                  {errors.content.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Use double curly braces like {"{{fieldName}}"} to insert field values in your template.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Template Fields</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addField}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No fields yet. Add fields to make your template dynamic.
                </p>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <div className="flex-1 space-y-2">
                              <Label>Field Label *</Label>
                              <Input
                                {...register(`fields.${index}.label`)}
                                placeholder="Project Name"
                              />
                              {errors.fields?.[index]?.label && (
                                <p className="text-sm text-destructive">
                                  {errors.fields[index]?.label?.message}
                                </p>
                              )}
                            </div>
                            <div className="w-40 space-y-2">
                              <Label>Type *</Label>
                              <select
                                {...register(`fields.${index}.type`)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="textarea">Textarea</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Placeholder (Optional)</Label>
                            <Input
                              {...register(`fields.${index}.placeholder`)}
                              placeholder="Enter project name"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                {...register(`fields.${index}.required`)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <span className="text-sm">Required field</span>
                            </label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Template"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

