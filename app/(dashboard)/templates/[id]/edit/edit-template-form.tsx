"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  Plus, 
  Trash2, 
  FileText, 
  Sparkles, 
  Eye, 
  Loader2, 
  ChevronLeft,
  HelpCircle,
  AlertCircle,
  Zap
} from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
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
    watch,
    formState: { errors },
  } = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template.name,
      content: template.content,
      fields: template.fields || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  const watchedContent = watch("content");
  const watchedFields = watch("fields");

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

  // Generate preview content with field placeholders
  const getPreviewContent = () => {
    let preview = watchedContent || "";
    watchedFields?.forEach((field) => {
      if (field.label) {
        const placeholder = field.placeholder || `[${field.label}]`;
        const regex = new RegExp(`\\{\\{${field.id}\\}\\}`, "g");
        preview = preview.replace(regex, placeholder);
      }
    });
    return preview;
  };

  // Extract all field placeholders from content
  const fieldPlaceholdersInContent = useMemo(() => {
    if (!watchedContent) return [];
    const matches = watchedContent.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
  }, [watchedContent]);

  // Check for orphaned placeholders
  const orphanedPlaceholders = useMemo(() => {
    const definedFieldIds = watchedFields?.map(f => f.id) || [];
    return fieldPlaceholdersInContent.filter(id => !definedFieldIds.includes(id));
  }, [fieldPlaceholdersInContent, watchedFields]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/templates">
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600/40 to-purple-600/40 flex items-center justify-center border-2 border-indigo-500/40 shadow-lg shadow-indigo-500/20">
                  <Sparkles className="h-7 w-7 text-indigo-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Edit Template
                  </h1>
                  <p className="text-slate-400 mt-1 flex items-center gap-2">
                    Update and customize your contract template
                    <span className="flex items-center gap-1 text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      <Zap className="h-3 w-3" />
                      Dynamic Fields
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-6">
            <div className="border-2 border-slate-700/50 shadow-2xl bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:border-slate-600/50">
              <div className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-indigo-400" />
                  Template Details
                </h2>
                <p className="text-sm text-slate-400 mt-1">Edit the template information below</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300 flex items-center gap-2">
                      Template Name *
                      <div className="group relative">
                        <HelpCircle className="h-4 w-4 text-slate-500 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-slate-900 text-xs text-slate-300 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          Choose a descriptive name for your template
                        </div>
                      </div>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Website Development Contract"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-slate-300 flex items-center gap-2">
                      Template Content *
                      <div className="group relative">
                        <HelpCircle className="h-4 w-4 text-slate-500 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 w-72 p-2 bg-slate-900 text-xs text-slate-300 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          Write your contract content. Use {"{{fieldId}}"} to insert dynamic field values.
                        </div>
                      </div>
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Enter your contract template content. Use {{fieldId}} to insert field values."
                      rows={12}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                      {...register("content")}
                    />
                    {errors.content && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.content.message}
                      </p>
                    )}
                    {orphanedPlaceholders.length > 0 && (
                      <div className="p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                        <p className="text-xs text-amber-300 flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-semibold">Unused placeholders found:</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {orphanedPlaceholders.map((id) => (
                            <span key={id} className="text-xs font-mono bg-amber-900/30 text-amber-200 px-2 py-1 rounded border border-amber-700/50">
                              {"{{"}{id}{"}}"}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-amber-400/80 mt-2">
                          Create fields with matching IDs or remove these placeholders from your content.
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span>💡</span>
                      <span>Use double curly braces like {"{{fieldId}}"} to insert field values. The fieldId should match the field's ID.</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-slate-300 flex items-center gap-2">
                        Template Fields
                        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                          {fields.length} {fields.length === 1 ? 'field' : 'fields'}
                        </span>
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addField}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all duration-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>

                    {fields.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg">
                        <p className="text-sm text-slate-400 mb-4">
                          No fields yet. Add fields to make your template dynamic.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addField}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Field
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <div key={field.id} className="border-2 border-slate-700/50 bg-slate-800/30 rounded-lg p-4">
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <div className="flex-1 space-y-2">
                                  <Label className="text-slate-300">Field Label *</Label>
                                  <Input
                                    {...register(`fields.${index}.label`)}
                                    placeholder="Project Name"
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                  />
                                  {errors.fields?.[index]?.label && (
                                    <p className="text-sm text-red-400">
                                      {errors.fields[index]?.label?.message}
                                    </p>
                                  )}
                                </div>
                                <div className="w-40 space-y-2">
                                  <Label className="text-slate-300">Type *</Label>
                                  <select
                                    {...register(`fields.${index}.type`)}
                                    className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                  >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="date">Date</option>
                                    <option value="textarea">Textarea</option>
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300">Placeholder (Optional)</Label>
                                <Input
                                  {...register(`fields.${index}.placeholder`)}
                                  placeholder="Enter project name"
                                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                />
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <Controller
                                    name={`fields.${index}.required`}
                                    control={control}
                                    render={({ field }) => (
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="border-slate-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                      />
                                    )}
                                  />
                                  <span className="text-sm text-slate-300">Required field</span>
                                </label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => remove(index)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              </div>
                              <div className="text-xs text-slate-500 bg-slate-900/50 p-2 rounded">
                                <span className="font-mono">Field ID: {field.id}</span>
                                <span className="text-slate-600 mx-2">•</span>
                                <span>Use {"{{"}{field.id}{"}}"} in your content</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t border-slate-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Template"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="border-2 border-slate-700/50 shadow-xl bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Eye className="h-6 w-6 text-indigo-400" />
                  Live Preview
                </h2>
              </div>
              <div className="p-6">
                <div className="bg-white rounded-lg p-6 min-h-[400px] shadow-inner">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {watch("name") || "Template Name"}
                  </h3>
                  <div className="prose max-w-none whitespace-pre-wrap text-slate-700">
                    {getPreviewContent() || "Start typing your template content to see the preview..."}
                  </div>
                </div>
                {watchedFields && watchedFields.length > 0 && (
                  <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-xs font-semibold text-slate-300 mb-2">Field Placeholders:</p>
                    <div className="space-y-1">
                      {watchedFields.map((field, idx) => (
                        <div key={idx} className="text-xs text-slate-400 font-mono">
                          {"{{"}{field.id}{"}}"} → {field.label || "Unnamed field"}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
