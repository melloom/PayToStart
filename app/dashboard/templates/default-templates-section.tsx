"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Download, FileText, Loader2, Sparkles, ChevronDown, ChevronUp, Filter } from "lucide-react";

interface DefaultTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  fields: any[];
  contract_type?: "contract" | "proposal";
}

type ContractTypeFilter = "all" | "contract" | "proposal";

export default function DefaultTemplatesSection() {
  const router = useRouter();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<DefaultTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [contractTypeFilter, setContractTypeFilter] = useState<ContractTypeFilter>("all");

  const fetchDefaultTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const url = contractTypeFilter === "all" 
        ? "/api/templates/default"
        : `/api/templates/default?contractType=${contractTypeFilter}`;
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        setTemplates(result.templates || []);
      }
    } catch (error) {
      console.error("Error fetching default templates:", error);
    } finally {
      setLoading(false);
    }
  }, [contractTypeFilter]);

  useEffect(() => {
    fetchDefaultTemplates();
  }, [fetchDefaultTemplates]);

  const handleImport = async (templateId: string) => {
    setImportingId(templateId);
    try {
      const response = await fetch("/api/templates/default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      if (response.ok) {
        toast({
          title: "Template imported",
          description: "Template has been imported successfully. You can now customize it.",
        });
        router.refresh();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to import template",
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
      setImportingId(null);
    }
  };

  if (loading) {
    return (
      <div className="border-2 border-slate-700/50 shadow-xl bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="border-2 border-slate-700/50 shadow-xl bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center border border-indigo-500/20 flex-shrink-0">
                <Sparkles className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white mb-1">Default Templates</h2>
                <p className="text-sm text-slate-400">
                  Import professional, legally-compliant contract templates
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-5 w-5 mr-2" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="h-5 w-5 mr-2" />
                  Expand
                </>
              )}
            </Button>
          </div>
        </div>
        {isExpanded && (
          <div className="p-6">
            {/* Contract Type Filter */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400 font-medium">Filter by type:</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={contractTypeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setContractTypeFilter("all")}
                  className={
                    contractTypeFilter === "all"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
                      : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-indigo-500"
                  }
                >
                  All
                </Button>
                <Button
                  variant={contractTypeFilter === "contract" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setContractTypeFilter("contract")}
                  className={
                    contractTypeFilter === "contract"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
                      : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-indigo-500"
                  }
                >
                  Standard Contracts
                </Button>
                <Button
                  variant={contractTypeFilter === "proposal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setContractTypeFilter("proposal")}
                  className={
                    contractTypeFilter === "proposal"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
                      : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-indigo-500"
                  }
                >
                  Proposal Contracts
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {templates.map((template) => (
              <div
                key={template.id}
                className="border-2 border-slate-700/50 bg-slate-800/30 rounded-lg p-5 hover:border-indigo-500/80 transition-all group flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 flex-1 pr-2">
                    {template.name}
                  </h4>
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center border border-indigo-500/20 flex-shrink-0">
                    <FileText className="h-4 w-4 text-indigo-400" />
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-4 line-clamp-3 flex-1">
                  {template.description}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <span>{template.fields?.length || 0} fields</span>
                  <span className="px-2 py-1 bg-slate-700/50 rounded text-slate-300">
                    {template.category}
                  </span>
                </div>
                <Button
                  onClick={() => handleImport(template.id)}
                  disabled={importingId === template.id}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white mt-auto"
                  size="sm"
                >
                  {importingId === template.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Import Template
                    </>
                  )}
                </Button>
              </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
