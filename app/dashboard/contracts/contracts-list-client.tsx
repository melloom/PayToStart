"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import type { Contract, ContractDraft } from "@/lib/types";
import { 
  FileText, 
  Plus, 
  Search, 
  X, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  User,
  Calendar,
  ArrowRight,
  Filter,
  Pen,
  Trash2,
  AlertTriangle
} from "lucide-react";

interface ContractWithClient extends Contract {
  clientName: string;
}

type FilterType = "all" | "sent" | "signed" | "paid" | "completed" | "draft" | "cancelled" | "drafts";

export default function ContractsListClient({
  contracts,
  drafts = [],
  initialFilter,
}: {
  contracts: ContractWithClient[];
  drafts?: ContractDraft[];
  initialFilter?: string;
}) {
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterType>((initialFilter as FilterType) || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [localDrafts, setLocalDrafts] = useState<ContractDraft[]>(drafts);

  // Update localDrafts when drafts prop changes (only if different)
  useEffect(() => {
    setLocalDrafts((prevDrafts) => {
      if (drafts.length !== prevDrafts.length || 
          drafts.some((d, i) => d.id !== prevDrafts[i]?.id)) {
        return drafts;
      }
      return prevDrafts;
    });
  }, [drafts]);

  const filteredContracts = useMemo(() => {
    let filtered = contracts;
    
    // Apply status filter (only filter contracts if not viewing drafts)
    if (filter !== "all" && filter !== "drafts") {
      filtered = filtered.filter((c) => c.status === filter);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.clientName.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [contracts, filter, searchQuery]);

  const filteredDrafts = useMemo(() => {
    if (filter !== "all" && filter !== "drafts") {
      return [];
    }
    
    let filtered = localDrafts;
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.id.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [localDrafts, filter, searchQuery]);

  const handleDeleteDraft = async (draftId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmed = window.confirm("Are you sure you want to delete this draft? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    setDeletingDraftId(draftId);
    try {
      const response = await fetch(`/api/drafts/contracts?id=${draftId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        setLocalDrafts(localDrafts.filter(d => d.id !== draftId));
        toast({
          title: "Draft deleted",
          description: "The draft has been permanently deleted.",
        });
      } else {
        console.error("Delete draft error:", result);
        throw new Error(result.error || "Failed to delete draft");
      }
    } catch (error: any) {
      console.error("Error deleting draft:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingDraftId(null);
    }
  };

  const handleDeleteAllDraftsClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (localDrafts.length === 0) {
      toast({
        title: "No drafts",
        description: "You don't have any drafts to delete.",
      });
      return;
    }

    setShowDeleteAllDialog(true);
  };

  const handleConfirmDeleteAll = async () => {
    setShowDeleteAllDialog(false);
    setDeletingAll(true);
    
    try {
      const response = await fetch(`/api/drafts/contracts?all=true`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        setLocalDrafts([]);
        toast({
          title: "All drafts deleted",
          description: `Successfully deleted ${result.deletedCount || localDrafts.length} draft(s) from the database.`,
        });
      } else {
        console.error("Delete all drafts error:", result);
        throw new Error(result.error || "Failed to delete all drafts");
      }
    } catch (error: any) {
      console.error("Error deleting all drafts:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete all drafts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingAll(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; className?: string; icon?: React.ReactNode }> = {
      draft: { 
        variant: "outline", 
        className: "bg-slate-700/50 text-slate-300 border-slate-600",
        icon: <FileText className="h-3 w-3" />
      },
      sent: { 
        variant: "secondary", 
        className: "bg-amber-900/50 text-amber-300 border-amber-700",
        icon: <Clock className="h-3 w-3" />
      },
      signed: { 
        variant: "default", 
        className: "bg-green-900/50 text-green-300 border-green-700",
        icon: <CheckCircle2 className="h-3 w-3" />
      },
      paid: { 
        variant: "default", 
        className: "bg-blue-900/50 text-blue-300 border-blue-700",
        icon: <DollarSign className="h-3 w-3" />
      },
      completed: { 
        variant: "default", 
        className: "bg-purple-900/50 text-purple-300 border-purple-700",
        icon: <CheckCircle2 className="h-3 w-3" />
      },
      cancelled: { 
        variant: "destructive", 
        className: "bg-red-900/50 text-red-300 border-red-700",
        icon: <X className="h-3 w-3" />
      },
    };

    const config = statusConfig[status] || { variant: "outline", className: "", icon: null };

    return (
      <Badge variant={config.variant} className={`${config.className} flex items-center gap-1`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filters: { value: FilterType; label: string; icon: React.ReactNode }[] = [
    { value: "all", label: "All", icon: <FileText className="h-4 w-4" /> },
    { value: "drafts", label: "Drafts", icon: <Pen className="h-4 w-4" /> },
    { value: "sent", label: "Sent", icon: <Clock className="h-4 w-4" /> },
    { value: "signed", label: "Signed", icon: <CheckCircle2 className="h-4 w-4" /> },
    { value: "paid", label: "Paid", icon: <DollarSign className="h-4 w-4" /> },
    { value: "completed", label: "Completed", icon: <CheckCircle2 className="h-4 w-4" /> },
    { value: "draft", label: "Draft", icon: <FileText className="h-4 w-4" /> },
    { value: "cancelled", label: "Cancelled", icon: <X className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="border-2 border-slate-700/50 shadow-xl bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center border border-indigo-500/20">
                <Filter className="h-5 w-5 text-indigo-400" />
              </div>
              <Badge variant="outline" className="bg-slate-700/50 text-slate-200 border-slate-600/50">
                {filter === "drafts" 
                  ? `${filteredDrafts.length} ${filteredDrafts.length === 1 ? "draft" : "drafts"}`
                  : `${filteredContracts.length} ${filteredContracts.length === 1 ? "contract" : "contracts"}`}
              </Badge>
            </div>
            <div className="relative w-full lg:w-auto lg:min-w-[350px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by title, client, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-slate-700/30 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.map((f) => {
              const count = f.value === "all" 
                ? contracts.length + localDrafts.length
                : f.value === "drafts"
                ? localDrafts.length
                : contracts.filter((c) => c.status === f.value).length;
              return (
                <Button
                  key={f.value}
                  variant={filter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f.value)}
                  className={
                    filter === f.value
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md flex items-center gap-2"
                      : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white bg-slate-700/50 flex items-center gap-2"
                  }
                >
                  {f.icon}
                  {f.label}
                  <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drafts Section */}
      {(filter === "all" || filter === "drafts") && filteredDrafts.length > 0 && (
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Pen className="h-5 w-5 text-amber-400" />
                Drafts ({filteredDrafts.length})
              </h2>
              <p className="text-sm text-slate-400 mt-1">Continue editing your work-in-progress</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAllDraftsClick}
              disabled={deletingAll || localDrafts.length === 0}
              className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:text-red-300 hover:border-red-500"
            >
              {deletingAll ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All ({localDrafts.length})
                </>
              )}
            </Button>
          </div>

          {/* Delete All Confirmation Dialog */}
          <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <DialogTitle className="text-xl font-bold">Delete All Drafts?</DialogTitle>
                </div>
                <DialogDescription className="text-slate-400 pt-2">
                  Are you sure you want to delete ALL {localDrafts.length} draft(s)? This action cannot be undone and will permanently remove all your saved drafts from the database.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteAllDialog(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDeleteAll}
                  disabled={deletingAll}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deletingAll ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All {localDrafts.length} Drafts
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrafts
              .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
              .map((draft) => (
                <div key={draft.id} className="relative group">
                  <Link
                    href={`/dashboard/contracts/new?draftId=${draft.id}`}
                    className="block"
                  >
                    <div className="border-2 border-amber-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm hover:border-amber-500/80 hover:shadow-xl hover:shadow-amber-500/10 transition-all h-full flex flex-col group rounded-xl overflow-hidden">
                      <div className="border-b border-amber-700/30 bg-gradient-to-r from-amber-900/20 to-amber-800/20 group-hover:from-amber-900/30 group-hover:to-amber-800/30 transition-colors p-5 relative">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0 pr-8">
                            <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
                              {draft.title || "Untitled Draft"}
                            </h3>
                            <Badge variant="outline" className="bg-amber-900/50 text-amber-300 border-amber-700 flex items-center gap-1">
                              <Pen className="h-3 w-3" />
                              Draft
                            </Badge>
                          </div>
                          <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-amber-400 transition-colors flex-shrink-0 mt-1 absolute top-5 right-5" />
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <span className="text-sm">Updated {format(draft.updatedAt, "MMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                          {draft.content && (
                            <div className="pt-2">
                              <p className="text-xs text-slate-400 mb-1">Preview</p>
                              <p className="text-sm text-slate-300 line-clamp-3">{draft.content.substring(0, 150)}...</p>
                            </div>
                          )}
                          <div className="pt-3 border-t border-slate-700 mt-auto">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-amber-400 font-medium">Continue Editing →</span>
                              <div className="flex items-center gap-2">
                                {Object.keys(draft.fieldValues || {}).length > 0 && (
                                  <span className="text-xs text-slate-500">
                                    {Object.keys(draft.fieldValues).length} field{Object.keys(draft.fieldValues).length !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteDraft(draft.id, e);
                    }}
                    disabled={deletingDraftId === draft.id}
                    className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-600/50 hover:border-red-500 z-20"
                    title="Delete draft"
                  >
                    {deletingDraftId === draft.id ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Contracts Section */}
      {(filter === "all" || filter !== "drafts") && (
        <>
          {filter === "all" && localDrafts.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                Contracts ({filteredContracts.length})
              </h2>
            </div>
          )}

      {/* Contracts Grid */}
      {filteredContracts.length === 0 && ((filter as FilterType) !== "drafts" || filteredDrafts.length === 0) ? (
        <div className="border-2 border-slate-700/50 shadow-xl bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
          <div className="p-16">
            <div className="text-center max-w-lg mx-auto">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600/30 via-indigo-600/30 to-purple-600/30 flex items-center justify-center mx-auto shadow-2xl">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 blur-xl"></div>
                  <FileText className="h-12 w-12 text-indigo-300 relative z-10" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                {searchQuery 
                  ? "No contracts found" 
                  : (filter as FilterType) === "drafts"
                    ? "No Drafts Yet"
                    : filter === "all" 
                    ? filteredDrafts.length > 0 
                      ? "No Contracts Yet"
                      : "Start Creating Contracts"
                    : `No ${filter} contracts`}
              </h3>
              <p className="text-slate-300 text-lg mb-2 leading-relaxed">
                {searchQuery
                  ? `We couldn&apos;t find any contracts matching "${searchQuery}".`
                  : (filter as FilterType) === "drafts"
                    ? "You don&apos;t have any saved drafts. Start creating a contract and save it as a draft to continue later."
                    : filter === "all" 
                    ? filteredDrafts.length > 0
                      ? "You have drafts but no completed contracts yet. Continue editing your drafts or create a new contract."
                      : "Your contract dashboard is ready. Create your first professional contract in minutes."
                    : `You don&apos;t have any ${filter} contracts at the moment.`}
              </p>
              {searchQuery && (
                <p className="text-slate-400 text-sm mb-6">
                  Try adjusting your search terms or filters to find what you&apos;re looking for.
                </p>
              )}
              {filter === "all" && !searchQuery && (
                <div className="mt-8">
                  <Link href="/dashboard/contracts/new">
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all font-semibold px-8 py-6 text-base">
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Contract
                    </Button>
                  </Link>
                  <p className="text-slate-500 text-sm mt-4">
                    Quick, easy, and professional contract creation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContracts
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map((contract) => (
              <Link
                key={contract.id}
                href={`/dashboard/contracts/${contract.id}`}
                prefetch={true}
                className="group"
              >
                <div className="border-2 border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm hover:border-indigo-500/80 hover:shadow-xl hover:shadow-indigo-500/10 transition-all h-full flex flex-col group rounded-xl overflow-hidden">
                  <div className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-slate-700/30 group-hover:from-slate-800/50 group-hover:to-slate-700/50 transition-colors p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
                          {contract.title}
                        </h3>
                        {getStatusBadge(contract.status)}
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 text-slate-300">
                        <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm truncate">{contract.clientName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm">{format(contract.createdAt, "MMM d, yyyy")}</span>
                      </div>

                      {contract.signedAt && (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">Signed {format(contract.signedAt, "MMM d, yyyy")}</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-700 mt-auto">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Total Amount</p>
                            <p className="text-2xl font-bold text-white">
                              ${contract.totalAmount.toFixed(2)}
                            </p>
                          </div>
                          {contract.depositAmount > 0 && (
                            <div className="text-right">
                              <p className="text-xs text-slate-400 mb-1">Deposit</p>
                              <p className="text-sm font-semibold text-indigo-400">
                                ${contract.depositAmount.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {contract.status === "paid" || contract.status === "completed" ? (
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <div className="flex items-center gap-2 text-green-400">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm font-semibold">Payment Received</span>
                            </div>
                          </div>
                        ) : contract.status === "signed" ? (
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <div className="flex items-center gap-2 text-amber-400">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-semibold">Awaiting Payment</span>
                            </div>
                          </div>
                        ) : contract.status === "sent" ? (
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <div className="flex items-center gap-2 text-amber-400">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-semibold">Awaiting Signature</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
        </>
      )}
    </div>
  );
}
