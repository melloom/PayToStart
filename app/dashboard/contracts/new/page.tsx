"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  UserPlus, 
  Sparkles, 
  FolderOpen, 
  Plus, 
  Loader2,
  DollarSign,
  Eye,
  CheckCircle2,
  Copy,
  Type,
  Calendar,
  Hash,
  AlignLeft,
  GripVertical,
  Wand2,
  Shield,
  Briefcase,
  Scale,
  Trash2,
  Clock,
  MapPin,
  Globe,
  Building,
  User,
  CreditCard,
  FileCheck,
  AlertTriangle,
  Handshake,
  Award,
  Target,
  Zap,
  RefreshCw,
  Lock,
  Pen,
  Mail,
  Phone,
  Code,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Info,
  CheckSquare,
  XCircle,
  HelpCircle,
  ListChecks,
  SpellCheck2,
  Download,
  Upload,
  FileUp,
  FileDown,
  Send,
  Printer,
  FileType,
  FileType2,
  X
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ContractTemplate } from "@/lib/types";
import type { Client } from "@/lib/types";

type Step = 1 | 2 | 3 | 4 | 5;

interface ContractData {
  templateId?: string;
  template?: ContractTemplate;
  clientId?: string;
  client?: Client;
  newClient?: {
    name: string;
    email: string;
    phone?: string;
  };
  fieldValues: Record<string, string>;
  depositAmount: string;
  totalAmount: string;
  title: string;
  content: string;
  hasCompensation?: boolean;
  compensationType?: "no_compensation" | "fixed_amount" | "hourly" | "milestone" | "other";
  paymentTerms?: string;
  hourlyRate?: string;
  milestonePayments?: Array<{ name: string; amount: string; dueDate: string }>;
  paymentSchedule?: "upfront" | "partial" | "full" | "split" | "incremental";
  paymentScheduleConfig?: {
    numberOfPayments?: number;
    paymentDates?: Array<{ date: string; amount: string; percentage?: string }>;
    depositPercentage?: string;
    balanceDueDate?: string;
    paymentFrequency?: "weekly" | "biweekly" | "monthly" | "quarterly";
    firstPaymentDate?: string;
    paymentAfterSigning?: {
      amount?: string;
      dueDate?: string;
    };
  };
  paymentMethods?: string[];
  insertPaymentIntoContract?: boolean;
  extractedFields?: Array<{
    id: string;
    label: string;
    type: "text" | "textarea" | "date" | "number";
    placeholder: string;
    required: boolean;
  }>;
  detectedClientInfo?: {
    name?: string;
    email?: string;
  };
}

export default function NewContractPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  // Initialize step - always start at 1 on server, will be updated on client if needed
  const [step, setStep] = useState<Step | null>(1);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [defaultTemplates, setDefaultTemplates] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingDefaultTemplates, setLoadingDefaultTemplates] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [useNewClient, setUseNewClient] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [draftIdFromUrl, setDraftIdFromUrl] = useState<string | null>(null);
  const loadedDraftIdRef = useRef<string | null>(null);
  const [isAIReview, setIsAIReview] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [aiGenerationParams, setAIGenerationParams] = useState<{
    description: string;
    contractType?: string;
    additionalDetails?: string;
  } | null>(null);

  const [data, setData] = useState<ContractData>({
    fieldValues: {},
    depositAmount: "0",
    totalAmount: "0",
    title: "",
    content: "",
    hasCompensation: false,
    compensationType: "no_compensation",
  });

  const [hasAIAccess, setHasAIAccess] = useState<boolean | null>(null);
  const [hasBrandingAccess, setHasBrandingAccess] = useState<boolean | null>(null);

  // Get draftId from URL search params - check immediately on mount (client-side only)
  useEffect(() => {
    const draftId = searchParams?.get("draftId");
    if (draftId) {
      // Only update if it's a different draftId
      if (draftId !== draftIdFromUrl) {
        setDraftIdFromUrl(draftId);
        // Reset loaded ref when draftId changes
        loadedDraftIdRef.current = null;
        // Don't set step yet - wait for draft to load
        setIsInitializing(true);
        // Clear step while loading draft
        setStep(null);
      }
    } else {
      // No draftId in URL - reset everything for new contract
      setDraftIdFromUrl(null);
      loadedDraftIdRef.current = null;
      // Start at step 1 for new contract
      setStep(1);
      setIsInitializing(false);
    }
  }, [searchParams, draftIdFromUrl]);

  useEffect(() => {
    fetchTemplates();
    fetchDefaultTemplates();
    fetchClients();
    
    // Check AI feature access
    const checkAIAccess = async () => {
      try {
        const response = await fetch("/api/subscriptions/check-feature?feature=aiContractGeneration");
        const data = await response.json();
        setHasAIAccess(data.hasAccess || false);
      } catch (error) {
        console.error("Error checking AI access:", error);
        setHasAIAccess(false);
      }
    };
    
    // Check Branding feature access
    const checkBrandingAccess = async () => {
      try {
        const response = await fetch("/api/subscriptions/check-feature?feature=customBranding");
        const data = await response.json();
        setHasBrandingAccess(data.hasAccess || false);
      } catch (error) {
        console.error("Error checking branding access:", error);
        setHasBrandingAccess(false);
      }
    };
    
    checkAIAccess();
    checkBrandingAccess();
  }, []);

  // Load draft if draftId is in URL
  const loadDraftFromDatabase = useCallback(async (id: string) => {
    // Prevent reloading if this exact draft was already loaded
    if (loadedDraftIdRef.current === id) {
      console.log("Draft already loaded, skipping:", id);
      return;
    }
    
    setLoadingDraft(true);
    try {
      const response = await fetch(`/api/drafts/contracts/${id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.draft) {
          const draft = result.draft;
          const metadata = draft.metadata || {};
          
          console.log("Loading draft:", { id, draft, metadata });
          
          // Restore all data including compensation and extracted fields
          const restoredData: ContractData = {
            fieldValues: draft.fieldValues || {},
            depositAmount: draft.depositAmount?.toString() || "0",
            totalAmount: draft.totalAmount?.toString() || "0",
            title: draft.title || "",
            content: draft.content || "",
            clientId: draft.clientId,
            templateId: draft.templateId,
            hasCompensation: metadata.hasCompensation ?? false,
            compensationType: metadata.compensationType || "no_compensation",
            paymentTerms: metadata.paymentTerms || "",
            extractedFields: metadata.extractedFields || undefined,
            detectedClientInfo: metadata.detectedClientInfo || undefined,
          };
          
          setData(restoredData);
          
          // Restore AI review state if applicable
          if (metadata.isAIReview) {
            setIsAIReview(true);
            if (metadata.aiGenerationParams) {
              setAIGenerationParams(metadata.aiGenerationParams);
            }
          }
          
          // Fetch client and template details if they exist (in parallel)
          const promises: Promise<void>[] = [];
          
          if (draft.clientId) {
            promises.push(
              fetch(`/api/clients/${draft.clientId}`)
                .then(async (clientResponse) => {
                  if (clientResponse.ok) {
                    const clientData = await clientResponse.json();
                    setData((prev: ContractData) => ({ ...prev, client: clientData.client }));
                  }
                })
                .catch(err => console.error("Error fetching client:", err))
            );
          }
          
          if (draft.templateId) {
            promises.push(
              fetch(`/api/templates/${draft.templateId}`)
                .then(async (templateResponse) => {
                  if (templateResponse.ok) {
                    const templateData = await templateResponse.json();
                    setData((prev: ContractData) => ({ ...prev, template: templateData.template }));
                  }
                })
                .catch(err => console.error("Error fetching template:", err))
            );
          }
          
          // Wait for all async operations to complete
          await Promise.all(promises);
          
          // Restore the step where user left off AFTER all data is loaded
          // ALWAYS use the saved step from metadata if it exists
          let stepToRestore: Step = 1;
          
          if (metadata.step && typeof metadata.step === 'number' && metadata.step >= 1 && metadata.step <= 5) {
            // Use the saved step from metadata - this is the step the user was on
            stepToRestore = metadata.step as Step;
            console.log("Restoring to saved step from metadata:", stepToRestore);
          } else {
            // Fallback: determine step based on what data exists
            // Only use this if step wasn't saved in metadata
            if (metadata.isAIReview) {
              // AI review, stay on step 1
              stepToRestore = 1;
            } else if (draft.templateId && !draft.clientId) {
              // Only template is set, go to step 2 (choose client)
              stepToRestore = 2;
            } else if (draft.clientId && draft.templateId && draft.content && draft.content.trim().length > 0) {
              // Both client and template are set, and there's content - likely on step 3 or later
              // But don't assume - check if we have compensation data to determine step
              if (metadata.hasCompensation !== undefined || metadata.paymentTerms) {
                // Has compensation data, likely on step 4 or 5
                stepToRestore = 4;
              } else {
                // No compensation data yet, likely on step 3
                stepToRestore = 3;
              }
            } else if (draft.clientId && draft.templateId) {
              // Both client and template are set but no content - step 3
              stepToRestore = 3;
            } else {
              // Otherwise start at step 1
              stepToRestore = 1;
            }
            console.log("No saved step in metadata, using fallback logic:", stepToRestore);
          }
          
          console.log("Restoring to step:", stepToRestore, "with data:", restoredData);
          // Set step and mark as initialized BEFORE showing toast to prevent visual jump
          setStep(stepToRestore);
          setIsInitializing(false);
          loadedDraftIdRef.current = id; // Mark this specific draft as loaded
          
          // Small delay before toast to ensure smooth transition
          setTimeout(() => {
            toast({ 
              title: "Draft loaded", 
              description: `Your draft has been restored. Continue editing from step ${stepToRestore}...` 
            });
          }, 100);
        }
      } else {
        // Draft not found - start fresh at step 1
        setStep(1);
        setIsInitializing(false);
        loadedDraftIdRef.current = id; // Mark as attempted to prevent infinite retries
        toast({ title: "Draft not found", description: "Could not load the draft. Starting fresh.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error loading draft:", error);
      // On error - start fresh at step 1
      setStep(1);
      setIsInitializing(false);
      loadedDraftIdRef.current = id; // Mark as attempted even on error
      toast({ title: "Error", description: "Failed to load draft", variant: "destructive" });
    } finally {
      setLoadingDraft(false);
    }
  }, [setData, setIsAIReview, setAIGenerationParams, setStep, toast]);

  useEffect(() => {
    if (draftIdFromUrl && loadedDraftIdRef.current !== draftIdFromUrl) {
      loadDraftFromDatabase(draftIdFromUrl);
    }
  }, [draftIdFromUrl, loadDraftFromDatabase]);

  // Save step to draft whenever step changes (so refresh restores correct step)
  useEffect(() => {
    if (step && step >= 1 && step <= 5 && !isInitializing && !isLoading) {
      // Save step to draft metadata - create draft if it doesn't exist
      const saveStep = async () => {
        try {
          // If we have a draftId, update it. Otherwise, create a new draft if we have data
          const draftId = draftIdFromUrl;
          const hasData = data.templateId || data.clientId || data.title || data.content;
          
          if (draftId || hasData) {
            const response = await fetch('/api/drafts/contracts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...(draftId ? { id: draftId } : {}),
                title: data.title || "",
                content: data.content || "",
                fieldValues: data.fieldValues || {},
                customFields: [],
                depositAmount: parseFloat(data.depositAmount || "0"),
                totalAmount: parseFloat(data.totalAmount || "0"),
                clientId: data.clientId,
                templateId: data.templateId,
                metadata: {
                  step: step, // Save current step
                  hasCompensation: data.hasCompensation,
                  compensationType: data.compensationType,
                  paymentTerms: data.paymentTerms,
                  extractedFields: data.extractedFields,
                  detectedClientInfo: data.detectedClientInfo,
                  ...(isAIReview !== undefined && { isAIReview }),
                  ...(aiGenerationParams && { aiGenerationParams }),
                },
              }),
            });
            if (response.ok) {
              const result = await response.json();
              if (result.draft) {
                const newDraftId = result.draft.id;
                // Update URL with draft ID if we didn't have one
                if (!draftId && newDraftId && typeof window !== 'undefined') {
                  const url = new URL(window.location.href);
                  url.searchParams.set('draftId', newDraftId);
                  window.history.replaceState({}, '', url.toString());
                  // Update state to track the new draft ID
                  if (draftIdFromUrl !== newDraftId) {
                    setDraftIdFromUrl(newDraftId);
                  }
                }
                console.log("Step saved to draft:", step);
              }
            }
          }
        } catch (error) {
          console.error("Error saving step:", error);
        }
      };
      // Debounce to avoid too many saves
      const timeoutId = setTimeout(saveStep, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [step, draftIdFromUrl, data, isInitializing, isLoading, isAIReview, aiGenerationParams]);

  // Scroll to top when step changes - ensure it happens after content renders
  useEffect(() => {
    if (step && step >= 1 && step <= 5 && !isInitializing) {
      // Scroll immediately
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Also scroll after content renders (use requestAnimationFrame for better timing)
      const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        // Scroll any scrollable containers
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        // Try to find and scroll main content area
        const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
        if (mainContent && mainContent.scrollTop !== undefined) {
          (mainContent as HTMLElement).scrollTop = 0;
        }
      };
      
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        scrollToTop();
        // Also do it after a small delay to catch any async rendering
        setTimeout(scrollToTop, 50);
        setTimeout(scrollToTop, 150);
      });
    }
  }, [step, isInitializing]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      if (response.ok) {
        const result = await response.json();
        setTemplates(result.templates || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchDefaultTemplates = async () => {
    try {
      const response = await fetch("/api/templates/default");
      const result = await response.json();
      
      if (response.ok && result.success) {
        setDefaultTemplates(result.templates || []);
      } else {
        console.error("Failed to fetch default templates:", result.message || "Unknown error");
        setDefaultTemplates([]);
      }
    } catch (error) {
      console.error("Error fetching default templates:", error);
      setDefaultTemplates([]);
    } finally {
      setLoadingDefaultTemplates(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      if (response.ok) {
        const result = await response.json();
        setClients(result.clients || []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleTemplateSelect = (template: ContractTemplate | null) => {
    if (template) {
      setData({
        ...data,
        templateId: template.id,
        template,
        title: template.name,
        content: template.content,
      });
    } else {
      setData({
        ...data,
        templateId: undefined,
        template: undefined,
        title: "",
        content: "",
      });
    }
    setStep(2);
  };

  const handleDefaultTemplateSelect = async (defaultTemplate: any) => {
    // Convert default template to ContractTemplate format
    const template: ContractTemplate = {
      id: defaultTemplate.id,
      name: defaultTemplate.name,
      content: defaultTemplate.content,
      fields: defaultTemplate.fields || [],
      companyId: "",
      contractorId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    handleTemplateSelect(template);
  };

  // Function to extract fields from contract content
  const extractFieldsFromContent = (content: string): Array<{
    id: string;
    label: string;
    type: "text" | "textarea" | "date" | "number";
    placeholder: string;
    required: boolean;
  }> => {
    const placeholderRegex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
    const fieldMap = new Map<string, {
      id: string;
      label: string;
      type: "text" | "textarea" | "date" | "number";
      placeholder: string;
      required: boolean;
    }>();

    let match;
    while ((match = placeholderRegex.exec(content)) !== null) {
      const fieldId = match[1];
      
      // Skip if already processed
      if (fieldMap.has(fieldId)) continue;

      // Determine field type based on field name
      const fieldIdLower = fieldId.toLowerCase();
      let fieldType: "text" | "textarea" | "date" | "number" = "text";
      
      if (fieldIdLower.includes("date") || fieldIdLower.includes("deadline") || fieldIdLower.includes("expir")) {
        fieldType = "date";
      } else if (fieldIdLower.includes("amount") || fieldIdLower.includes("price") || fieldIdLower.includes("cost") || 
                 fieldIdLower.includes("rate") || fieldIdLower.includes("fee") || fieldIdLower.includes("payment") ||
                 fieldIdLower.includes("total") || fieldIdLower.includes("deposit") || fieldIdLower.includes("price")) {
        fieldType = "number";
      } else if (fieldIdLower.includes("description") || fieldIdLower.includes("scope") || fieldIdLower.includes("terms") ||
                 fieldIdLower.includes("details") || fieldIdLower.includes("address") || fieldIdLower.includes("notes") ||
                 fieldIdLower.includes("comment") || fieldIdLower.includes("message")) {
        fieldType = "textarea";
      }

      // Create human-readable label
      const label = fieldId
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .trim();

      fieldMap.set(fieldId, {
        id: fieldId,
        label,
        type: fieldType,
        placeholder: `Enter ${label}`,
        required: fieldIdLower.includes("name") || fieldIdLower.includes("date") || fieldIdLower.includes("amount") || 
                  fieldIdLower.includes("email") || fieldIdLower.includes("address"),
      });
    }

    return Array.from(fieldMap.values());
  };

  const handleAIContractGenerate = async (
    aiContract: { title: string; content: string },
    generationParams?: { description: string; contractType?: string; additionalDetails?: string }
  ) => {
    // Extract fields from the AI-generated contract
    const extractedFields = extractFieldsFromContent(aiContract.content);
    
    // Set the AI-generated contract data with extracted fields
    setData({
      ...data,
      templateId: undefined,
      template: undefined,
      title: aiContract.title,
      content: aiContract.content,
      extractedFields,
    });
    // Store generation params for regeneration
    if (generationParams) {
      setAIGenerationParams(generationParams);
    }
    setIsAIReview(true); // Show review step instead of going to step 2
  };

  // Function to extract client information from contract content
  const extractClientInfoFromContent = (content: string): { name?: string; email?: string } => {
    const clientInfo: { name?: string; email?: string } = {};
    
    // Look for client name patterns in the content
    const namePatterns = [
      /client[:\s]+([A-Z][a-zA-Z\s]{2,50})(?:\s|,|\.|$)/i,
      /between\s+([A-Z][a-zA-Z\s]{2,50})\s+and/i,
      /party\s+(?:two|2|b)[:\s]+([A-Z][a-zA-Z\s]{2,50})/i,
      /client\s+name[:\s]+([A-Z][a-zA-Z\s]{2,50})/i,
      /this\s+agreement\s+is\s+between[^,]+,\s+([A-Z][a-zA-Z\s]{2,50})/i,
      /([A-Z][a-zA-Z\s]{2,50})\s+\(.*?client.*?\)/i,
    ];
    
    for (const pattern of namePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Validate it's a reasonable name (not a placeholder, not too long, has proper format)
        if (name.length > 2 && name.length < 100 && 
            !name.includes("{{") && 
            !name.toLowerCase().includes("contractor") &&
            !name.toLowerCase().includes("party")) {
          clientInfo.name = name;
          break;
        }
      }
    }
    
    // Look for email patterns
    const emailPatterns = [
      /client\s+email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      /email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}).*?client/i,
    ];
    
    for (const pattern of emailPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        clientInfo.email = match[1].trim();
        break;
      }
    }
    
    return clientInfo;
  };

  const handleAIContractAccept = () => {
    // Extract client information from the contract content
    let clientInfo = extractClientInfoFromContent(data.content);
    
    // Also try to extract from AI generation description if available
    if (aiGenerationParams?.description) {
      const descClientInfo = extractClientInfoFromContent(aiGenerationParams.description);
      if (descClientInfo.name && !clientInfo.name) {
        clientInfo.name = descClientInfo.name;
      }
      if (descClientInfo.email && !clientInfo.email) {
        clientInfo.email = descClientInfo.email;
      }
    }
    
    // Try to find matching client by name
    if (clientInfo.name) {
      const matchingClient = clients.find(
        (c) => c.name.toLowerCase().includes(clientInfo.name!.toLowerCase()) ||
               clientInfo.name!.toLowerCase().includes(c.name.toLowerCase())
      );
      
      if (matchingClient) {
        // Auto-select matching client
        setData({
          ...data,
          clientId: matchingClient.id,
          client: matchingClient,
          detectedClientInfo: undefined, // Clear after using
        });
        toast({
          title: "Client auto-selected",
          description: `Found and selected client: ${matchingClient.name}`,
        });
        setIsAIReview(false);
        setStep(3); // Skip to step 3 since client is selected
        return;
      } else {
        // Store detected client info for pre-filling in Step 2
        setData({
          ...data,
          detectedClientInfo: clientInfo,
        });
        toast({
          title: "Client detected",
          description: `Found client name "${clientInfo.name}" in contract. The form will be pre-filled in the next step.`,
        });
      }
    }
    
    setIsAIReview(false);
    setStep(2); // Move to client selection step
  };

  const handleAIContractEdit = () => {
    setIsAIReview(false);
    setStep(3); // Move to contract editing step
  };

  const handleAIContractRegenerate = async () => {
    if (!aiGenerationParams) return;
    
    setIsRegenerating(true);
    try {
      const response = await fetch("/api/ai/generate-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: aiGenerationParams.description,
          contractType: aiGenerationParams.contractType || undefined,
          additionalDetails: aiGenerationParams.additionalDetails || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.contract) {
          // Extract fields from regenerated contract
          const extractedFields = extractFieldsFromContent(result.contract.content);
          
          toast({
            title: "Contract regenerated",
            description: "AI has generated a new version of your contract!",
          });
          setData({
            ...data,
            title: result.contract.title,
            content: result.contract.content,
            extractedFields,
          });
        } else {
          throw new Error(result.message || "Failed to regenerate contract");
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to regenerate contract");
      }
    } catch (error: any) {
      toast({
        title: "Regeneration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    setData({
      ...data,
      clientId,
      client,
      newClient: undefined,
    });
    setUseNewClient(false);
    setStep(3);
  };

  const handleNewClient = (clientData: { name: string; email: string; phone?: string }) => {
    setData({
      ...data,
      newClient: clientData,
      clientId: undefined,
      client: undefined,
    });
    setStep(3);
  };

  // Helper function to save step to draft - defined before use
  const saveStepToDraft = useCallback(async (stepToSave: Step, dataToSave: ContractData = data) => {
    try {
      const response = await fetch('/api/drafts/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(draftIdFromUrl ? { id: draftIdFromUrl } : {}),
          title: dataToSave.title || "",
          content: dataToSave.content || "",
          fieldValues: dataToSave.fieldValues || {},
          customFields: [],
          depositAmount: parseFloat(dataToSave.depositAmount || "0"),
          totalAmount: parseFloat(dataToSave.totalAmount || "0"),
          clientId: dataToSave.clientId,
          templateId: dataToSave.templateId,
          metadata: {
            step: stepToSave,
            hasCompensation: dataToSave.hasCompensation,
            compensationType: dataToSave.compensationType,
            paymentTerms: dataToSave.paymentTerms,
            extractedFields: dataToSave.extractedFields,
            detectedClientInfo: dataToSave.detectedClientInfo,
            ...(isAIReview !== undefined && { isAIReview }),
            ...(aiGenerationParams && { aiGenerationParams }),
          },
        }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.draft) {
          const newDraftId = result.draft.id;
          if (!draftIdFromUrl && newDraftId && typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('draftId', newDraftId);
            window.history.replaceState({}, '', url.toString());
            if (draftIdFromUrl !== newDraftId) {
              setDraftIdFromUrl(newDraftId);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error saving step to draft:", error);
    }
  }, [draftIdFromUrl, data, isAIReview, aiGenerationParams, setDraftIdFromUrl]);

  const handleFieldsSubmit = (fieldValues: Record<string, string>, compensationData?: {
    hasCompensation: boolean;
    compensationType?: string;
    paymentTerms?: string;
  }) => {
    let content = data.content;
    
    // Replace field placeholders in content
    // Try both field.id and a slugified version of field.label
    if (data.template) {
      data.template.fields.forEach((field) => {
        const value = fieldValues[field.id] || "";
        // Try field ID first
        let regex = new RegExp(`\\{\\{${field.id}\\}\\}`, "g");
        content = content.replace(regex, value);
        // Try field label (slugified)
        const labelSlug = field.label.toLowerCase().replace(/[^a-z0-9]+/g, "");
        regex = new RegExp(`\\{\\{${labelSlug}\\}\\}`, "gi");
        content = content.replace(regex, value);
        // Try exact label
        regex = new RegExp(`\\{\\{${field.label}\\}\\}`, "g");
        content = content.replace(regex, value);
      });
    }
    
    // Also replace fields from extractedFields (AI-generated contracts)
    if (data.extractedFields) {
      data.extractedFields.forEach((field) => {
        const value = fieldValues[field.id] || "";
        // Replace using field ID
        const regex = new RegExp(`\\{\\{${field.id}\\}\\}`, "g");
        content = content.replace(regex, value);
      });
    }

    const updatedData: ContractData = {
      ...data,
      fieldValues,
      content,
    };

    // Add compensation data if provided
    if (compensationData) {
      updatedData.hasCompensation = compensationData.hasCompensation;
      updatedData.compensationType = compensationData.compensationType as any;
      updatedData.paymentTerms = compensationData.paymentTerms;
    }

    setData(updatedData);
    
    // Only go to step 4 if compensation is enabled
    // Check both hasCompensation and compensationType to ensure we don't skip step 4
    // Check both the passed compensationData and the updatedData to handle all cases
    const hasComp = compensationData?.hasCompensation === true || updatedData.hasCompensation === true;
    const compType = compensationData?.compensationType || updatedData.compensationType;
    const hasValidCompType = compType && compType !== "no_compensation" && compType !== undefined;
    
    // Go to step 4 if compensation is enabled OR if there's a valid compensation type
    const nextStep = (hasComp || hasValidCompType) ? 4 : 5;
    setStep(nextStep);
    
    // Immediately save step to draft so refresh restores correct step
    if (draftIdFromUrl || updatedData.templateId || updatedData.clientId) {
      saveStepToDraft(nextStep, updatedData);
    }
  };

  const handleAmountsSubmit = (
    depositAmount: string, 
    totalAmount: string, 
    hourlyRate?: string, 
    milestonePayments?: Array<{ name: string; amount: string; dueDate: string }>,
    paymentSchedule?: "upfront" | "partial" | "full" | "split" | "incremental",
    paymentMethods?: string[],
    insertPaymentIntoContract?: boolean,
    paymentScheduleConfig?: {
      numberOfPayments?: number;
      paymentDates?: Array<{ date: string; amount: string; percentage?: string }>;
      depositPercentage?: string;
      balanceDueDate?: string;
      paymentFrequency?: "weekly" | "biweekly" | "monthly" | "quarterly";
      firstPaymentDate?: string;
    }
  ) => {
    let updatedContent = data.content;
    
    // Insert payment details into contract if requested
    if (insertPaymentIntoContract && data.hasCompensation) {
      const paymentSection = generatePaymentSection(
        totalAmount,
        depositAmount,
        data.compensationType,
        paymentSchedule,
        paymentMethods,
        hourlyRate,
        milestonePayments
      );
      
      // Check if payment section already exists (more comprehensive check)
      const hasPaymentSection = /PAYMENT\s+(TERMS|AND|COMPENSATION)|COMPENSATION|PAYMENT\s+TERMS|PAYMENT\s+SCHEDULE/i.test(updatedContent);
      
      if (!hasPaymentSection) {
        // Try to find the best insertion point
        // 1. After "SCOPE OF SERVICES" or "SERVICES" section
        const servicesMatch = updatedContent.match(/(\d+\.?\s*(SCOPE\s+OF\s+)?SERVICES?[^\n]*\n[^\n]*\n)/i);
        if (servicesMatch) {
          const insertPos = servicesMatch.index! + servicesMatch[0].length;
          updatedContent = updatedContent.slice(0, insertPos) + "\n\n" + paymentSection + "\n\n" + updatedContent.slice(insertPos);
        } else {
          // 2. After "COMPENSATION" or "PAYMENT" if mentioned but not detailed
          const compensationMatch = updatedContent.match(/(COMPENSATION|PAYMENT)[^\n]*\n/i);
          if (compensationMatch && !updatedContent.includes("PAYMENT TERMS")) {
            const insertPos = compensationMatch.index! + compensationMatch[0].length;
            updatedContent = updatedContent.slice(0, insertPos) + "\n" + paymentSection + "\n" + updatedContent.slice(insertPos);
          } else {
            // 3. Before signatures section
            const signatureMatch = updatedContent.match(/(AGREED|SIGNED|SIGNATURE|IN\s+WITNESS|WITNESS\s+WHEREOF)/i);
            if (signatureMatch) {
              const insertPos = signatureMatch.index!;
              updatedContent = updatedContent.slice(0, insertPos).trim() + "\n\n" + paymentSection + "\n\n" + updatedContent.slice(insertPos);
            } else {
              // 4. At the end if no good location found
              updatedContent = updatedContent.trim() + "\n\n" + paymentSection;
            }
          }
        }
      }
    }
    
    const updatedData: ContractData = {
      ...data,
      depositAmount,
      totalAmount,
      content: updatedContent,
      // Ensure compensation type is preserved and known
      compensationType: data.compensationType || "fixed_amount",
    };
    if (hourlyRate) {
      (updatedData as any).hourlyRate = hourlyRate;
    }
    if (milestonePayments) {
      (updatedData as any).milestonePayments = milestonePayments;
    }
    if (paymentSchedule) {
      (updatedData as any).paymentSchedule = paymentSchedule;
    }
    if (paymentScheduleConfig) {
      (updatedData as any).paymentScheduleConfig = paymentScheduleConfig;
    }
    if (paymentMethods) {
      (updatedData as any).paymentMethods = paymentMethods;
    }
    if (insertPaymentIntoContract !== undefined) {
      (updatedData as any).insertPaymentIntoContract = insertPaymentIntoContract;
    }
    setData(updatedData);
    setStep(5);
    
    // Immediately save step to draft so refresh restores correct step
    if (draftIdFromUrl || updatedData.templateId || updatedData.clientId) {
      saveStepToDraft(5, updatedData);
    }
  };

  const generatePaymentSection = (
    total: string,
    deposit: string,
    compType?: string,
    schedule?: string,
    methods?: string[],
    hourly?: string,
    milestones?: Array<{ name: string; amount: string; dueDate: string }>
  ): string => {
    let section = "PAYMENT TERMS AND COMPENSATION\n\n";
    
    // Hourly rate if applicable
    if (compType === "hourly" && hourly) {
      section += `COMPENSATION RATE:\n`;
      section += `Hourly Rate: $${parseFloat(hourly).toFixed(2)} per hour\n\n`;
    }
    
    // Total amount
    section += `TOTAL CONTRACT AMOUNT: $${parseFloat(total || "0").toFixed(2)}\n\n`;
    
    // Deposit and balance
    if (parseFloat(deposit || "0") > 0) {
      const depositAmount = parseFloat(deposit);
      const totalAmount = parseFloat(total || "0");
      const depositPercent = totalAmount > 0 ? ((depositAmount / totalAmount) * 100).toFixed(1) : "0";
      const balance = totalAmount - depositAmount;
      
      section += `PAYMENT BREAKDOWN:\n`;
      section += `Deposit: $${depositAmount.toFixed(2)} (${depositPercent}%)\n`;
      section += `Balance Due: $${balance.toFixed(2)}\n\n`;
    }
    
    // Payment schedule
    if (schedule) {
      section += `PAYMENT SCHEDULE:\n`;
      switch(schedule) {
        case "upfront":
          section += `Payment due in full upon execution of this Agreement.\n\n`;
          break;
        case "partial":
          section += `Partial payment due upfront, with the remaining balance due upon completion and acceptance of all deliverables.\n\n`;
          break;
        case "full":
          section += `Full payment due upon completion and acceptance of all deliverables.\n\n`;
          break;
        case "split":
          section += `Payments will be split as agreed between the parties.\n\n`;
          break;
        case "incremental":
          section += `Incremental payments based on project milestones as specified below.\n\n`;
          break;
        default:
          section += `As specified in this Agreement.\n\n`;
      }
    }
    
    // Milestone payments
    if (milestones && milestones.length > 0) {
      section += `MILESTONE PAYMENTS:\n`;
      milestones.forEach((m, i) => {
        section += `${i + 1}. ${m.name}: $${parseFloat(m.amount).toFixed(2)}`;
        if (m.dueDate) {
          try {
            const dueDate = new Date(m.dueDate);
            section += ` (Due: ${dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})`;
          } catch (e) {
            section += ` (Due: ${m.dueDate})`;
          }
        }
        section += `\n`;
      });
      section += `\n`;
    }
    
    // Payment methods
    if (methods && methods.length > 0) {
      section += `ACCEPTED PAYMENT METHODS:\n`;
      section += `${methods.join(", ")}\n\n`;
    }
    
    // Payment terms footer
    section += `All payments are due within the timeframes specified above. Late payments may be subject to interest charges as permitted by law.`;
    
    return section;
  };

  const handlePreviewSubmit = async () => {
    setIsLoading(true);
    try {
      const contractData: any = {
        title: data.title,
        content: data.content,
        depositAmount: parseFloat(data.depositAmount) || 0,
        totalAmount: parseFloat(data.totalAmount) || 0,
        hasCompensation: data.hasCompensation || false,
        compensationType: data.compensationType || "no_compensation",
        paymentTerms: data.paymentTerms || null,
      };

      if (useNewClient && data.newClient) {
        contractData.clientName = data.newClient.name;
        contractData.clientEmail = data.newClient.email;
        contractData.clientPhone = data.newClient.phone;
      } else if (data.client) {
        contractData.clientName = data.client.name;
        contractData.clientEmail = data.client.email;
        contractData.clientPhone = data.client.phone;
      }

      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contractData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Contract created",
          description: "Contract has been created successfully.",
        });
        router.push(`/dashboard/contracts/${result.contract.id}`);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to create contract",
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
    <div className="max-w-[95%] xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Contract</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span className={(step ?? 0) >= 1 ? "font-medium text-foreground" : ""}>1. Template</span>
          <ChevronRight className="h-4 w-4" />
          <span className={(step ?? 0) >= 2 ? "font-medium text-foreground" : ""}>2. Client</span>
          <ChevronRight className="h-4 w-4" />
          <span className={(step ?? 0) >= 3 ? "font-medium text-foreground" : ""}>3. Fields</span>
          <ChevronRight className="h-4 w-4" />
          <span className={(step ?? 0) >= 4 ? "font-medium text-foreground" : ""}>4. Amount</span>
          <ChevronRight className="h-4 w-4" />
          <span className={(step ?? 0) >= 5 ? "font-medium text-foreground" : ""}>5. Preview</span>
        </div>
      </div>

      {/* Show loading state while initializing draft */}
      {(isInitializing || loadingDraft) && draftIdFromUrl && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading your draft...</p>
          </div>
        </div>
      )}

      {step === 1 && !isAIReview && !isInitializing && (
        <Step1ChooseTemplate
          templates={templates}
          defaultTemplates={defaultTemplates}
          loadingTemplates={loadingTemplates}
          loadingDefaultTemplates={loadingDefaultTemplates}
          onSelect={handleTemplateSelect}
          onSelectDefault={handleDefaultTemplateSelect}
          onAIGenerate={handleAIContractGenerate}
          onBack={() => router.back()}
          hasAIAccess={hasAIAccess}
        />
      )}

      {step === 1 && isAIReview && !isInitializing && (
        <Step1AIReview
          title={data.title}
          content={data.content}
          onAccept={handleAIContractAccept}
          onEdit={handleAIContractEdit}
          onRegenerate={handleAIContractRegenerate}
          onBack={() => setIsAIReview(false)}
          isRegenerating={isRegenerating}
          onUpdateContent={(newContent) => {
            // Re-extract fields when content is updated
            const extractedFields = extractFieldsFromContent(newContent);
            setData({ ...data, content: newContent, extractedFields });
          }}
          onUpdateTitle={(newTitle) => setData({ ...data, title: newTitle })}
        />
      )}

      {step === 2 && !isInitializing && (
        <Step2ChooseClient
          clients={clients}
          loading={loadingClients}
          useNewClient={useNewClient}
          setUseNewClient={setUseNewClient}
          onSelect={handleClientSelect}
          onNewClient={handleNewClient}
          onBack={() => setStep(1)}
          onCancel={() => router.back()}
        />
      )}

      {step === 3 && !isInitializing && (
        <Step3ContractBuilder
          data={data}
          setData={setData}
          template={data.template}
          hasBrandingAccess={hasBrandingAccess}
          fieldValues={data.fieldValues}
          onSubmit={handleFieldsSubmit}
          onBack={() => setStep(2)}
          draftId={draftIdFromUrl}
          currentStep={step}
        />
      )}

      {step === 4 && !isInitializing && (
        <Step4SetAmounts
          depositAmount={data.depositAmount}
          totalAmount={data.totalAmount}
          compensationType={data.compensationType}
          paymentTerms={data.paymentTerms}
          paymentSchedule={(data as any).paymentSchedule}
          paymentMethods={(data as any).paymentMethods}
          onSubmit={handleAmountsSubmit}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && !isInitializing && (
        <Step5Preview
          data={data}
          onSubmit={handlePreviewSubmit}
          onBack={() => setStep(data.hasCompensation ? 4 : 3)}
          isLoading={isLoading}
          hasAIAccess={hasAIAccess}
          setData={setData}
        />
      )}
    </div>
  );
}

function Step1ChooseTemplate({
  templates,
  defaultTemplates,
  loadingTemplates,
  loadingDefaultTemplates,
  onSelect,
  onSelectDefault,
  onAIGenerate,
  onBack,
  hasAIAccess,
}: {
  templates: ContractTemplate[];
  defaultTemplates: any[];
  loadingTemplates: boolean;
  loadingDefaultTemplates: boolean;
  onSelect: (template: ContractTemplate | null) => void;
  onSelectDefault: (template: any) => void;
  onAIGenerate: (contract: { title: string; content: string }, params?: { description: string; contractType?: string; additionalDetails?: string }) => void;
  onBack: () => void;
  hasAIAccess: boolean | null;
}) {
  const [activeTab, setActiveTab] = useState<"default" | "custom" | "scratch" | "ai">("default");
  const [aiDescription, setAiDescription] = useState("");
  const [aiContractType, setAiContractType] = useState("");
  const [aiAdditionalDetails, setAiAdditionalDetails] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [needsMoreInfo, setNeedsMoreInfo] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const { toast } = useToast();

  return (
    <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-slate-800 via-slate-800 to-slate-700 border-b border-slate-700/50">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-indigo-400" />
          Choose Template
        </CardTitle>
        <CardDescription className="text-slate-400 mt-1.5">
          Select a template, use AI to generate one, or start from scratch
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700 pb-2">
          <button
            onClick={() => setActiveTab("default")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-t-lg ${
              activeTab === "default"
                ? "text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/10"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Default Templates
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-t-lg ${
              activeTab === "custom"
                ? "text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/10"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            My Templates
          </button>
          <button
            onClick={() => setActiveTab("scratch")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-t-lg ${
              activeTab === "scratch"
                ? "text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/10"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            }`}
          >
            <Plus className="h-4 w-4" />
            Start from Scratch
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-t-lg ${
              activeTab === "ai"
                ? "text-amber-400 border-b-2 border-amber-400 bg-amber-500/10"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            }`}
          >
            <Wand2 className="h-4 w-4" />
            AI Contract
          </button>
        </div>

        {/* Default Templates Tab */}
        {activeTab === "default" && (
          <div className="space-y-3">
            {loadingDefaultTemplates ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-3" />
                <p className="text-slate-400">Loading default templates...</p>
              </div>
            ) : defaultTemplates.length > 0 ? (
              <>
                <p className="text-sm text-slate-400 mb-3">
                  Choose from professionally crafted templates
                </p>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {defaultTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => onSelectDefault(template)}
                      className="w-full text-left p-4 border-2 border-slate-700 rounded-lg bg-slate-800/50 hover:border-indigo-500/60 hover:bg-slate-700/50 transition-all duration-200 group min-h-[80px]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Sparkles className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300 transition-colors flex-shrink-0" />
                            <span className="font-semibold text-white group-hover:text-indigo-100 transition-colors break-words">{template.name}</span>
                            {template.category && (
                              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 group-hover:bg-indigo-500/30 transition-colors flex-shrink-0">
                                {template.category}
                              </span>
                            )}
                          </div>
                          {template.description && (
                            <p className="text-sm text-slate-400 mt-1 group-hover:text-slate-300 transition-colors break-words">
                              {template.description}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 flex-shrink-0 ml-3 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-lg">
                <Sparkles className="h-12 w-12 text-slate-600 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400 mb-2">No default templates available</p>
                <p className="text-sm text-slate-500">
                  Default templates will appear here once they&apos;re added to the system.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Custom Templates Tab */}
        {activeTab === "custom" && (
          <div className="space-y-3">
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                <p className="text-slate-400 ml-3">Loading your templates...</p>
              </div>
            ) : templates.length > 0 ? (
              <>
                <p className="text-sm text-slate-400 mb-3">
                  Templates you&apos;ve created
                </p>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => onSelect(template)}
                      className="w-full text-left p-4 border-2 border-slate-700 rounded-lg bg-slate-800/50 hover:border-purple-500/60 hover:bg-slate-700/50 transition-all duration-200 group min-h-[80px]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center group-hover:bg-purple-600/30 transition-colors flex-shrink-0">
                            <FileText className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white group-hover:text-purple-100 transition-colors break-words">{template.name}</div>
                            <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                              {template.fields.length} field{template.fields.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-lg">
                <FolderOpen className="h-12 w-12 text-slate-600 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400 mb-4">You haven&apos;t created any templates yet.</p>
                <Link href="/dashboard/templates/new">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Start from Scratch Tab */}
        {activeTab === "scratch" && (
          <div className="space-y-4">
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center border-2 border-purple-500/30">
                <Sparkles className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Start from Scratch</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Create a contract from scratch without using a template. You&apos;ll write the content manually and have full control over every detail.
              </p>
              <Button
                onClick={() => onSelect(null)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                size="lg"
              >
                Start Creating
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* AI Contract Generation Tab */}
        {activeTab === "ai" && (
          <div className="space-y-4">
            {hasAIAccess !== true ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center border-2 border-slate-600">
                  <Lock className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI Contract Generation</h3>
                <p className="text-slate-400 max-w-md mx-auto mb-6">
                  AI contract generation is only available for paid subscribers. Upgrade to Starter or higher to unlock this feature.
                </p>
                <Link href="/dashboard/settings?tab=subscription">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                    Upgrade Plan
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-600/20 flex items-center justify-center border-2 border-amber-500/30">
                    <Wand2 className="h-10 w-10 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">AI Contract Generator</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Describe what you need, and AI will generate a professional contract for you.
                  </p>
                </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="ai-description" className="text-white mb-2 block">
                  Contract Description <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="ai-description"
                  placeholder="e.g., A web development contract for building an e-commerce website with payment integration, user authentication, and admin dashboard. The project should be completed in 3 months with milestone-based payments."
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  className="min-h-[120px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isGenerating}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Be as detailed as possible about the work, timeline, and requirements
                </p>
              </div>

              <div>
                <Label htmlFor="ai-contract-type" className="text-white mb-2 block">
                  Contract Type (Optional)
                </Label>
                <Input
                  id="ai-contract-type"
                  placeholder="e.g., Service Agreement, Work Contract, Consulting Agreement"
                  value={aiContractType}
                  onChange={(e) => setAiContractType(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <Label htmlFor="ai-additional-details" className="text-white mb-2 block">
                  Additional Details (Optional)
                </Label>
                <Textarea
                  id="ai-additional-details"
                  placeholder="e.g., Include confidentiality clause, specify intellectual property ownership, add termination conditions"
                  value={aiAdditionalDetails}
                  onChange={(e) => setAiAdditionalDetails(e.target.value)}
                  className="min-h-[80px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isGenerating}
                />
              </div>

              {/* AI Questions Section */}
              {needsMoreInfo && aiQuestions.length > 0 && (
                <div className="bg-amber-900/20 border-2 border-amber-700/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-amber-300 font-semibold mb-2 block">
                        More Information Needed
                      </Label>
                      <p className="text-sm text-amber-200/80 mb-3">
                        To create the contract correctly, please provide the following information:
                      </p>
                      <ul className="space-y-2 mb-4">
                        {aiQuestions.map((question, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-amber-100">
                            <span className="text-amber-400 font-bold flex-shrink-0">•</span>
                            <span>{question}</span>
                          </li>
                        ))}
                      </ul>
                      <div>
                        <Label htmlFor="additional-info" className="text-amber-300 mb-2 block">
                          Provide Additional Information
                        </Label>
                        <Textarea
                          id="additional-info"
                          placeholder="Answer the questions above with the additional details needed..."
                          value={additionalInfo}
                          onChange={(e) => setAdditionalInfo(e.target.value)}
                          className="min-h-[100px] bg-slate-900/50 border-amber-600/50 text-white placeholder:text-slate-500"
                          disabled={isGenerating}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={async () => {
                  if (!aiDescription.trim()) {
                    toast({
                      title: "Description required",
                      description: "Please provide a description of the contract you need.",
                      variant: "destructive",
                    });
                    return;
                  }

                  setIsGenerating(true);
                  try {
                    // Combine all additional details
                    const allAdditionalDetails = [
                      aiAdditionalDetails,
                      needsMoreInfo && additionalInfo.trim() ? additionalInfo : null
                    ].filter(Boolean).join("\n\n");
                    
                    const response = await fetch("/api/ai/generate-contract", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        description: aiDescription,
                        contractType: aiContractType || undefined,
                        additionalDetails: allAdditionalDetails || undefined,
                      }),
                    });

                    if (response.ok) {
                      const result = await response.json();
                      
                      // Check if AI needs more information
                      if (result.needsMoreInfo && result.questions) {
                        setNeedsMoreInfo(true);
                        setAiQuestions(result.questions);
                        toast({
                          title: "More information needed",
                          description: result.message || "Please provide additional details to create the contract correctly.",
                        });
                        setIsGenerating(false);
                        return;
                      }
                      
                      if (result.success && result.contract) {
                        toast({
                          title: "Contract generated",
                          description: "AI has successfully generated your contract!",
                        });
                        // Reset questions state
                        setNeedsMoreInfo(false);
                        setAiQuestions([]);
                        setAdditionalInfo("");
                        onAIGenerate(result.contract, {
                          description: aiDescription,
                          contractType: aiContractType || undefined,
                          additionalDetails: aiAdditionalDetails || undefined,
                        });
                      } else {
                        throw new Error(result.message || "Failed to generate contract");
                      }
                    } else {
                      const error = await response.json();
                      throw new Error(error.message || "Failed to generate contract");
                    }
                  } catch (error: any) {
                    toast({
                      title: "Generation failed",
                      description: error.message || "Something went wrong. Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                size="lg"
                disabled={isGenerating || !aiDescription.trim() || (needsMoreInfo && !additionalInfo.trim()) || hasAIAccess !== true}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {needsMoreInfo ? "Processing Additional Information..." : "Generating Contract..."}
                  </>
                ) : needsMoreInfo ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate with Additional Info
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Contract with AI
                  </>
                )}
              </Button>
            </div>
              </>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Step1AIReview({
  title,
  content,
  onAccept,
  onEdit,
  onRegenerate,
  onBack,
  isRegenerating,
  onUpdateContent,
  onUpdateTitle,
}: {
  title: string;
  content: string;
  onAccept: () => void;
  onEdit: () => void;
  onRegenerate: () => void;
  onBack: () => void;
  isRegenerating: boolean;
  onUpdateContent: (content: string) => void;
  onUpdateTitle: (title: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  const [displayContent, setDisplayContent] = useState(content);
  
  // Update display content when content prop changes
  useEffect(() => {
    setDisplayContent(content);
    setEditedContent(content);
  }, [content]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    
    // Add user message to chat
    const newUserMessage = { role: "user" as const, content: userMessage };
    setChatMessages((prev) => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
      // Build conversation history for API
      const conversationHistory = chatMessages.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      const response = await fetch("/api/ai/edit-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentContent: displayContent, // Use current displayed content, not original
          userMessage,
          conversationHistory,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.modifiedContent) {
          // Add AI response to chat
          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", content: result.message || "Contract has been updated." },
          ]);
          
          // Update the contract content (this will also re-extract fields)
          onUpdateContent(result.modifiedContent);
          
          // Update local content states to show changes immediately
          setEditedContent(result.modifiedContent);
          setDisplayContent(result.modifiedContent);
          
          toast({
            title: "Contract updated",
            description: "The contract has been modified based on your request.",
          });
        } else {
          throw new Error(result.message || "Failed to update contract");
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update contract");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      // Remove the user message on error
      setChatMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSaveEdit = () => {
    onUpdateTitle(editedTitle);
    onUpdateContent(editedContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(title);
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-amber-800/50 via-orange-800/50 to-amber-800/50 border-b border-amber-700/50">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-amber-400" />
          Review AI-Generated Contract
        </CardTitle>
        <CardDescription className="text-slate-300 mt-1.5">
          Review the generated contract. You can accept it, edit it, regenerate it, or chat with AI to make changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {!isEditing ? (
          <>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300 mb-2 block">Contract Title</Label>
                <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                </div>
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Contract Content</Label>
                <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg max-h-[500px] overflow-y-auto">
                  <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap">
                    {displayContent}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            {showChat && (
              <div className="border-t border-slate-700 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-slate-300 font-semibold">Chat with AI to Edit Contract</Label>
                  <Button
                    onClick={() => setShowChat(false)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg h-[300px] flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-slate-500 py-8">
                        <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Start a conversation to edit your contract</p>
                        <p className="text-xs mt-1">Try: &quot;Add a confidentiality clause&quot; or &quot;Change payment terms to net 30&quot;</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === "user"
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-700 text-slate-200"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-700 rounded-lg p-3">
                          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  {/* Chat Input */}
                  <div className="border-t border-slate-700 p-3">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleChatSend();
                          }
                        }}
                        placeholder="Ask AI to add or edit something in the contract..."
                        className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                        disabled={isChatLoading}
                      />
                      <Button
                        onClick={handleChatSend}
                        disabled={!chatInput.trim() || isChatLoading}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        {isChatLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 sm:gap-3 pt-4 border-t border-slate-700">
              <Button
                onClick={onAccept}
                className="flex-1 min-w-[140px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                size="lg"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Accept & Continue</span>
                <span className="sm:hidden">Accept</span>
              </Button>
              <Button
                onClick={() => setShowChat(!showChat)}
                variant="outline"
                className="flex-1 min-w-[120px] border-purple-600/50 text-purple-400 hover:bg-purple-600/20 hover:border-purple-500"
                size="lg"
              >
                <Wand2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{showChat ? "Hide Chat" : "Chat with AI"}</span>
                <span className="sm:hidden">{showChat ? "Hide" : "Chat"}</span>
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex-1 min-w-[120px] border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                size="lg"
              >
                <Pen className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit Contract</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              <Button
                onClick={onRegenerate}
                disabled={isRegenerating}
                variant="outline"
                className="flex-1 min-w-[120px] border-amber-600/50 text-amber-400 hover:bg-amber-600/20 hover:border-amber-500"
                size="lg"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                    <span className="hidden sm:inline">Regenerating...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Regenerate</span>
                    <span className="sm:hidden">Regen</span>
                  </>
                )}
              </Button>
              <Button
                onClick={onBack}
                variant="outline"
                className="min-w-[80px] border-slate-600 text-slate-400 hover:bg-slate-700"
                size="lg"
              >
                Back
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title" className="text-slate-300 mb-2 block">
                  Contract Title
                </Label>
                <Input
                  id="edit-title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="edit-content" className="text-slate-300 mb-2 block">
                  Contract Content
                </Label>
                <Textarea
                  id="edit-content"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[400px] bg-slate-900/50 border-slate-600 text-white font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Step2ChooseClient({
  clients,
  loading,
  useNewClient,
  setUseNewClient,
  onSelect,
  onNewClient,
  onBack,
  onCancel,
  detectedClientInfo,
}: {
  clients: Client[];
  loading: boolean;
  useNewClient: boolean;
  setUseNewClient: (value: boolean) => void;
  onSelect: (clientId: string) => void;
  onNewClient: (client: { name: string; email: string; phone?: string }) => void;
  onBack: () => void;
  onCancel: () => void;
  detectedClientInfo?: { name?: string; email?: string };
}) {
  const [formData, setFormData] = useState({
    name: detectedClientInfo?.name || "",
    email: detectedClientInfo?.email || "",
    phone: "",
  });

  // Update form data when detectedClientInfo changes
  useEffect(() => {
    if (detectedClientInfo) {
      setFormData(prev => ({
        ...prev,
        name: detectedClientInfo.name || prev.name,
        email: detectedClientInfo.email || prev.email,
      }));
    }
  }, [detectedClientInfo]);

  // Auto-select client if detected name matches an existing client
  useEffect(() => {
    if (detectedClientInfo?.name && !useNewClient && clients.length > 0) {
      const matchingClient = clients.find(
        (c) => c.name.toLowerCase().includes(detectedClientInfo.name!.toLowerCase()) ||
               detectedClientInfo.name!.toLowerCase().includes(c.name.toLowerCase())
      );
      
      if (matchingClient) {
        // Auto-select matching client after a short delay to avoid race conditions
        const timer = setTimeout(() => {
          onSelect(matchingClient.id);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [detectedClientInfo, clients, useNewClient, onSelect]);

  if (useNewClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Client</CardTitle>
          <CardDescription>Enter client information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <input
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone (Optional)</label>
            <input
              type="tel"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setUseNewClient(false)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (formData.name && formData.email) {
                    onNewClient(formData);
                  }
                }}
                disabled={!formData.name || !formData.email}
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Client</CardTitle>
        <CardDescription>Select an existing client or create a new one</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Loading clients...</p>
        ) : (
          <>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setUseNewClient(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create New Client
            </Button>
            <div className="space-y-2">
              {clients.map((client) => (
                <Button
                  key={client.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onSelect(client.id)}
                >
                  <div className="text-left flex-1">
                    <div className="font-medium">{client.name}</div>
                    <div className="text-xs text-muted-foreground">{client.email}</div>
                  </div>
                </Button>
              ))}
            </div>
            {clients.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No clients yet. Create your first client.
              </p>
            )}
          </>
        )}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Step3ContractBuilder({
  data,
  setData,
  template,
  fieldValues,
  onSubmit,
  onBack,
  draftId: initialDraftId,
  currentStep,
  hasBrandingAccess,
}: {
  data: ContractData;
  setData: (data: ContractData) => void;
  template?: ContractTemplate;
  fieldValues: Record<string, string>;
  onSubmit: (values: Record<string, string>, compensationData?: {
    hasCompensation: boolean;
    compensationType?: string;
    paymentTerms?: string;
  }) => void;
  onBack: () => void;
  draftId?: string | null;
  currentStep: number;
  hasBrandingAccess?: boolean | null;
}) {
  const [values, setValues] = useState<Record<string, string>>(fieldValues);
  const [title, setTitle] = useState(data.title);
  const [content, setContent] = useState(data.content);
  const prevTitleContentRef = useRef<{ title: string; content: string }>({ title: data.title, content: data.content });
  const [hasCompensation, setHasCompensation] = useState(data.hasCompensation || false);
  const [compensationType, setCompensationType] = useState<"no_compensation" | "fixed_amount" | "hourly" | "milestone" | "other">(
    (data.compensationType as any) || "no_compensation"
  );

  // Ensure compensation type is valid when compensation is enabled
  useEffect(() => {
    if (hasCompensation && (compensationType === "no_compensation" || !compensationType)) {
      setCompensationType("fixed_amount");
    }
  }, [hasCompensation, compensationType]);

  // Auto-detect money/currency phrases and enable payment compensation
  useEffect(() => {
    // Function to detect money/currency phrases
    const detectMoneyPhrases = (text: string): boolean => {
      if (!text || text.trim().length === 0) return false;
      
      const lowerText = text.toLowerCase();
      
      // Currency symbols
      const currencySymbols = /\$|€|£|¥|₹|¢|₽|₩|₪|₦|₨|₫|₭|₮|₯|₰|₱|₲|₳|₴|₵|₶|₷|₸|₹|₺|₻|₼|₽|₾|₿/;
      
      // Money-related keywords
      const moneyKeywords = [
        'payment', 'pay', 'paid', 'compensation', 'salary', 'wage', 'wages',
        'fee', 'fees', 'price', 'pricing', 'cost', 'costs', 'amount', 'amounts',
        'dollar', 'dollars', 'euro', 'euros', 'pound', 'pounds', 'yen', 'yuan',
        'invoice', 'invoicing', 'billing', 'bill', 'charge', 'charges',
        'deposit', 'deposits', 'refund', 'refunds', 'reimbursement',
        'milestone payment', 'milestone payments', 'installment', 'installments',
        'upfront payment', 'down payment', 'final payment', 'partial payment',
        'hourly rate', 'hourly rates', 'per hour', 'per day', 'per week', 'per month',
        'retainer', 'retainers', 'subscription', 'subscriptions',
        'commission', 'commissions', 'royalty', 'royalties',
        'bonus', 'bonuses', 'tip', 'tips', 'gratuity',
        'budget', 'budgets', 'expense', 'expenses',
        'net 30', 'net 15', 'net 60', 'due date', 'payment terms',
        'late fee', 'late fees', 'interest', 'penalty', 'penalties'
      ];
      
      // Check for currency symbols
      if (currencySymbols.test(text)) {
        return true;
      }
      
      // Check for money keywords
      for (const keyword of moneyKeywords) {
        if (lowerText.includes(keyword)) {
          return true;
        }
      }
      
      // Check for number patterns that might indicate money (e.g., $100, 100 USD, 100.00)
      const moneyPatterns = [
        /\$\s*\d+[\d,.]*\s*(dollar|dollars|usd)?/i,
        /\d+[\d,.]*\s*(dollar|dollars|usd|euro|euros|eur|pound|pounds|gbp|yen|yuan)/i,
        /\d+[\d,.]*\s*(per\s+(hour|day|week|month|year))/i,
        /(total|amount|fee|price|cost):\s*\$\s*\d+[\d,.]*/i,
        /\d+[\d,.]*\s*%?\s*(deposit|down\s+payment|upfront)/i,
      ];
      
      for (const pattern of moneyPatterns) {
        if (pattern.test(text)) {
          return true;
        }
      }
      
      return false;
    };
    
    // Check both title and content
    const combinedText = `${title} ${content}`;
    const hasMoneyPhrases = detectMoneyPhrases(combinedText);
    
    // Auto-enable compensation if money phrases detected and not already enabled
    if (hasMoneyPhrases && !hasCompensation) {
      setHasCompensation(true);
      // Set default compensation type if not set
      if (!compensationType || compensationType === "no_compensation") {
        setCompensationType("fixed_amount");
      }
      // Also enable insertPaymentIntoContract to automatically add payment details
      setData({
        ...data,
        insertPaymentIntoContract: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, hasCompensation, compensationType]);

  // Function to extract fields from contract content
  const extractFieldsFromContent = (content: string): Array<{
    id: string;
    label: string;
    type: "text" | "textarea" | "date" | "number";
    placeholder: string;
    required: boolean;
  }> => {
    const placeholderRegex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
    const fieldMap = new Map<string, {
      id: string;
      label: string;
      type: "text" | "textarea" | "date" | "number";
      placeholder: string;
      required: boolean;
    }>();

    let match;
    while ((match = placeholderRegex.exec(content)) !== null) {
      const fieldId = match[1];
      
      // Skip if already processed
      if (fieldMap.has(fieldId)) continue;

      // Determine field type based on field name
      const fieldIdLower = fieldId.toLowerCase();
      let fieldType: "text" | "textarea" | "date" | "number" = "text";
      
      if (fieldIdLower.includes("date") || fieldIdLower.includes("deadline") || fieldIdLower.includes("expir")) {
        fieldType = "date";
      } else if (fieldIdLower.includes("amount") || fieldIdLower.includes("price") || fieldIdLower.includes("cost") || 
                 fieldIdLower.includes("rate") || fieldIdLower.includes("fee") || fieldIdLower.includes("payment") ||
                 fieldIdLower.includes("total") || fieldIdLower.includes("deposit") || fieldIdLower.includes("price")) {
        fieldType = "number";
      } else if (fieldIdLower.includes("description") || fieldIdLower.includes("scope") || fieldIdLower.includes("terms") ||
                 fieldIdLower.includes("details") || fieldIdLower.includes("address") || fieldIdLower.includes("notes") ||
                 fieldIdLower.includes("comment") || fieldIdLower.includes("message")) {
        fieldType = "textarea";
      }

      // Create human-readable label
      const label = fieldId
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .trim();

      fieldMap.set(fieldId, {
        id: fieldId,
        label,
        type: fieldType,
        placeholder: `Enter ${label}`,
        required: fieldIdLower.includes("name") || fieldIdLower.includes("date") || fieldIdLower.includes("amount") || 
                  fieldIdLower.includes("email") || fieldIdLower.includes("address"),
      });
    }

    return Array.from(fieldMap.values());
  };
  const [paymentTerms, setPaymentTerms] = useState(data.paymentTerms || "");
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showSectionReorder, setShowSectionReorder] = useState(false);
  const [showPaymentQuickInserts, setShowPaymentQuickInserts] = useState(false);
  const [showContractChecker, setShowContractChecker] = useState(false);
  const [contractErrors, setContractErrors] = useState<Array<{
    type: string;
    message: string;
    position?: number;
    fix?: string;
    original?: string;
  }>>([]);
  const [isCheckingContract, setIsCheckingContract] = useState(false);
  const { toast } = useToast();
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Quick insert templates for payment terms and legal clauses
  const paymentTermTemplates = [
    {
      id: "net30",
      label: "Net 30",
      icon: Clock,
      template: "Payment Terms: Net 30 days from invoice date. Invoice will be issued upon completion/delivery of services.",
    },
    {
      id: "net15",
      label: "Net 15",
      icon: Clock,
      template: "Payment Terms: Net 15 days from invoice date. Payment is due within 15 days of invoice issuance.",
    },
    {
      id: "due_on_completion",
      label: "Due on Completion",
      icon: CheckCircle2,
      template: "Payment is due upon completion and acceptance of all deliverables. Client has 7 business days to review and approve work before payment is due.",
    },
    {
      id: "50_50_split",
      label: "50/50 Split",
      icon: DollarSign,
      template: "Payment Schedule:\n- 50% deposit due upon signing this agreement\n- 50% final payment due upon completion and acceptance of all deliverables",
    },
    {
      id: "milestone_payments",
      label: "Milestone Payments",
      icon: Target,
      template: "Payment Schedule:\n- 50% deposit due upon signing\n- 30% upon milestone completion (as specified in project timeline)\n- 20% upon final delivery and acceptance",
    },
    {
      id: "three_payments",
      label: "Three Payments",
      icon: CreditCard,
      template: "Payment Schedule:\n- 33% deposit due upon signing\n- 33% at project midpoint\n- 34% upon final delivery and acceptance",
    },
    {
      id: "late_fees",
      label: "Late Fees",
      icon: AlertTriangle,
      template: "Late Payment Fee: 1.5% per month (18% annually) will be charged on any overdue amounts. Payments are considered late if not received within the specified payment terms.",
    },
    {
      id: "payment_methods",
      label: "Payment Methods",
      icon: CreditCard,
      template: "Accepted Payment Methods: Credit Card, Bank Transfer (ACH), Check, Wire Transfer. Payment details and instructions will be provided upon invoicing.",
    },
    {
      id: "refund_policy",
      label: "Refund Policy",
      icon: RefreshCw,
      template: "Refund Policy: Deposit is non-refundable once work has commenced. If work is canceled before commencement, deposit will be refunded minus a 10% processing fee. No refunds will be provided after work has been completed and delivered.",
    },
    {
      id: "no_refund",
      label: "No Refund",
      icon: XCircle,
      template: "All payments are non-refundable. Once payment is made and work commences, no refunds will be provided under any circumstances.",
    },
    {
      id: "dispute_resolution",
      label: "Payment Disputes",
      icon: Scale,
      template: "Payment Disputes: Any disputes regarding invoices must be raised in writing within 14 days of invoice date. Work may be paused during dispute resolution. If dispute is resolved in favor of Service Provider, late fees apply from original due date.",
    },
    {
      id: "collection_costs",
      label: "Collection Costs",
      icon: AlertCircle,
      template: "Collection Costs: Client agrees to pay all reasonable collection costs, including attorney fees and court costs, incurred in collecting any overdue payments.",
    },
    {
      id: "work_suspension",
      label: "Work Suspension",
      icon: XCircle,
      template: "Work Suspension: Service Provider reserves the right to suspend work if payment is more than 15 days overdue. Work will resume upon receipt of payment plus any applicable late fees. Timeline may be adjusted accordingly.",
    },
    {
      id: "retainage",
      label: "Retainage",
      icon: Lock,
      template: "Retainage: 10% of contract value will be retained until 30 days after final delivery and acceptance to ensure all work is completed to satisfaction and any issues are resolved.",
    },
    {
      id: "grace_period",
      label: "Grace Period",
      icon: Clock,
      template: "Grace Period: A 5-day grace period applies after the payment due date before late fees are assessed. Client will receive written notice before late fees are applied.",
    },
    {
      id: "payment_upon_approval",
      label: "Payment on Approval",
      icon: CheckSquare,
      template: "Payment is due within 7 days of Client's written approval of deliverables. If Client fails to provide approval or feedback within 14 days, deliverables will be deemed approved and payment will be due immediately.",
    },
  ];

  // Custom fields for scratch mode
  const [customFields, setCustomFields] = useState<Array<{
    id: string;
    label: string;
    type: "text" | "textarea" | "date" | "number";
    placeholder: string;
    required: boolean;
  }>>([]);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "textarea" | "date" | "number">("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [showSnippets, setShowSnippets] = useState(false);
  const [showLegalClauses, setShowLegalClauses] = useState(false);
  const [showPreview, setShowPreview] = useState(true); // Live Preview modal - default expanded
  const [showImportExport, setShowImportExport] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [importing, setImporting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftId, setDraftId] = useState<string | null>(initialDraftId || null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [branding, setBranding] = useState({
    // Logo settings
    logo: "",
    showLogo: true,
    logoPosition: "header" as "header" | "watermark" | "footer" | "corner",
    logoSize: "medium" as "small" | "medium" | "large",
    logoOpacity: 100,
    // Company info
    companyName: "",
    showCompanyName: true,
    companyNamePosition: "header" as "header" | "footer" | "both",
    // Colors
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    accentColor: "#10b981",
    // Typography
    fontFamily: "Georgia, serif",
    fontSize: "normal" as "small" | "normal" | "large",
    // Layout
    headerStyle: "centered" as "centered" | "left" | "right",
    showBorder: true,
    borderStyle: "solid" as "solid" | "double" | "dashed" | "none",
    borderColor: "#e2e8f0",
    // Watermark
    watermarkText: "",
    showWatermark: false,
    watermarkOpacity: 10,
    // Footer
    showFooter: true,
    footerText: "",
    showPageNumbers: true,
    // Background
    backgroundColor: "#ffffff",
    paperStyle: "clean" as "clean" | "lined" | "subtle",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Load draft from database if draftId provided, otherwise try localStorage as fallback
  const loadDraftFromDatabase = useCallback(async () => {
    if (!initialDraftId) return;
    try {
      const response = await fetch(`/api/drafts/contracts/${initialDraftId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.draft) {
          const draft = result.draft;
          const metadata = draft.metadata || {};
          
          if (draft.title) setTitle(draft.title);
          if (draft.content) setContent(draft.content);
          if (draft.customFields) setCustomFields(draft.customFields);
          if (draft.fieldValues) setCustomFieldValues(draft.fieldValues);
          if (draft.updatedAt) setLastSaved(new Date(draft.updatedAt));
          setDraftId(draft.id);
          
          // Restore compensation data if it exists
          if (metadata.hasCompensation !== undefined) {
            setHasCompensation(metadata.hasCompensation);
          }
          if (metadata.compensationType) {
            setCompensationType(metadata.compensationType as any);
          }
          if (metadata.paymentTerms) {
            setPaymentTerms(metadata.paymentTerms);
          }
          
          // Update parent data with compensation info
          if (metadata.hasCompensation !== undefined || metadata.compensationType || metadata.paymentTerms) {
            setData({
              ...data,
              hasCompensation: metadata.hasCompensation ?? data.hasCompensation,
              compensationType: metadata.compensationType || data.compensationType,
              paymentTerms: metadata.paymentTerms || data.paymentTerms,
            });
          }
          
          toast({ title: "Draft loaded", description: "Your draft has been restored from the database." });
        }
      }
    } catch (e) {
      console.error("Failed to load draft from database:", e);
    }
  }, [initialDraftId, setTitle, setContent, setCustomFields, setCustomFieldValues, setLastSaved, setDraftId, setHasCompensation, setCompensationType, setPaymentTerms, data, setData, toast]);

  // Initialize customFields from extractedFields if available (from AI-generated contracts)
  useEffect(() => {
    if (data.extractedFields && data.extractedFields.length > 0) {
      // Merge extracted fields with existing fields, avoiding duplicates
      const existingFieldIds = new Set(customFields.map(f => f.id));
      const newFields = data.extractedFields.filter(f => !existingFieldIds.has(f.id));
      
      // If there are new fields, update the customFields (deduplicate existing ones too)
      if (newFields.length > 0) {
        setCustomFields(prev => {
          const fieldMap = new Map<string, typeof prev[0]>();
          // Add existing fields first (this will deduplicate if there are any duplicates)
          prev.forEach(f => fieldMap.set(f.id, f));
          // Add new fields
          newFields.forEach(f => fieldMap.set(f.id, f));
          return Array.from(fieldMap.values());
        });
        toast({
          title: "Fields detected",
          description: `Found ${newFields.length} new field${newFields.length > 1 ? "s" : ""} in the contract. Please fill them in.`,
        });
      } else if (customFields.length === 0) {
        // If no existing fields, set all extracted fields (deduplicate them too)
        const fieldMap = new Map<string, typeof data.extractedFields[0]>();
        data.extractedFields.forEach(f => fieldMap.set(f.id, f));
        setCustomFields(Array.from(fieldMap.values()));
        toast({
          title: "Fields detected",
          description: `Found ${fieldMap.size} field${fieldMap.size > 1 ? "s" : ""} in the contract. Please fill them in.`,
        });
      }
      
      // Initialize field values from data.fieldValues
      if (data.fieldValues) {
        setCustomFieldValues(prev => ({ ...prev, ...data.fieldValues }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.extractedFields]);

  // Also extract fields directly from content when we're in step 3 (contract builder)
  // This ensures all fields are captured even if extraction didn't happen earlier
  useEffect(() => {
    if (currentStep === 3 && content && content.trim().length > 0) {
      const extractedFromContent = extractFieldsFromContent(content);
      if (extractedFromContent.length > 0) {
        // Merge with existing fields, avoiding duplicates
        const existingFieldIds = new Set(customFields.map(f => f.id));
        const newFields = extractedFromContent.filter(f => !existingFieldIds.has(f.id));
        
        if (newFields.length > 0) {
          setCustomFields(prev => {
            // Deduplicate existing fields and add new ones
            const fieldMap = new Map<string, typeof prev[0]>();
            prev.forEach(f => fieldMap.set(f.id, f));
            newFields.forEach(f => fieldMap.set(f.id, f));
            return Array.from(fieldMap.values());
          });
          // Update data.extractedFields to keep them in sync
          setData({
            ...data,
            extractedFields: [...(data.extractedFields || []), ...newFields],
          });
        } else if (customFields.length === 0 && extractedFromContent.length > 0) {
          // If no fields exist but content has fields, set them all (deduplicate)
          const fieldMap = new Map<string, typeof extractedFromContent[0]>();
          extractedFromContent.forEach(f => fieldMap.set(f.id, f));
          setCustomFields(Array.from(fieldMap.values()));
          setData({
            ...data,
            extractedFields: Array.from(fieldMap.values()),
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, content, customFields]); // Removed data and setData to prevent infinite loop

  // Deduplicate customFields whenever it changes to prevent duplicate keys
  useEffect(() => {
    if (customFields.length === 0) return;
    
    const fieldMap = new Map<string, typeof customFields[0]>();
    let hasDuplicates = false;
    
    customFields.forEach(field => {
      if (fieldMap.has(field.id)) {
        hasDuplicates = true;
      } else {
        fieldMap.set(field.id, field);
      }
    });
    
    if (hasDuplicates) {
      const deduplicated = Array.from(fieldMap.values());
      setCustomFields(deduplicated);
    }
  }, [customFields]);

  // Sync title and content to parent data, but avoid infinite loops
  useEffect(() => {
    // Only update if title or content actually changed
    if (prevTitleContentRef.current.title !== title || prevTitleContentRef.current.content !== content) {
    setData({ ...data, title, content });
      prevTitleContentRef.current = { title, content };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]); // Only depend on title/content, not data to prevent infinite loop

  // Auto-save draft every 30 seconds
  const saveDraftToDatabase = useCallback(async (silent = false) => {
    if (savingDraft) return;
    
    setSavingDraft(true);
    try {
      const response = await fetch("/api/drafts/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Only send id if it's a valid UUID (database draft), not a local draft ID
          id: draftId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(draftId) ? draftId : undefined,
          title,
          content,
          fieldValues: customFieldValues,
          customFields,
          depositAmount: parseFloat(data.depositAmount || "0"),
          totalAmount: parseFloat(data.totalAmount || "0"),
          clientId: data.clientId,
          templateId: data.templateId,
          metadata: { 
            branding,
            step: currentStep, // Save current step
            hasCompensation: data.hasCompensation,
            compensationType: data.compensationType,
            paymentTerms: data.paymentTerms,
            extractedFields: data.extractedFields,
            detectedClientInfo: data.detectedClientInfo,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.draft) {
          setLastSaved(new Date());
          if (!draftId) {
            setDraftId(result.draft.id);
            // Update URL with draft ID for easier sharing/returning
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              url.searchParams.set('draftId', result.draft.id);
              window.history.replaceState({}, '', url.toString());
            }
          }
          if (!silent) {
            toast({ 
              title: "Draft saved!", 
              description: "Your progress has been saved.",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error saving draft:", error);
        if (!silent) {
        toast({ 
          title: "Error", 
          description: "Failed to save draft", 
          variant: "destructive" 
        });
      }
    } finally {
      setSavingDraft(false);
    }
  }, [savingDraft, draftId, title, content, customFieldValues, customFields, data, branding, currentStep, toast]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (title.trim() || content.trim()) saveDraftToDatabase(true);
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [title, content, saveDraftToDatabase]);

  // Close tools menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showToolsMenu && !target.closest('.tools-menu-container')) {
        setShowToolsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showToolsMenu]);

  // Clear draft
  const clearDraft = async () => {
    if (draftId) {
      try {
        await fetch(`/api/drafts/contracts?id=${draftId}`, { method: "DELETE" });
      } catch (e) {
        console.error("Failed to delete draft from database:", e);
      }
    }
    localStorage.removeItem("contract_draft");
    setTitle("");
    setContent("");
    setCustomFields([]);
    setCustomFieldValues({});
    setLastSaved(null);
    setDraftId(null);
    // Remove draftId from URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('draftId');
      window.history.replaceState({}, '', url.toString());
    }
    toast({ title: "Draft cleared", description: "Starting fresh with a blank contract." });
  };

  // Save branding
  const saveBranding = () => {
    localStorage.setItem("contract_branding", JSON.stringify(branding));
    toast({ title: "Branding saved!", description: "Your branding settings have been saved." });
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: "Logo must be under 2MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => setBranding({ ...branding, logo: event.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  // Generate branded PDF HTML
  const getBrandedPdfHtml = (previewContent: string) => {
    const headerAlign = branding.headerStyle === "centered" ? "center" : branding.headerStyle;
    // Escape quotes and backticks to prevent template literal issues
    const escapeForTemplate = (str: string) => (str || "").replace(/`/g, "\\`").replace(/\${/g, "\\${");
    const safeTitle = escapeForTemplate(title || "Contract");
    const safeCompanyName = escapeForTemplate(branding.companyName || "");
    const safeLogo = escapeForTemplate(branding.logo || "");
    // Build HTML strings separately to avoid nested template literal issues
    const logoHtml = branding.showLogo && branding.logo ? `<img src="${safeLogo.replace(/"/g, "&quot;")}" class="logo" alt="Logo" />` : "";
    const companyNameHtml = branding.showCompanyName && branding.companyName ? `<div class="company-name">${safeCompanyName.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>` : "";
    const footerHtml = branding.companyName ? `© ${new Date().getFullYear()} ${safeCompanyName.replace(/</g, "&lt;").replace(/>/g, "&gt;")}. All rights reserved.` : "";
    return `<!DOCTYPE html><html><head><title>${safeTitle}</title><style>body{font-family:${branding.fontFamily};max-width:800px;margin:0 auto;padding:40px;line-height:1.6;color:#333}.header{text-align:${headerAlign};margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid ${branding.primaryColor}}.logo{max-height:80px;max-width:200px;margin-bottom:10px}.company-name{font-size:14px;color:${branding.secondaryColor};font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:20px}h1{font-size:28px;color:${branding.primaryColor};margin:20px 0;text-align:${headerAlign}}.content{white-space:pre-wrap;font-size:12pt}.footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;text-align:center;font-size:10px;color:#888}</style></head><body><div class="header">${logoHtml}${companyNameHtml}</div><h1>${safeTitle}</h1><div class="content">${previewContent}</div><div class="footer">${footerHtml}</div></body></html>`;
  };

  // Contract templates
  const contractTemplates = [
    {
      id: "freelance",
      name: "Freelance Services",
      icon: Briefcase,
      description: "General freelance work",
      content: "FREELANCE SERVICES AGREEMENT\n\nThis Agreement is entered into as of {{effectiveDate}} between:\n\nSERVICE PROVIDER: {{providerName}}\nCLIENT: {{clientName}}\n\n1. SERVICES\nThe Service Provider agrees to provide: {{serviceDescription}}\n\n2. COMPENSATION\nTotal Fee: ${{totalAmount}}\nDeposit: ${{depositAmount}} (due upon signing)\nBalance: Due upon completion\n\n3. TIMELINE\nStart Date: {{startDate}}\nCompletion Date: {{endDate}}\n\n4. REVISIONS\n{{revisionCount}} rounds of revisions included.\n\n5. OWNERSHIP\nUpon full payment, all rights transfer to the Client.\n\n---\n\nAGREED AND ACCEPTED:\n\nProvider: _________________________ Date: _________\nClient: _________________________ Date: _________"
    },
    {
      id: "photography",
      name: "Photography",
      icon: Eye,
      description: "Photo/video shoot",
      content: "PHOTOGRAPHY SERVICES AGREEMENT\n\nThis Agreement is entered into as of {{effectiveDate}} between:\n\nPHOTOGRAPHER: {{providerName}}\nCLIENT: {{clientName}}\n\n1. EVENT DETAILS\nEvent Type: {{eventType}}\nDate: {{eventDate}}\nLocation: {{eventLocation}}\nDuration: {{duration}} hours\n\n2. DELIVERABLES\n- {{deliverableCount}} edited high-resolution digital images\n- Online gallery for {{galleryDuration}}\n\n3. COMPENSATION\nTotal Fee: ${{totalAmount}}\nDeposit: ${{depositAmount}} (non-refundable)\nBalance: Due {{balanceDueDate}}\n\n4. USAGE RIGHTS\nClient receives personal, non-commercial license.\nPhotographer retains copyright for portfolio use.\n\n---\n\nAGREED:\n\nPhotographer: _________________________ Date: _________\nClient: _________________________ Date: _________"
    },
    {
      id: "marketing",
      name: "Marketing Services",
      icon: Target,
      description: "Digital marketing",
      content: "MARKETING SERVICES AGREEMENT\n\nEffective Date: {{effectiveDate}}\n\nMARKETING AGENCY: {{providerName}}\nCLIENT: {{clientName}}\n\n1. SERVICES\n{{serviceDescription}}\n\n2. CAMPAIGN DETAILS\nCampaign: {{campaignName}}\nTarget Audience: {{targetAudience}}\nPlatforms: {{platforms}}\n\n3. COMPENSATION\nMonthly Retainer: ${{monthlyFee}}\nAd Spend Budget: ${{adBudget}}\n\n4. DELIVERABLES\n- Monthly performance reports\n- {{deliverable1}}\n- {{deliverable2}}\n\n5. TERM\nStart: {{startDate}}\nEnd: {{endDate}}\n\n---\n\nAGREED:\n\nAgency: _________________________ Date: _________\nClient: _________________________ Date: _________"
    },
    {
      id: "nda",
      name: "NDA",
      icon: Lock,
      description: "Non-Disclosure Agreement",
      content: "NON-DISCLOSURE AGREEMENT\n\nEffective Date: {{effectiveDate}}\n\nDISCLOSING PARTY: {{disclosingParty}}\nRECEIVING PARTY: {{receivingParty}}\n\n1. PURPOSE\nThe parties wish to explore {{businessPurpose}} and need to share confidential information.\n\n2. CONFIDENTIAL INFORMATION\nIncludes: business plans, financial data, customer lists, trade secrets, and any information marked confidential.\n\n3. OBLIGATIONS\nThe Receiving Party agrees to:\n- Keep all information strictly confidential\n- Not disclose to third parties\n- Use only for the stated purpose\n- Return or destroy upon request\n\n4. TERM\nThis Agreement remains in effect for {{termYears}} years.\n\n5. GOVERNING LAW\nGoverned by the laws of {{jurisdiction}}.\n\n---\n\nAGREED:\n\nDisclosing Party: _________________________ Date: _________\nReceiving Party: _________________________ Date: _________"
    },
    {
      id: "retainer",
      name: "Retainer Agreement",
      icon: RefreshCw,
      description: "Ongoing monthly services",
      content: "RETAINER AGREEMENT\n\nEffective Date: {{effectiveDate}}\n\nSERVICE PROVIDER: {{providerName}}\nCLIENT: {{clientName}}\n\n1. SERVICES\nOngoing {{serviceType}} services including:\n{{serviceDescription}}\n\n2. RETAINER TERMS\nMonthly Hours: {{monthlyHours}} hours\nMonthly Fee: ${{monthlyFee}}\nOverage Rate: ${{overageRate}}/hour\n\n3. TERM\nInitial Term: {{initialTerm}} months\nRenewal: Auto-renews monthly with {{noticeDays}} days notice to cancel\n\n4. PAYMENT\nDue on the {{dueDay}} of each month\n\n5. PRIORITY ACCESS\nRetainer clients receive priority scheduling.\n\n---\n\nAGREED:\n\nProvider: _________________________ Date: _________\nClient: _________________________ Date: _________"
    },
    {
      id: "design",
      name: "Graphic Design",
      icon: Pen,
      description: "Logo, branding & design",
      content: "GRAPHIC DESIGN AGREEMENT\n\nDate: {{effectiveDate}}\n\nDESIGNER: {{providerName}}\nCLIENT: {{clientName}}\n\n1. PROJECT\n{{projectDescription}}\n\n2. DELIVERABLES\n- {{deliverable1}}\n- {{deliverable2}}\nFile Formats: {{fileFormats}}\n\n3. TIMELINE\nConcept: {{conceptDate}}\nFinal: {{endDate}}\n\n4. COMPENSATION\nDesign Fee: ${{totalAmount}}\nDeposit: ${{depositAmount}}\n\n5. REVISIONS\n{{revisionCount}} rounds included.\n\n6. USAGE RIGHTS\nUpon payment, Client receives full ownership.\n\n---\n\nAGREED:\n\nDesigner: _________________________ Date: _________\nClient: _________________________ Date: _________"
    },
    {
      id: "construction",
      name: "Construction",
      icon: Building,
      description: "Home improvement & renovation",
      content: "CONSTRUCTION AGREEMENT\n\nDate: {{effectiveDate}}\n\nCONTRACTOR: {{providerName}}\nLicense #: {{licenseNumber}}\nCLIENT: {{clientName}}\n\nPROJECT ADDRESS: {{projectAddress}}\n\n1. SCOPE\n{{scopeOfWork}}\n\n2. MATERIALS\nSpecifications: {{materialSpecs}}\nAllowance: ${{materialAllowance}}\n\n3. TIMELINE\nStart: {{startDate}}\nCompletion: {{endDate}}\n\n4. PAYMENT\nTotal: ${{totalAmount}}\nDeposit: ${{depositAmount}}\nProgress payments as outlined.\n\n5. WARRANTY\n{{warrantyPeriod}} workmanship warranty.\n\n---\n\nAGREED:\n\nContractor: _________________________ Date: _________\nClient: _________________________ Date: _________"
    },
    {
      id: "subcontractor",
      name: "Subcontractor",
      icon: Handshake,
      description: "Hiring help for projects",
      content: "SUBCONTRACTOR AGREEMENT\n\nDate: {{effectiveDate}}\n\nCONTRACTOR: {{contractorName}}\nSUBCONTRACTOR: {{subcontractorName}}\n\n1. PROJECT\nClient: {{clientName}}\nProject: {{projectName}}\n\n2. WORK\n{{subcontractedWork}}\n\n3. TIMELINE\nStart: {{startDate}}\nDeadline: {{endDate}}\n\n4. COMPENSATION\nFee: ${{fixedFee}}\nPayment: {{paymentTerms}}\n\n5. RELATIONSHIP\nSubcontractor is independent contractor.\n\n6. CONFIDENTIALITY\nAll project info is confidential.\n\n7. NON-SOLICITATION\nNo direct client contact for {{nonSolicitPeriod}}.\n\n---\n\nAGREED:\n\nContractor: _________________________ Date: _________\nSubcontractor: _________________________ Date: _________"
    },
    {
      id: "social_media",
      name: "Social Media",
      icon: Globe,
      description: "Social media management",
      content: "SOCIAL MEDIA MANAGEMENT AGREEMENT\n\nDate: {{effectiveDate}}\n\nMANAGER: {{providerName}}\nCLIENT: {{clientName}}\n\n1. PLATFORMS\n{{platforms}}\n\n2. SERVICES\n- {{postsPerWeek}} posts/week\n- Community management\n- Monthly analytics\n\n3. COMPENSATION\nMonthly: ${{monthlyFee}}\nDue: {{dueDay}} of each month\n\n4. CONTENT\nApproval required within {{approvalWindow}} hours.\n\n5. TERM\n{{initialTerm}} months, then month-to-month.\n{{noticeDays}} days notice to cancel.\n\n---\n\nAGREED:\n\nManager: _________________________ Date: _________\nClient: _________________________ Date: _________"
    },
    {
      id: "event_planning",
      name: "Event Planning",
      icon: Calendar,
      description: "Weddings, parties & events",
      content: "EVENT PLANNING AGREEMENT\n\nDate: {{effectiveDate}}\n\nPLANNER: {{providerName}}\nCLIENT: {{clientName}}\n\n1. EVENT\nType: {{eventType}}\nDate: {{eventDate}}\nVenue: {{venueName}}\nGuests: {{guestCount}}\n\n2. SERVICES\n{{planningServices}}\n\n3. COMPENSATION\nPlanning Fee: ${{totalAmount}}\nDeposit: ${{depositAmount}}\n\n4. CANCELLATION\n90+ days: Full refund minus admin fee\n30-89 days: 50% refund\nLess than 30 days: No refund\n\n---\n\nAGREED:\n\nPlanner: _________________________ Date: _________\nClient: _________________________ Date: _________"
    },
    {
      id: "coaching",
      name: "Coaching/Training",
      icon: Award,
      description: "Life & business coaching",
      content: "COACHING AGREEMENT\n\nDate: {{effectiveDate}}\n\nCOACH: {{providerName}}\nCLIENT: {{clientName}}\n\n1. PROGRAM\n{{programName}}\nDuration: {{programDuration}}\n\n2. SESSIONS\n{{sessionCount}} sessions\n{{sessionLength}} each\nFormat: {{sessionFormat}}\n\n3. INVESTMENT\n${{totalAmount}}\n\n4. RESPONSIBILITIES\nClient commits to attending sessions and completing exercises.\n\n5. CONFIDENTIALITY\nAll sessions are confidential.\n\n6. DISCLAIMER\nCoaching is not therapy. Results depend on client effort.\n\n---\n\nAGREED:\n\nCoach: _________________________ Date: _________\nClient: _________________________ Date: _________"
    },
  ];

  const loadTemplate = (template: typeof contractTemplates[0]) => {
    setTitle(template.name + " Contract");
    setContent(template.content);
    // Extract fields from template
    const placeholderRegex = /\{\{(\w+)\}\}/g;
    let match;
    const newFields: typeof customFields = [];
    while ((match = placeholderRegex.exec(template.content)) !== null) {
      const fieldId = match[1];
      if (!newFields.find(f => f.id === fieldId)) {
        newFields.push({
          id: fieldId,
          label: fieldId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
          type: fieldId.includes("date") ? "date" : fieldId.includes("amount") || fieldId.includes("fee") || fieldId.includes("rate") ? "number" : fieldId.includes("description") ? "textarea" : "text",
          placeholder: `Enter ${fieldId.replace(/_/g, " ")}`,
          required: false,
        });
      }
    }
    setCustomFields(newFields);
    setShowTemplates(false);
    toast({ title: "Template loaded", description: `${template.name} template with ${newFields.length} fields ready.` });
  };

  // Contract snippets for quick insert
  const contractSnippets = [
    { 
      id: "header", 
      name: "Contract Header", 
      icon: FileText,
      snippet: "CONTRACT AGREEMENT\n\nThis Agreement is entered into as of {{date}} between:\n\nService Provider: {{providerName}}\nClient: {{clientName}}\n\n---\n\n"
    },
    { 
      id: "services", 
      name: "Services Section", 
      icon: Briefcase,
      snippet: "SERVICES\n\nThe Service Provider agrees to provide the following services:\n\n{{serviceDescription}}\n\nDeliverables:\n- {{deliverable1}}\n- {{deliverable2}}\n- {{deliverable3}}\n\n"
    },
    { 
      id: "payment", 
      name: "Payment Terms", 
      icon: DollarSign,
      snippet: "PAYMENT TERMS\n\nTotal Amount: ${{totalAmount}}\nDeposit Required: ${{depositAmount}}\n\nPayment Schedule:\n- Deposit due upon signing\n- Remaining balance due upon completion\n\nPayment Methods: Credit Card, Bank Transfer, or Check\n\n"
    },
    { 
      id: "timeline", 
      name: "Timeline & Milestones", 
      icon: Calendar,
      snippet: "TIMELINE\n\nProject Start Date: {{startDate}}\nEstimated Completion: {{endDate}}\n\nMilestones:\n1. {{milestone1}} - Due: {{milestone1Date}}\n2. {{milestone2}} - Due: {{milestone2Date}}\n\n"
    },
    { 
      id: "signature", 
      name: "Signature Block", 
      icon: Type,
      snippet: "\n---\n\nAGREED AND ACCEPTED:\n\nService Provider:\nSignature: _________________________\nName: {{providerName}}\nDate: _________________________\n\nClient:\nSignature: _________________________\nName: {{clientName}}\nDate: _________________________\n"
    },
  ];

  // Legal clauses
  const legalClauses = [
    {
      id: "confidentiality",
      name: "Confidentiality",
      icon: Shield,
      text: "\nCONFIDENTIALITY\n\nBoth parties agree to keep confidential all proprietary information, trade secrets, and business information disclosed during the course of this agreement. This obligation shall survive the termination of this agreement.\n"
    },
    {
      id: "ip",
      name: "Intellectual Property",
      icon: Scale,
      text: "\nINTELLECTUAL PROPERTY\n\nUpon full payment, all intellectual property rights to the deliverables shall transfer to the Client. The Service Provider retains the right to use the work in their portfolio unless otherwise agreed in writing.\n"
    },
    {
      id: "termination",
      name: "Termination",
      icon: FileText,
      text: "\nTERMINATION\n\nEither party may terminate this agreement with 30 days written notice. In case of termination, the Client shall pay for all work completed up to the termination date. Any deposits paid are non-refundable.\n"
    },
    {
      id: "liability",
      name: "Limitation of Liability",
      icon: Shield,
      text: "\nLIMITATION OF LIABILITY\n\nThe Service Provider's total liability under this agreement shall not exceed the total amount paid by the Client. Neither party shall be liable for indirect, incidental, or consequential damages.\n"
    },
    {
      id: "force_majeure",
      name: "Force Majeure",
      icon: Scale,
      text: "\nFORCE MAJEURE\n\nNeither party shall be liable for delays or failures in performance resulting from circumstances beyond their reasonable control, including but not limited to natural disasters, war, terrorism, or government actions.\n"
    },
    {
      id: "warranty_disclaimer",
      name: "Warranty Disclaimer",
      icon: Shield,
      text: "\nWARRANTY DISCLAIMER\n\nServices provided \"AS IS\" without warranty. Limited warranty: deliverables will substantially conform to specifications for {{warrantyPeriod}} from delivery. Does NOT cover: client modifications, third-party issues, or misuse.\n"
    },
    {
      id: "refund_policy",
      name: "Refund Policy",
      icon: CreditCard,
      text: "\nREFUND POLICY\n\nDeposit is non-refundable once work begins. Cancellation before work: full refund minus admin fee. After work begins: no refund, client pays for completed work. Disputes must be raised within {{disputeWindow}} days.\n"
    },
    {
      id: "cancellation",
      name: "Cancellation Policy",
      icon: AlertTriangle,
      text: "\nCANCELLATION POLICY\n\nClient cancellation: 30+ days notice = deposit refunded minus fee. 14-30 days = 50% deposit refunded. Less than 14 days = no refund. Provider cancellation: full refund of unused payments.\n"
    },
    {
      id: "payment_terms",
      name: "Payment Terms",
      icon: DollarSign,
      text: "\nPAYMENT TERMS\n\nAccepted: Credit Card, Bank Transfer, Check. Late payments: {{gracePeriod}} day grace, then {{lateFeePercent}}% monthly fee. Work paused after {{pauseDays}} days overdue. Client pays collection costs.\n"
    },
    {
      id: "scope_changes",
      name: "Scope Changes",
      icon: RefreshCw,
      text: "\nSCOPE CHANGES\n\nChanges outside original scope require written change order. Changes may affect timeline and cost. Rush changes incur additional fees. Change order fee: ${{changeOrderFee}}.\n"
    },
    {
      id: "acceptance",
      name: "Acceptance",
      icon: CheckCircle2,
      text: "\nACCEPTANCE\n\nClient has {{reviewPeriod}} business days to review deliverables. Deemed accepted if: written approval given, no response within review period, or deliverable used in production.\n"
    },
    {
      id: "data_privacy",
      name: "Data Privacy",
      icon: Lock,
      text: "\nDATA PRIVACY\n\nProvider collects only necessary project data. Data used solely for providing services. Provider implements reasonable security. Data retained {{retentionPeriod}} after project, then deleted.\n"
    },
  ];

  // Legal term definitions for tooltips
  const legalTermDefinitions: Record<string, { term: string; definition: string; example?: string }> = {
    "indemnification": {
      term: "Indemnification",
      definition: "A contractual obligation where one party agrees to compensate the other for certain damages or losses.",
      example: "If a client sues you for using copyrighted material they provided, an indemnification clause means they cover your legal costs."
    },
    "force majeure": {
      term: "Force Majeure",
      definition: "A clause that frees both parties from liability when an extraordinary event beyond their control prevents fulfillment of obligations.",
      example: "Natural disasters, wars, pandemics, or government actions that make it impossible to complete the work."
    },
    "limitation of liability": {
      term: "Limitation of Liability",
      definition: "A clause that caps the maximum amount one party can be held responsible for if something goes wrong.",
      example: "Limiting liability to the total contract value means you cannot be sued for more than what you were paid."
    },
    "intellectual property": {
      term: "Intellectual Property (IP)",
      definition: "Legal rights to creations of the mind including designs, code, artwork, and written content.",
      example: "Specifies whether the client owns the final work, or if you retain rights to reuse components."
    },
    "confidentiality": {
      term: "Confidentiality / NDA",
      definition: "An agreement to keep certain information private and not share it with third parties.",
      example: "Client business strategies, pricing, customer lists, or trade secrets must be kept secret."
    },
    "termination": {
      term: "Termination",
      definition: "The conditions under which either party can end the contract before completion.",
      example: "Either party can end the contract with 30 days notice, or immediately if the other party breaches the agreement."
    },
    "dispute resolution": {
      term: "Dispute Resolution",
      definition: "The agreed-upon method for resolving disagreements, such as mediation, arbitration, or litigation.",
      example: "Parties agree to try mediation first before going to court, saving time and legal fees."
    },
    "governing law": {
      term: "Governing Law",
      definition: "Specifies which jurisdiction's laws will apply to interpret and enforce the contract.",
      example: "This agreement is governed by the laws of California - any disputes would use CA law."
    },
    "scope of work": {
      term: "Scope of Work",
      definition: "A detailed description of what work will be performed, deliverables, and boundaries of the project.",
      example: "Includes 5 web pages, logo design, and mobile responsive layout. Does NOT include ongoing maintenance."
    },
    "deliverables": {
      term: "Deliverables",
      definition: "The tangible items or outputs that will be provided upon completion of the work.",
      example: "Final website files, source code, design assets, and documentation."
    },
  };

  // Contract checklist items with quick-insert snippets
  const contractChecklist = [
    { 
      id: "parties", 
      label: "Parties Identified", 
      description: "Client and provider names/details included", 
      keywords: ["client", "provider", "contractor", "company", "name"],
      quickInsert: "PARTIES\n\nThis Agreement is made between:\n\nSERVICE PROVIDER:\nName: {{providerName}}\nEmail: {{providerEmail}}\n\nCLIENT:\nName: {{clientName}}\nEmail: {{clientEmail}}\n\n"
    },
    { 
      id: "scope", 
      label: "Scope of Work", 
      description: "Clear description of what will be delivered", 
      keywords: ["scope", "services", "work", "deliverables", "description"],
      quickInsert: "SCOPE OF WORK\n\nThe Service Provider agrees to perform:\n\n{{serviceDescription}}\n\nDELIVERABLES:\n- {{deliverable1}}\n- {{deliverable2}}\n- {{deliverable3}}\n\n"
    },
    { 
      id: "timeline", 
      label: "Timeline & Deadlines", 
      description: "Start date, end date, milestones defined", 
      keywords: ["date", "timeline", "deadline", "milestone", "start", "end", "delivery"],
      quickInsert: "TIMELINE\n\nStart Date: {{startDate}}\nCompletion: {{endDate}}\n\nMILESTONES:\n1. {{milestone1}} - {{milestone1Date}}\n2. {{milestone2}} - {{milestone2Date}}\n\n"
    },
    { 
      id: "payment", 
      label: "Payment Terms", 
      description: "Total amount, deposit, payment schedule", 
      keywords: ["payment", "amount", "deposit", "fee", "rate", "price", "compensation"],
      quickInsert: "PAYMENT TERMS\n\nTotal Fee: ${{totalAmount}}\n\nPayment Schedule:\n- Deposit (50%): ${{depositAmount}} - Due upon signing\n- Final (50%): Due upon completion\n\nLate Fee: {{lateFee}}% per month\n\n"
    },
    { 
      id: "revisions", 
      label: "Revision Policy", 
      description: "Number of revisions included, additional revision costs", 
      keywords: ["revision", "changes", "modifications", "rounds"],
      quickInsert: "REVISIONS\n\n{{revisionCount}} revision rounds included.\nAdditional revisions: ${{revisionRate}}/hour.\n\n"
    },
    { 
      id: "ownership", 
      label: "Ownership/IP Rights", 
      description: "Who owns the final work product", 
      keywords: ["ownership", "intellectual property", "rights", "ip", "copyright"],
      quickInsert: "INTELLECTUAL PROPERTY\n\nUpon full payment, all deliverables become Client property.\nService Provider retains portfolio rights.\n\n"
    },
    { 
      id: "confidentiality", 
      label: "Confidentiality", 
      description: "Protection of sensitive information", 
      keywords: ["confidential", "nda", "secret", "private", "proprietary"],
      quickInsert: "CONFIDENTIALITY\n\nBoth parties agree to keep confidential all business information, trade secrets, and proprietary data shared during this engagement.\n\n"
    },
    { 
      id: "termination", 
      label: "Termination Clause", 
      description: "How either party can end the agreement", 
      keywords: ["termination", "cancel", "end", "terminate"],
      quickInsert: "TERMINATION\n\nEither party may terminate with {{noticePeriod}} days written notice.\nUpon termination, Client pays for completed work.\n\n"
    },
    { 
      id: "liability", 
      label: "Liability Limits", 
      description: "Cap on damages and exclusions", 
      keywords: ["liability", "damages", "limitation", "responsible"],
      quickInsert: "LIMITATION OF LIABILITY\n\nTotal liability shall not exceed the amount paid under this agreement.\nNeither party liable for indirect or consequential damages.\n\n"
    },
    { 
      id: "signatures", 
      label: "Signature Block", 
      description: "Space for both parties to sign", 
      keywords: ["signature", "sign", "agreed", "accepted", "date"],
      quickInsert: "\n---\n\nAGREED AND ACCEPTED:\n\nProvider: _________________________ Date: _________\n\nClient: _________________________ Date: _________\n"
    },
  ];

  // Smart insert function for missing sections
  const insertMissingSection = (sectionId: string) => {
    const section = contractChecklist.find(s => s.id === sectionId);
    if (!section || !section.quickInsert) return;
    
    // Check if content already has this section (avoid duplicates)
    const lowerContent = content.toLowerCase();
    if (section.keywords.some(keyword => lowerContent.includes(keyword))) {
      toast({ 
        title: "Section may already exist", 
        description: `Your contract appears to already have ${section.label}. Adding anyway...`,
      });
    }
    
    // Smart positioning: Try to insert in logical order
    const sectionOrder = ["parties", "scope", "timeline", "payment", "revisions", "ownership", "confidentiality", "termination", "liability", "signatures"];
    const currentIndex = sectionOrder.indexOf(sectionId);
    
    let insertPosition = content.length;
    let insertPrefix = "\n\n";
    
    // If signatures, always add at end
    if (sectionId === "signatures") {
      insertPosition = content.length;
    } 
    // If parties, add at beginning (after any existing header)
    else if (sectionId === "parties") {
      const headerMatch = content.match(/^([\s\S]*?)(---|\n\n)/);
      if (headerMatch) {
        insertPosition = headerMatch[0].length;
      } else {
        insertPosition = 0;
        insertPrefix = "";
      }
    }
    // Otherwise, try to find a logical position
    else {
      // Look for sections that should come after this one
      for (let i = currentIndex + 1; i < sectionOrder.length; i++) {
        const laterSection = contractChecklist.find(s => s.id === sectionOrder[i]);
        if (laterSection) {
          for (const keyword of laterSection.keywords) {
            const keywordIndex = lowerContent.indexOf(keyword);
            if (keywordIndex > 0) {
              // Find the start of the line containing this keyword
              const lineStart = content.lastIndexOf("\n", keywordIndex);
              if (lineStart > 0) {
                insertPosition = lineStart;
                break;
              }
            }
          }
        }
        if (insertPosition !== content.length) break;
      }
    }
    
    // Insert the section
    const newContent = 
      content.slice(0, insertPosition) + 
      insertPrefix + 
      section.quickInsert + 
      content.slice(insertPosition);
    
    setContent(newContent);
    
    // Auto-add fields from the inserted section
    const placeholderRegex = /\{\{(\w+)\}\}/g;
    let match;
    const newFields: typeof customFields = [...customFields];
    while ((match = placeholderRegex.exec(section.quickInsert)) !== null) {
      const fieldId = match[1];
      if (!newFields.find(f => f.id === fieldId)) {
        newFields.push({
          id: fieldId,
          label: fieldId.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase()).trim(),
          type: fieldId.includes("date") || fieldId.includes("Date") ? "date" : 
                fieldId.includes("amount") || fieldId.includes("Amount") || fieldId.includes("fee") || fieldId.includes("rate") || fieldId.includes("Rate") ? "number" : 
                fieldId.includes("description") || fieldId.includes("Description") ? "textarea" : "text",
          placeholder: `Enter ${fieldId.replace(/([A-Z])/g, " $1").replace(/_/g, " ").toLowerCase()}`,
          required: false,
        });
      }
    }
    setCustomFields(newFields);
    
    toast({ 
      title: `✅ ${section.label} added!`, 
      description: `Section inserted with ${newFields.length - customFields.length} new fields.` 
    });
  };

  // Detect sections in the contract content
  const detectSections = (): Array<{ id: string; label: string; content: string; order: number }> => {
    const sections: Array<{ id: string; label: string; content: string; order: number }> = [];
    const sectionOrder = ["parties", "scope", "timeline", "payment", "revisions", "ownership", "confidentiality", "termination", "liability", "signatures"];
    
    if (!content || !content.trim()) return sections;
    
    // Split by double newlines first (sections are typically separated by blank lines)
    const paragraphs = content.split(/\n\s*\n/);
    const lowerContent = content.toLowerCase();
    
    // Try to identify sections by matching against checklist keywords
    let currentSectionId: string | null = null;
    let currentSectionLabel = "";
    let currentContent: string[] = [];
    
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i].trim();
      if (!para) continue;
      
      const firstLine = para.split('\n')[0].trim();
      const lowerFirstLine = firstLine.toLowerCase();
      
      // Check if this paragraph starts with a section header
      // Look for: ALL CAPS headers, numbered sections, or section keywords
      const isLikelyHeader = 
        (firstLine.length > 3 && firstLine === firstLine.toUpperCase() && firstLine.match(/^[A-Z][A-Z\s&\/\-]+$/)) ||
        firstLine.match(/^\d+[\.\)]\s+[A-Z]/) ||
        firstLine.match(/^[A-Z][A-Z\s&]+$/) && firstLine.length < 100;
      
      if (isLikelyHeader || lowerFirstLine.includes('---') || lowerFirstLine.match(/^agreed/i)) {
        // Save previous section
        if (currentSectionId && currentContent.length > 0) {
          sections.push({
            id: currentSectionId,
            label: currentSectionLabel || contractChecklist.find(s => s.id === currentSectionId)?.label || currentSectionId,
            content: currentContent.join('\n\n'),
            order: sectionOrder.indexOf(currentSectionId) >= 0 ? sectionOrder.indexOf(currentSectionId) : 999
          });
        }
        
        // Identify section by keywords
        let matchedId: string | null = null;
        let matchScore = 0;
        
        for (const section of contractChecklist) {
          let score = 0;
          for (const keyword of section.keywords) {
            if (lowerFirstLine.includes(keyword.toLowerCase())) {
              score += keyword.length; // Longer keywords = higher confidence
            }
            if (lowerContent.includes(keyword.toLowerCase())) {
              score += 1;
            }
          }
          if (score > matchScore) {
            matchScore = score;
            matchedId = section.id;
          }
        }
        
        // Handle special cases
        if (!matchedId) {
          if (lowerFirstLine.includes('agreed') || lowerFirstLine.includes('signature') || lowerFirstLine.includes('accept')) {
            matchedId = "signatures";
          } else if (lowerFirstLine.includes('party') || lowerFirstLine.includes('client') || lowerFirstLine.includes('provider') || lowerFirstLine.includes('contractor')) {
            matchedId = "parties";
          } else if (lowerFirstLine.includes('payment') || lowerFirstLine.includes('fee') || lowerFirstLine.includes('compensation') || lowerFirstLine.includes('amount')) {
            matchedId = "payment";
          } else if (lowerFirstLine.includes('scope') || lowerFirstLine.includes('work') || lowerFirstLine.includes('services')) {
            matchedId = "scope";
          } else if (lowerFirstLine.includes('timeline') || lowerFirstLine.includes('deadline') || lowerFirstLine.includes('schedule')) {
            matchedId = "timeline";
          }
        }
        
        if (matchedId) {
          currentSectionId = matchedId;
          currentSectionLabel = contractChecklist.find(s => s.id === matchedId)?.label || matchedId;
          currentContent = [para];
        } else {
          // Unknown section - use first line as label
          currentSectionId = "unknown";
          currentSectionLabel = firstLine.substring(0, 50);
          currentContent = [para];
        }
      } else {
        // Regular paragraph - add to current section or start new unknown
        if (currentSectionId) {
          currentContent.push(para);
        } else {
          // Check if this might be a section by content keywords
          let matchedId: string | null = null;
          for (const section of contractChecklist) {
            if (section.keywords.some(kw => lowerContent.includes(kw.toLowerCase()))) {
              matchedId = section.id;
              break;
            }
          }
          currentSectionId = matchedId || "unknown";
          currentSectionLabel = matchedId ? (contractChecklist.find(s => s.id === matchedId)?.label || matchedId) : "Unknown Section";
          currentContent = [para];
        }
      }
    }
    
    // Save last section
    if (currentSectionId && currentContent.length > 0) {
      sections.push({
        id: currentSectionId,
        label: currentSectionLabel || contractChecklist.find(s => s.id === currentSectionId)?.label || currentSectionId,
        content: currentContent.join('\n\n'),
        order: sectionOrder.indexOf(currentSectionId) >= 0 ? sectionOrder.indexOf(currentSectionId) : 999
      });
    }
    
    // If no sections detected, treat entire content as one section
    if (sections.length === 0 && content.trim()) {
      sections.push({
        id: "unknown",
        label: "Contract Content",
        content: content.trim(),
        order: 999
      });
    }
    
    return sections;
  };

  // Auto-reorder contract sections to proper order
  const autoReorderContract = () => {
    if (!content.trim()) {
      toast({ title: "No content", description: "Contract is empty. Add some sections first.", variant: "destructive" });
      return;
    }
    
    const sections = detectSections();
    
    if (sections.length === 0 || (sections.length === 1 && sections[0].id === "unknown")) {
      toast({ 
        title: "No sections detected", 
        description: "Could not detect distinct sections. Try adding section headers in ALL CAPS (e.g., 'PAYMENT TERMS', 'SCOPE OF WORK').",
        variant: "destructive" 
      });
      return;
    }
    
    // Sort sections by proper order
    const sectionOrder = ["parties", "scope", "timeline", "payment", "revisions", "ownership", "confidentiality", "termination", "liability", "signatures"];
    const sortedSections = [...sections].sort((a, b) => {
      const aOrder = sectionOrder.indexOf(a.id) >= 0 ? sectionOrder.indexOf(a.id) : 999;
      const bOrder = sectionOrder.indexOf(b.id) >= 0 ? sectionOrder.indexOf(b.id) : 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      // If same order (both unknown), maintain original order
      return sections.indexOf(a) - sections.indexOf(b);
    });
    
    // Separate known and unknown sections
    const knownSections = sortedSections.filter(s => s.id !== "unknown");
    const unknownSections = sortedSections.filter(s => s.id === "unknown");
    const signatureSection = sortedSections.find(s => s.id === "signatures");
    const nonSigKnownSections = knownSections.filter(s => s.id !== "signatures");
    
    // Check if already in correct order
    const isAlreadyOrdered = sections.length === sortedSections.length && 
      sections.every((section, index) => section.id === sortedSections[index].id);
    
    if (isAlreadyOrdered) {
      toast({ 
        title: "Already in order", 
        description: "Your contract sections are already in the correct order!" 
      });
      return;
    }
    
    // Build new content
    let newContent = "";
    
    // Add title if exists and not already in content
    if (title && !content.toLowerCase().includes(title.toLowerCase())) {
      newContent = `${title}\n\n`;
    }
    
    // Add known sections (excluding signatures) in proper order
    if (nonSigKnownSections.length > 0) {
      newContent += nonSigKnownSections.map(s => s.content.trim()).join("\n\n");
    }
    
    // Add unknown sections before signatures
    if (unknownSections.length > 0) {
      if (newContent) newContent += "\n\n";
      newContent += unknownSections.map(s => s.content.trim()).join("\n\n");
    }
    
    // Always add signatures last
    if (signatureSection) {
      if (newContent) newContent += "\n\n";
      newContent += signatureSection.content.trim();
    }
    
    // If no content yet, use original (shouldn't happen, but safety check)
    if (!newContent.trim()) {
      newContent = content;
    }
    
    setContent(newContent.trim());
    
    toast({ 
      title: "✅ Contract reordered!", 
      description: `Reorganized ${sections.length} section${sections.length !== 1 ? 's' : ''} into proper contract format.` 
    });
  };

  // Get current section order for display
  const getCurrentSectionOrder = () => {
    return detectSections();
  };

  // Move section up or down in the contract
  const moveSection = (sectionIndex: number, direction: "up" | "down") => {
    const sections = detectSections();
    
    if (sections.length <= 1) {
      toast({ title: "Not enough sections", description: "Need at least 2 sections to reorder.", variant: "destructive" });
      return;
    }
    
    const newIndex = direction === "up" ? sectionIndex - 1 : sectionIndex + 1;
    
    if (newIndex < 0 || newIndex >= sections.length) {
      return; // Can't move beyond boundaries
    }
    
    // Swap sections in array
    const reorderedSections = [...sections];
    [reorderedSections[sectionIndex], reorderedSections[newIndex]] = 
      [reorderedSections[newIndex], reorderedSections[sectionIndex]];
    
    // Rebuild content with new order
    let newContent = "";
    
    // Preserve title if exists
    if (title && !content.toLowerCase().includes(title.toLowerCase())) {
      newContent = `${title}\n\n`;
    }
    
    // Add sections in new order
    newContent += reorderedSections.map(s => s.content.trim()).join("\n\n");
    
    setContent(newContent.trim());
    
    toast({ 
      title: "Section moved", 
      description: `Moved "${reorderedSections[newIndex].label}" ${direction === "up" ? "up" : "down"}.` 
    });
  };

  // Common misspellings to check (defined before checkContract)
  const commonMisspellings: Record<string, string> = {
    "recieve": "receive",
    "seperate": "separate",
    "occured": "occurred",
    "accomodate": "accommodate",
    "definately": "definitely",
    "neccessary": "necessary",
    "acheive": "achieve",
    "beleive": "believe",
    "calender": "calendar",
    "commitee": "committee",
    "concensus": "consensus",
    "embarass": "embarrass",
    "enviroment": "environment",
    "existance": "existence",
    "foriegn": "foreign",
    "goverment": "government",
    "harrass": "harass",
    "independant": "independent",
    "judgement": "judgment",
    "knowlege": "knowledge",
    "liason": "liaison",
    "maintainance": "maintenance",
    "mispell": "misspell",
    "noticable": "noticeable",
    "paralell": "parallel",
    "priviledge": "privilege",
    "publically": "publicly",
    "recomend": "recommend",
    "refered": "referred",
    "relevent": "relevant",
    "responsability": "responsibility",
    "succesful": "successful",
    "supercede": "supersede",
    "threshhold": "threshold",
    "transfered": "transferred",
    "untill": "until",
    "wierd": "weird",
    "writting": "writing",
    "agreeement": "agreement",
    "contractt": "contract",
    "payemnt": "payment",
    "clinet": "client",
    "servies": "services",
    "deliverbles": "deliverables",
  };

  // Check contract for errors and typos
  const checkContract = () => {
    if (!content.trim()) {
      toast({ 
        title: "No content to check", 
        description: "Please add some content to your contract first.", 
        variant: "destructive" 
      });
      return;
    }

    setIsCheckingContract(true);
    const errors: Array<{
      type: string;
      message: string;
      position?: number;
      fix?: string;
      original?: string;
    }> = [];

    let fixedContent = content;

    // 1. Check for double spaces
    const doubleSpaceMatches = content.matchAll(/  +/g);
    for (const match of doubleSpaceMatches) {
      errors.push({
        type: "formatting",
        message: "Double or multiple spaces found",
        position: match.index,
        fix: " ",
        original: match[0],
      });
    }
    fixedContent = fixedContent.replace(/  +/g, " ");

    // 2. Check for missing space after periods (before capital letters)
    const missingSpaceMatches = content.matchAll(/\.([A-Z])/g);
    for (const match of missingSpaceMatches) {
      errors.push({
        type: "punctuation",
        message: "Missing space after period",
        position: match.index,
        fix: `. ${match[1]}`,
        original: match[0],
      });
    }
    fixedContent = fixedContent.replace(/\.([A-Z])/g, ". $1");

    // 3. Check for missing space after commas
    const missingCommaSpaceMatches = content.matchAll(/,\S/g);
    for (const match of missingCommaSpaceMatches) {
      if (!match[0].includes("$") && !match[0].includes("%")) {
        errors.push({
          type: "punctuation",
          message: "Missing space after comma",
          position: match.index,
          fix: ", ",
          original: match[0],
        });
      }
    }
    fixedContent = fixedContent.replace(/,(?![0-9$%])/g, ", ");

    // 4. Check for common misspellings
    for (const [wrong, correct] of Object.entries(commonMisspellings)) {
      const regex = new RegExp(`\\b${wrong}\\b`, "gi");
      const matches = content.matchAll(regex);
      for (const match of matches) {
        errors.push({
          type: "spelling",
          message: `Possible misspelling: "${wrong}" should be "${correct}"`,
          position: match.index,
          fix: correct,
          original: match[0],
        });
      }
      fixedContent = fixedContent.replace(regex, correct);
    }

    // 5. Check for inconsistent capitalization of common legal terms
    const legalTerms = {
      "contract": "Contract",
      "agreement": "Agreement",
      "party": "Party",
      "client": "Client",
      "service provider": "Service Provider",
    };
    
    // Check for lowercase legal terms at start of sentences
    for (const [lowercase, proper] of Object.entries(legalTerms)) {
      const regex = new RegExp(`(^|\\.\\s+|\\n\\s*)${lowercase}\\b`, "gi");
      const matches = content.matchAll(regex);
      for (const match of matches) {
        if (match[0] !== match[0].replace(lowercase, proper)) {
          errors.push({
            type: "capitalization",
            message: `Consider capitalizing "${lowercase}" → "${proper}"`,
            position: match.index,
            fix: match[0].replace(lowercase, proper),
            original: match[0],
          });
        }
      }
    }

    // 6. Check for multiple exclamation/question marks (unprofessional)
    const excessivePunctuation = content.matchAll(/([!?]){2,}/g);
    for (const match of excessivePunctuation) {
      errors.push({
        type: "formatting",
        message: "Excessive punctuation marks (unprofessional)",
        position: match.index,
        fix: match[1],
        original: match[0],
      });
    }
    fixedContent = fixedContent.replace(/([!?]){2,}/g, "$1");

    // 7. Check for spaces before punctuation
    const spaceBeforePunct = content.matchAll(/\s+([,.!?;:])/g);
    for (const match of spaceBeforePunct) {
      errors.push({
        type: "punctuation",
        message: "Space before punctuation",
        position: match.index,
        fix: match[1],
        original: match[0],
      });
    }
    fixedContent = fixedContent.replace(/\s+([,.!?;:])/g, "$1");

    // 8. Check for missing periods at end of sentences (heuristic)
    const lines = content.split("\n");
    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (trimmed.length > 50 && !trimmed.match(/[.!?]$/) && !trimmed.endsWith(":") && !trimmed.match(/^\d+\./)) {
        // Long line without ending punctuation - might be missing period
        // This is a soft check, so we'll just note it
      }
    });

    // 9. Check for inconsistent use of apostrophes in contractions
    const apostropheIssues = content.matchAll(/\b(cant|wont|dont|isnt|arent|wasnt|werent|havent|hasnt|hadnt|shouldnt|couldnt|wouldnt)\b/gi);
    for (const match of apostropheIssues) {
      const word = match[0].toLowerCase();
      const fixed = word.replace(/([a-z])(nt)/, "$1'n$2");
      errors.push({
        type: "punctuation",
        message: `Missing apostrophe: "${word}" → "${fixed}"`,
        position: match.index,
        fix: fixed,
        original: match[0],
      });
    }
    fixedContent = fixedContent.replace(/\b(cant|wont|dont|isnt|arent|wasnt|werent|havent|hasnt|hadnt|shouldnt|couldnt|wouldnt)\b/gi, 
      (match) => match.replace(/([a-z])(nt)/i, "$1'n$2"));

    // 10. Check for missing spaces around parentheses
    const missingSpaceParen = content.matchAll(/[^\s]\(|\)[^\s.,!?;:\s)]/g);
    for (const match of missingSpaceParen) {
      if (!match[0].match(/\([A-Z]/) && !match[0].match(/\d\)/)) {
        errors.push({
          type: "formatting",
          message: "Missing space around parentheses",
          position: match.index,
        });
      }
    }

    // 11. Check for tabs (should use spaces)
    if (content.includes("\t")) {
      errors.push({
        type: "formatting",
        message: "Tab characters found (should use spaces)",
      });
      fixedContent = fixedContent.replace(/\t/g, "  ");
    }

    // 12. Check for trailing whitespace
    const trailingSpaceMatches = content.matchAll(/[ \t]+$/gm);
    for (const match of trailingSpaceMatches) {
      errors.push({
        type: "formatting",
        message: "Trailing whitespace at end of line",
        position: match.index,
        fix: "",
        original: match[0],
      });
    }
    fixedContent = fixedContent.replace(/[ \t]+$/gm, "");

    // 13. Check for multiple blank lines (more than 2)
    const multipleBlanks = content.matchAll(/\n{3,}/g);
    for (const match of multipleBlanks) {
      errors.push({
        type: "formatting",
        message: "Multiple blank lines (should be max 2)",
        position: match.index,
        fix: "\n\n",
        original: match[0],
      });
    }
    fixedContent = fixedContent.replace(/\n{3,}/g, "\n\n");

    // Remove duplicate errors (same position)
    const uniqueErrors = errors.filter((error, index, self) =>
      index === self.findIndex((e) => e.position === error.position && e.type === error.type)
    );

    setContractErrors(uniqueErrors);
    setIsCheckingContract(false);
    setShowContractChecker(true);
    setShowToolsMenu(false);

    if (uniqueErrors.length === 0) {
      toast({
        title: "✅ No errors found!",
        description: "Your contract looks good. No issues detected.",
      });
    } else {
      toast({
        title: `Found ${uniqueErrors.length} issue${uniqueErrors.length !== 1 ? 's' : ''}`,
        description: uniqueErrors.length > 10 
          ? "Many issues found. Use 'Auto-Fix All' to correct them."
          : "Review the issues below and use Auto-Fix to correct them.",
      });
    }
  };

  // Auto-fix all detected errors
  const autoFixAllErrors = () => {
    if (contractErrors.length === 0) {
      toast({ title: "No errors to fix", description: "All errors have already been fixed." });
      return;
    }

    let fixedContent = content;

    // Apply all fixes in reverse order to maintain positions
    const sortedErrors = [...contractErrors].sort((a, b) => (b.position || 0) - (a.position || 0));

    for (const error of sortedErrors) {
      if (error.fix && error.original !== undefined && error.position !== undefined) {
        const before = fixedContent.substring(0, error.position);
        const after = fixedContent.substring(error.position + (error.original.length));
        fixedContent = before + error.fix + after;
      }
    }

    // Apply global fixes
    fixedContent = fixedContent
      .replace(/  +/g, " ") // Double spaces
      .replace(/\.([A-Z])/g, ". $1") // Missing space after period
      .replace(/,(?![0-9$%])/g, ", ") // Missing space after comma
      .replace(/([!?]){2,}/g, "$1") // Multiple punctuation
      .replace(/\s+([,.!?;:])/g, "$1") // Space before punctuation
      .replace(/\t/g, "  ") // Tabs to spaces
      .replace(/[ \t]+$/gm, "") // Trailing whitespace
      .replace(/\n{3,}/g, "\n\n") // Multiple blank lines
      .replace(/\b(cant|wont|dont|isnt|arent|wasnt|werent|havent|hasnt|hadnt|shouldnt|couldnt|wouldnt)\b/gi, 
        (match) => match.replace(/([a-z])(nt)/i, "$1'n$2")); // Missing apostrophes

    // Fix common misspellings
    for (const [wrong, correct] of Object.entries(commonMisspellings)) {
      const regex = new RegExp(`\\b${wrong}\\b`, "gi");
      fixedContent = fixedContent.replace(regex, correct);
    }

    setContent(fixedContent);
    setContractErrors([]);
    toast({
      title: "✅ All errors fixed!",
      description: "Your contract has been automatically corrected.",
    });
  };


  // Check for unfilled placeholders
  const getUnfilledPlaceholders = () => {
    const placeholderRegex = /\{\{(\w+)\}\}/g;
    const unfilled: string[] = [];
    let match;
    while ((match = placeholderRegex.exec(content)) !== null) {
      const fieldId = match[1];
      if (!customFieldValues[fieldId] || customFieldValues[fieldId].trim() === "") {
        if (!unfilled.includes(fieldId)) {
          unfilled.push(fieldId);
        }
      }
    }
    return unfilled;
  };

  // Check for spelling errors
  const getSpellingWarnings = () => {
    const warnings: { word: string; suggestion: string; count: number }[] = [];
    Object.entries(commonMisspellings).forEach(([misspelled, correct]) => {
      const regex = new RegExp(`\\b${misspelled}\\b`, "gi");
      const matches = content.match(regex);
      if (matches) {
        warnings.push({ word: misspelled, suggestion: correct, count: matches.length });
      }
    });
    return warnings;
  };

  // Check checklist items
  const getChecklistStatus = () => {
    const lowerContent = content.toLowerCase();
    return contractChecklist.map(item => ({
      ...item,
      checked: item.keywords.some(keyword => lowerContent.includes(keyword))
    }));
  };

  // Find legal terms in content for tooltips
  const getLegalTermsInContent = () => {
    const lowerContent = content.toLowerCase();
    const foundTerms: string[] = [];
    Object.keys(legalTermDefinitions).forEach(term => {
      if (lowerContent.includes(term)) {
        foundTerms.push(term);
      }
    });
    return foundTerms;
  };

  // Calculate validation score
  const getValidationScore = () => {
    const checklist = getChecklistStatus();
    const checkedCount = checklist.filter(item => item.checked).length;
    const unfilledCount = getUnfilledPlaceholders().length;
    const spellingCount = getSpellingWarnings().length;
    
    let score = (checkedCount / checklist.length) * 100;
    score -= unfilledCount * 5;
    score -= spellingCount * 3;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const addField = () => {
    if (!newFieldLabel.trim()) return;
    
    const fieldId = newFieldLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    
    // Check if field already exists
    if (customFields.find(f => f.id === fieldId)) {
      toast({
        title: "Field already exists",
        description: `A field with ID "${fieldId}" already exists.`,
        variant: "destructive",
      });
      return;
    }
    
    const newField = {
      id: fieldId,
      label: newFieldLabel,
      type: newFieldType,
      placeholder: `Enter ${newFieldLabel.toLowerCase()}`,
      required: newFieldRequired,
    };
    
    setCustomFields([...customFields, newField]);
    setNewFieldLabel("");
    setNewFieldType("text");
    setNewFieldRequired(false);
    setShowAddField(false);
    
    toast({
      title: "Field added",
      description: `Use {{${fieldId}}} in your content to insert this field.`,
    });
  };

  const removeField = (fieldId: string) => {
    setCustomFields(customFields.filter(f => f.id !== fieldId));
    const newValues = { ...customFieldValues };
    delete newValues[fieldId];
    setCustomFieldValues(newValues);
  };

  const insertSnippet = (snippet: string) => {
    if (contentRef.current) {
      const start = contentRef.current.selectionStart;
      const end = contentRef.current.selectionEnd;
      const newContent = content.substring(0, start) + snippet + content.substring(end);
      setContent(newContent);
      
      // Extract field placeholders from snippet and add them as fields
      const placeholderRegex = /\{\{(\w+)\}\}/g;
      let match;
      const newFields: typeof customFields = [];
      while ((match = placeholderRegex.exec(snippet)) !== null) {
        const fieldId = match[1];
        if (!customFields.find(f => f.id === fieldId) && !newFields.find(f => f.id === fieldId)) {
          newFields.push({
            id: fieldId,
            label: fieldId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
            type: fieldId.includes("date") ? "date" : fieldId.includes("amount") ? "number" : "text",
            placeholder: `Enter ${fieldId.replace(/_/g, " ")}`,
            required: false,
          });
        }
      }
      if (newFields.length > 0) {
        setCustomFields([...customFields, ...newFields]);
        toast({
          title: "Fields detected",
          description: `Added ${newFields.length} field${newFields.length > 1 ? "s" : ""} from the snippet.`,
        });
      }
    } else {
      setContent(content + snippet);
    }
    setShowSnippets(false);
  };

  const copyFieldId = (fieldId: string) => {
    navigator.clipboard.writeText(`{{${fieldId}}}`);
    toast({
      title: "Copied!",
      description: `{{${fieldId}}} copied to clipboard`,
    });
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "textarea": return AlignLeft;
      case "date": return Calendar;
      case "number": return Hash;
      default: return Type;
    }
  };

  // Generate preview with field values
  const getPreviewContent = () => {
    let previewContent = content;
    // Replace template fields
    if (template) {
      template.fields.forEach((field) => {
        const value = values[field.id] || `[${field.label}]`;
        const regex = new RegExp(`\\{\\{${field.id}\\}\\}`, "gi");
        previewContent = previewContent.replace(regex, value);
      });
    }
    // Replace custom fields
    customFields.forEach((field) => {
      const value = customFieldValues[field.id] || `[${field.label}]`;
      const regex = new RegExp(`\\{\\{${field.id}\\}\\}`, "gi");
      previewContent = previewContent.replace(regex, value);
    });
    return previewContent;
  };

  // Export as PDF with branding
  const exportAsPDF = async () => {
    try {
      toast({ title: "Generating PDF...", description: "Please wait while we create your PDF." });
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({ title: "Error", description: "Please allow popups to export PDF", variant: "destructive" });
        return;
      }
      const previewContent = getPreviewContent();
      // Only use branding if user has access
      const pdfHtml = hasBrandingAccess 
        ? getBrandedPdfHtml(previewContent)
        : `<!DOCTYPE html><html><head><title>${title || "Contract"}</title><style>body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:40px;line-height:1.6;color:#333}h1{font-size:28px;color:#1e40af;margin:20px 0}.content{white-space:pre-wrap;font-size:12pt}</style></head><body><h1>${title || "Contract Agreement"}</h1><div class="content">${previewContent}</div></body></html>`;
      printWindow.document.write(pdfHtml);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); }, 500);
      toast({ title: "PDF Ready", description: "Use the print dialog to save as PDF." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
    }
  };

  // Export as Word
  const exportAsWord = () => {
    try {
      const previewContent = getPreviewContent();
      const htmlContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset="utf-8"><title>${title || "Contract"}</title><style>body { font-family: Calibri; font-size: 12pt; } h1 { font-size: 18pt; text-align: center; } .content { white-space: pre-wrap; }</style></head><body><h1>${title || "Contract Agreement"}</h1><div class="content">${previewContent.replace(/\n/g, "<br>")}</div></body></html>`;
      const blob = new Blob([htmlContent], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(title || "contract").replace(/[^a-z0-9]/gi, "_")}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded!", description: "Word document saved successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to export Word document", variant: "destructive" });
    }
  };

  // Export as Plain Text
  const exportAsText = () => {
    try {
      const previewContent = getPreviewContent();
      const textContent = `${title || "Contract Agreement"}\n${"=".repeat(50)}\n\n${previewContent}`;
      const blob = new Blob([textContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(title || "contract").replace(/[^a-z0-9]/gi, "_")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded!", description: "Text file saved successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to export text file", variant: "destructive" });
    }
  };

  // Copy to Clipboard
  const copyToClipboard = async () => {
    try {
      const previewContent = getPreviewContent();
      await navigator.clipboard.writeText(`${title || "Contract"}\n\n${previewContent}`);
      toast({ title: "Copied!", description: "Contract copied to clipboard." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy to clipboard", variant: "destructive" });
    }
  };

  // Import from file
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith(".txt")) {
        const text = await file.text();
        const lines = text.split("\n");
        setTitle(lines[0] || "Imported Contract");
        setContent(lines.slice(1).join("\n").trim() || text);
        toast({ title: "Imported!", description: "Text file imported successfully." });
      } else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
        const text = await file.text();
        const cleanText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        if (cleanText.length > 50) {
          setContent(cleanText);
          setTitle(file.name.replace(/\.(doc|docx)$/i, ""));
          toast({ title: "Imported!", description: "Document imported. Some formatting may be lost." });
        } else {
          toast({ title: "Limited Support", description: "For best results, copy and paste content from Word directly.", variant: "destructive" });
        }
      } else if (fileName.endsWith(".html") || fileName.endsWith(".htm")) {
        const html = await file.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        setTitle(doc.querySelector("title")?.textContent || file.name.replace(/\.(html|htm)$/i, ""));
        setContent((doc.body.textContent || "").trim());
        toast({ title: "Imported!", description: "HTML file imported successfully." });
      } else {
        toast({ title: "Unsupported Format", description: "Please use .txt, .doc, .docx, or .html files.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to import file", variant: "destructive" });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Send via Email
  const sendEmail = async () => {
    if (!emailTo.trim()) {
      toast({ title: "Error", description: "Please enter an email address", variant: "destructive" });
      return;
    }
    setSendingEmail(true);
    try {
      const previewContent = getPreviewContent();
      const subject = emailSubject || `Contract: ${title || "Agreement"}`;
      const body = emailMessage ? `${emailMessage}\n\n---\n\n${title}\n\n${previewContent}` : `${title || "Contract Agreement"}\n\n${previewContent}`;
      window.location.href = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast({ title: "Email Client Opened", description: "Your email client should open with the contract." });
      setShowEmailDialog(false);
      setEmailTo("");
      setEmailSubject("");
      setEmailMessage("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to open email client", variant: "destructive" });
    } finally {
      setSendingEmail(false);
    }
  };

  // If template has fields, show field form
  if (template && template.fields.length > 0) {
    return (
      <TooltipProvider>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-indigo-400" />
                Fill Template Fields
              </CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Enter values for the template fields
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
            {template.fields.map((field, index) => (
              <div key={`template-${field.id}-${index}`} className="space-y-2">
                <Label htmlFor={field.id} className="text-slate-300">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.id}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    value={values[field.id] || ""}
                    onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ) : (
                  <Input
                    id={field.id}
                    type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    value={values[field.id] || ""}
                    onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </div>
            ))}
            
            {/* Compensation Section */}
            <div className="pt-4 border-t border-slate-700 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <Checkbox
                  id="hasCompensation"
                  checked={hasCompensation}
                  onCheckedChange={(checked) => {
                    setHasCompensation(checked === true);
                    if (checked) {
                      // Set default compensation type when enabling compensation
                      if (!compensationType || compensationType === "no_compensation") {
                        setCompensationType("fixed_amount");
                      }
                    } else {
                      setCompensationType("no_compensation");
                      setPaymentTerms("");
                    }
                  }}
                  className="mt-0.5 border-slate-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="hasCompensation" className="text-slate-300 font-semibold cursor-pointer">
                      This contract includes payment or compensation
                    </Label>
                    <DollarSign className="h-4 w-4 text-indigo-400" />
                  </div>
                  {hasCompensation && (
                    <div className="space-y-3 pl-6 border-l-2 border-indigo-500/30">
                      <div className="space-y-2">
                        <Label className="text-slate-400 text-sm">Compensation Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setCompensationType("fixed_amount")}
                            className={`p-2 rounded-lg border text-sm transition-all ${
                              compensationType === "fixed_amount"
                                ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                                : "bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500"
                            }`}
                          >
                            Fixed Amount
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompensationType("hourly")}
                            className={`p-2 rounded-lg border text-sm transition-all ${
                              compensationType === "hourly"
                                ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                                : "bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500"
                            }`}
                          >
                            Hourly Rate
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompensationType("milestone")}
                            className={`p-2 rounded-lg border text-sm transition-all ${
                              compensationType === "milestone"
                                ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                                : "bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500"
                            }`}
                          >
                            Milestone-Based
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompensationType("other")}
                            className={`p-2 rounded-lg border text-sm transition-all ${
                              compensationType === "other"
                                ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                                : "bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500"
                            }`}
                          >
                            Other
                          </button>
                        </div>
                        {compensationType && compensationType !== "no_compensation" && (
                          <p className="text-xs text-indigo-400 mt-1">
                            Selected: {compensationType === "fixed_amount" && "Fixed Amount"}
                            {compensationType === "hourly" && "Hourly Rate"}
                            {compensationType === "milestone" && "Milestone-Based"}
                            {compensationType === "other" && "Other"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="paymentTerms" className="text-slate-400 text-sm">
                            Payment Terms & Legal Clauses
                          </Label>
                          <button
                            type="button"
                            onClick={() => setShowPaymentQuickInserts(!showPaymentQuickInserts)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                          >
                            <Zap className="h-3 w-3" />
                            Quick Inserts
                            <ChevronRight className={`h-3 w-3 transition-transform ${showPaymentQuickInserts ? 'rotate-90' : ''}`} />
                          </button>
                        </div>
                        {showPaymentQuickInserts && (
                          <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-900/10 mb-2 animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="h-3.5 w-3.5 text-indigo-400" />
                              <p className="text-xs font-medium text-indigo-300">Quick Insert Payment Clauses</p>
                              <span className="text-[10px] text-slate-500 ml-auto">Click to add</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                              {paymentTermTemplates.map((template) => (
                                <Tooltip key={template.id}>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newTerms = paymentTerms 
                                          ? `${paymentTerms}\n\n${template.template}`
                                          : template.template;
                                        setPaymentTerms(newTerms);
                                        toast({
                                          title: `✅ ${template.label} added`,
                                          description: "Payment clause inserted into terms.",
                                        });
                                      }}
                                      className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-600 bg-slate-700/50 hover:bg-indigo-600/30 hover:border-indigo-500 transition-all group"
                                    >
                                      <template.icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" />
                                      <span className="text-[10px] text-slate-300 group-hover:text-indigo-200 text-center leading-tight">{template.label}</span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="bg-slate-900 border-slate-700 max-w-xs p-2">
                                    <p className="text-xs text-white whitespace-pre-wrap">{template.template}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 text-center">
                              💡 Click any clause to insert it into your payment terms
                            </p>
                          </div>
                        )}
                        <Textarea
                          id="paymentTerms"
                          className="bg-slate-700/50 border-slate-600 text-white min-h-[100px]"
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          placeholder="E.g., Net 30 days, payment due upon completion, late fees, etc. Click 'Quick Inserts' above for common clauses."
                        />
                        <p className="text-xs text-slate-500">
                          Specify payment terms, schedules, penalties, and other legal payment-related clauses. Use Quick Inserts for common clauses.
                        </p>
                      </div>
                    </div>
                  )}
                  {!hasCompensation && (
                    <p className="text-xs text-slate-500 pl-6 border-l-2 border-slate-700">
                      No compensation or payment will be specified for this contract
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-700">
              <Button 
                variant="outline" 
                onClick={onBack}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => onSubmit(values, {
                  hasCompensation,
                  compensationType,
                  paymentTerms: hasCompensation ? paymentTerms : undefined,
                })}
                disabled={
                  template.fields
                    .filter((f) => f.required)
                    .some((f) => !values[f.id] || values[f.id].trim() === "")
                }
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Eye className="h-6 w-6 text-indigo-400" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose prose-invert max-w-none whitespace-pre-wrap bg-slate-900/50 rounded-lg p-4 max-h-[600px] overflow-y-auto text-slate-300">
              {getPreviewContent()}
            </div>
          </CardContent>
        </Card>
      </div>
      </TooltipProvider>
    );
  }

  // No template or no fields - show full contract builder from scratch
  return (
    <div className="space-y-6">
      {/* Contract Builder Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-shrink-0 min-w-0">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-purple-400 flex-shrink-0" />
            <span className="truncate">Contract Builder</span>
          </h2>
          <p className="text-slate-400 mt-1 text-sm line-clamp-2">Build your contract from scratch with custom fields</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSnippets(!showSnippets)}
            className={`border-slate-600 flex-shrink-0 ${showSnippets ? "bg-indigo-600 text-white border-indigo-500" : "text-slate-300 hover:bg-slate-700"}`}
          >
            <Sparkles className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Quick Insert</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLegalClauses(!showLegalClauses)}
            className={`border-slate-600 flex-shrink-0 ${showLegalClauses ? "bg-purple-600 text-white border-purple-500" : "text-slate-300 hover:bg-slate-700"}`}
          >
            <Shield className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Legal Clauses</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowTemplates(!showTemplates); setShowSnippets(false); setShowLegalClauses(false); }}
            className={`border-slate-600 flex-shrink-0 ${showTemplates ? "bg-green-600 text-white border-green-500" : "text-slate-300 hover:bg-slate-700"}`}
          >
            <FileText className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Templates</span>
          </Button>
          <div className="h-6 w-px bg-slate-600 hidden sm:block" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveDraftToDatabase(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-green-500 hover:text-green-400 flex-shrink-0"
          >
            <FileCheck className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Save Draft</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (hasBrandingAccess === false) {
                toast({
                  title: "Branding Unavailable",
                  description: "Custom branding is only available for Pro and Premium plans. Upgrade to unlock this feature.",
                  variant: "destructive",
                });
                return;
              }
              setShowBranding(!showBranding);
              setShowPdfPreview(false);
              setShowTemplates(false);
            }}
            disabled={hasBrandingAccess === false}
            className={`border-slate-600 flex-shrink-0 ${
              hasBrandingAccess === false 
                ? "opacity-50 cursor-not-allowed text-slate-500" 
                : showBranding 
                ? "bg-pink-600 text-white border-pink-500" 
                : "text-slate-300 hover:bg-slate-700"
            }`}
            title={hasBrandingAccess === false ? "Upgrade to Pro or Premium to unlock branding" : "Company Branding"}
          >
            <Building className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Branding</span>
            {hasBrandingAccess === false && <Lock className="h-3 w-3 ml-1" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowPdfPreview(!showPdfPreview); setShowBranding(false); setShowTemplates(false); }}
            className={`border-slate-600 flex-shrink-0 ${showPdfPreview ? "bg-red-600 text-white border-red-500" : "text-slate-300 hover:bg-slate-700"}`}
          >
            <Eye className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">PDF Preview</span>
          </Button>
          {lastSaved && (
            <span className="text-xs text-slate-500 flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="hidden sm:inline">Saved </span>
              <span className="truncate">{lastSaved.toLocaleTimeString()}</span>
            </span>
          )}
        </div>
      </div>

      {/* Draft Status Bar */}
      {(lastSaved || (title.trim() || content.trim())) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${lastSaved ? "bg-green-500" : "bg-amber-500"} animate-pulse`} />
            <span className="text-sm text-slate-400 truncate">
              {lastSaved ? `Draft saved ${lastSaved.toLocaleString()}` : "Unsaved changes"}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => saveDraftToDatabase(false)} disabled={savingDraft} className="text-slate-400 hover:text-green-400 hover:bg-green-500/10">
              <FileCheck className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Save Now</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={clearDraft} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Clear Draft</span>
            </Button>
          </div>
        </div>
      )}

      {/* Templates Panel */}
      {showTemplates && (
        <Card className="border-2 border-green-500/30 bg-slate-800/95 animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-green-400" />
              <span className="text-sm font-semibold text-slate-300">Start with a Template</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {contractTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  className="text-left p-4 rounded-lg border border-slate-700 bg-slate-700/50 hover:border-green-500 hover:bg-green-500/10 transition-all group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                      <template.icon className="h-5 w-5 text-green-400 group-hover:text-green-300" />
                    </div>
                    <div className="font-semibold text-white text-sm text-center group-hover:text-green-100">{template.name}</div>
                    <div className="text-xs text-slate-400 text-center">{template.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branding Panel - Enhanced */}
      {showBranding && (
        <Card className="border-2 border-pink-500/30 bg-slate-800/95 animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4">
            {hasBrandingAccess === false ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center border-2 border-slate-600">
                  <Lock className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Custom Branding</h3>
                <p className="text-slate-400 max-w-md mx-auto mb-6 text-sm">
                  Custom branding is only available for Pro and Premium plans. Upgrade to unlock logo uploads, custom colors, and branded PDFs.
                </p>
                <Link href="/dashboard/settings?tab=subscription">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                    Upgrade to Pro
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-pink-400" />
                <span className="text-sm font-semibold text-slate-300">Company Branding</span>
              </div>
              <Button size="sm" onClick={saveBranding} className="bg-pink-600 hover:bg-pink-700 text-white"><FileCheck className="h-3.5 w-3.5 mr-1" />Save</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Logo */}
              <div className="space-y-2 p-2 rounded-lg bg-slate-700/20 border border-slate-700">
                <div className="text-xs font-medium text-white flex items-center gap-1"><Upload className="h-3 w-3 text-pink-400" />Logo</div>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <div onClick={() => logoInputRef.current?.click()} className="w-full h-16 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-500 transition-all">
                  {branding.logo ? <Image src={branding.logo} alt="Logo" width={48} height={48} className="max-h-12 object-contain" style={{ opacity: branding.logoOpacity / 100 }} unoptimized /> : <Upload className="h-4 w-4 text-slate-500" />}
                </div>
                {branding.logo && (
                  <>
                    <div className="grid grid-cols-2 gap-1">
                      {(["header", "watermark", "footer", "corner"] as const).map((pos) => (
                        <button key={pos} onClick={() => setBranding({ ...branding, logoPosition: pos })} className={`py-1 rounded text-[9px] ${branding.logoPosition === pos ? "bg-pink-600 text-white" : "bg-slate-700 text-slate-400"}`}>{pos}</button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-400">Opacity</span>
                      <input type="range" min="10" max="100" value={branding.logoOpacity} onChange={(e) => setBranding({ ...branding, logoOpacity: parseInt(e.target.value) })} className="flex-1 h-1 accent-pink-500" />
                      <span className="text-[9px] text-slate-400">{branding.logoOpacity}%</span>
                    </div>
                  </>
                )}
              </div>

              {/* Company & Colors */}
              <div className="space-y-2 p-2 rounded-lg bg-slate-700/20 border border-slate-700">
                <div className="text-xs font-medium text-white flex items-center gap-1"><Type className="h-3 w-3 text-purple-400" />Company</div>
                <Input value={branding.companyName} onChange={(e) => setBranding({ ...branding, companyName: e.target.value })} placeholder="Company Name" className="bg-slate-700/50 border-slate-600 text-white text-xs h-7" />
                <div className="grid grid-cols-3 gap-1">
                  <div><Label className="text-[9px] text-slate-400">Primary</Label><input type="color" value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} className="w-full h-6 rounded cursor-pointer border border-slate-600" /></div>
                  <div><Label className="text-[9px] text-slate-400">Secondary</Label><input type="color" value={branding.secondaryColor} onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })} className="w-full h-6 rounded cursor-pointer border border-slate-600" /></div>
                  <div><Label className="text-[9px] text-slate-400">Accent</Label><input type="color" value={branding.accentColor} onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })} className="w-full h-6 rounded cursor-pointer border border-slate-600" /></div>
                </div>
              </div>

              {/* Layout */}
              <div className="space-y-2 p-2 rounded-lg bg-slate-700/20 border border-slate-700">
                <div className="text-xs font-medium text-white flex items-center gap-1"><AlignLeft className="h-3 w-3 text-blue-400" />Layout</div>
                <select value={branding.fontFamily} onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })} className="w-full h-7 rounded border border-slate-600 bg-slate-700/50 px-2 text-[10px] text-white">
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="Calibri, sans-serif">Calibri</option>
                  <option value="Arial, sans-serif">Arial</option>
                </select>
                <div className="flex gap-1">
                  {(["left", "centered", "right"] as const).map((align) => (
                    <button key={align} onClick={() => setBranding({ ...branding, headerStyle: align })} className={`flex-1 py-1 rounded text-[9px] ${branding.headerStyle === align ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"}`}>{align === "centered" ? "Center" : align.charAt(0).toUpperCase()}</button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {(["none", "solid", "double", "dashed"] as const).map((style) => (
                    <button key={style} onClick={() => setBranding({ ...branding, borderStyle: style, showBorder: style !== "none" })} className={`flex-1 py-1 rounded text-[9px] ${branding.borderStyle === style ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"}`}>{style.charAt(0).toUpperCase()}</button>
                  ))}
                </div>
              </div>

              {/* Extras */}
              <div className="space-y-2 p-2 rounded-lg bg-slate-700/20 border border-slate-700">
                <div className="text-xs font-medium text-white flex items-center gap-1"><Eye className="h-3 w-3 text-green-400" />Extras</div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={branding.showWatermark} onChange={(e) => setBranding({ ...branding, showWatermark: e.target.checked })} className="rounded border-slate-600 h-3 w-3" />
                  <span className="text-[10px] text-slate-400">Watermark</span>
                </div>
                {branding.showWatermark && <Input value={branding.watermarkText} onChange={(e) => setBranding({ ...branding, watermarkText: e.target.value })} placeholder="DRAFT..." className="bg-slate-700/50 border-slate-600 text-white text-xs h-6" />}
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={branding.showFooter} onChange={(e) => setBranding({ ...branding, showFooter: e.target.checked })} className="rounded border-slate-600 h-3 w-3" />
                  <span className="text-[10px] text-slate-400">Footer</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button onClick={() => setBranding({ ...branding, primaryColor: "#1e40af", secondaryColor: "#3b82f6", fontFamily: "'Times New Roman', serif" })} className="py-1 rounded text-[9px] bg-blue-900/50 text-blue-300 border border-blue-800">🏢 Corp</button>
                  <button onClick={() => setBranding({ ...branding, primaryColor: "#059669", secondaryColor: "#10b981", fontFamily: "Calibri, sans-serif" })} className="py-1 rounded text-[9px] bg-green-900/50 text-green-300 border border-green-800">🌿 Modern</button>
                </div>
              </div>
            </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* PDF Preview Panel */}
      {showPdfPreview && (
        <Card className="border-2 border-red-500/30 bg-slate-800/95 animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-red-400" />
                <span className="text-sm font-semibold text-slate-300">PDF Preview</span>
              </div>
              <Button size="sm" variant="outline" onClick={exportAsPDF} className="border-slate-600 text-slate-300 hover:bg-slate-700"><Printer className="h-4 w-4 mr-2" />Print / Save PDF</Button>
            </div>
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden" style={{ maxHeight: "500px" }}>
              <div className="overflow-y-auto p-8" style={{ maxHeight: "500px", fontFamily: hasBrandingAccess ? branding.fontFamily : "Georgia, serif" }}>
                {hasBrandingAccess && (
                <div className="mb-6 pb-4" style={{ textAlign: branding.headerStyle === "centered" ? "center" : branding.headerStyle, borderBottom: `3px solid ${branding.primaryColor}` }}>
                    {branding.showLogo && branding.logo && <Image src={branding.logo} alt="Logo" width={150} height={60} className="mb-2" style={{ maxHeight: "60px", maxWidth: "150px", margin: branding.headerStyle === "centered" ? "0 auto" : undefined }} unoptimized />}
                  {branding.showCompanyName && branding.companyName && <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: branding.secondaryColor }}>{branding.companyName}</div>}
                </div>
                )}
                {!hasBrandingAccess && (
                  <div className="mb-6 pb-4 border-b border-gray-300">
                    <h1 className="text-2xl font-bold text-gray-900">{title || "Contract Agreement"}</h1>
                  </div>
                )}
                {hasBrandingAccess && (
                <h1 className="text-2xl font-bold mb-6" style={{ color: branding.primaryColor, textAlign: branding.headerStyle === "centered" ? "center" : branding.headerStyle }}>{title || "Contract Agreement"}</h1>
                )}
                <div className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{getPreviewContent() || "Start typing to see preview..."}</div>
                {hasBrandingAccess && branding.companyName && <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">© {new Date().getFullYear()} {branding.companyName}. All rights reserved.</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Insert Snippets */}
      {showSnippets && (
        <Card className="border-2 border-indigo-500/30 bg-slate-800/95 animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold text-slate-300">Quick Insert Snippets</span>
              <span className="text-xs text-slate-500 ml-auto">Click to insert at cursor</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {contractSnippets.map((snippet) => (
                <button
                  key={snippet.id}
                  onClick={() => insertSnippet(snippet.snippet)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-700 bg-slate-700/50 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all group"
                >
                  <snippet.icon className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300" />
                  <span className="text-xs text-slate-300 text-center group-hover:text-white">{snippet.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legal Clauses */}
      {showLegalClauses && (
        <Card className="border-2 border-purple-500/30 bg-slate-800/95 animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-semibold text-slate-300">Legal Clauses</span>
              <span className="text-xs text-slate-500 ml-auto">Click to add to contract</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {legalClauses.map((clause) => (
                <button
                  key={clause.id}
                  onClick={() => {
                    setContent(content + clause.text);
                    toast({ title: "Clause added", description: `${clause.name} added to contract.` });
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-700 bg-slate-700/50 hover:border-purple-500 hover:bg-purple-500/10 transition-all group"
                >
                  <clause.icon className="h-5 w-5 text-purple-400 group-hover:text-purple-300" />
                  <span className="text-xs text-slate-300 text-center group-hover:text-white">{clause.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700 pb-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300">Contract Title *</Label>
                <Input
                  id="title"
                  type="text"
                  className="bg-slate-700/50 border-slate-600 text-white text-lg font-semibold"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Website Development Agreement"
                  required
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content" className="text-slate-300">Contract Content *</Label>
                  <div className="flex items-center gap-2">
                    {/* Tools Menu Button */}
                    <div className="relative tools-menu-container">
                      <button
                        type="button"
                        onClick={() => setShowToolsMenu(!showToolsMenu)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                          showToolsMenu
                            ? "bg-indigo-600 text-white border-indigo-500"
                            : "bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-600"
                        }`}
                        title="Contract editing tools"
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                        <span>Tools</span>
                        <ChevronRight className={`h-3 w-3 transition-transform ${showToolsMenu ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {/* Tools Dropdown Menu */}
                      {showToolsMenu && (
                        <div className="absolute right-0 top-full mt-1 w-72 bg-slate-800 border-2 border-slate-700 rounded-lg shadow-xl z-50 p-2 space-y-1">
                          {/* Auto-Reorder Section */}
                          <div className="p-2 rounded-lg bg-indigo-900/20 border border-indigo-700/30">
                            <div className="flex items-center gap-2 mb-2">
                              <RefreshCw className="h-4 w-4 text-indigo-400" />
                              <span className="text-xs font-semibold text-indigo-300">Section Reordering</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                autoReorderContract();
                                setShowToolsMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white transition-colors border border-indigo-500/50 mb-2"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              <span>Auto-Reorder Sections</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowSectionReorder(!showSectionReorder);
                                setShowToolsMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-600"
                            >
                              <GripVertical className="h-3.5 w-3.5" />
                              <span>{showSectionReorder ? "Hide" : "Show"} Section Order</span>
                            </button>
                          </div>

                          {/* Contract Checker */}
                          <div className="p-2 rounded-lg bg-green-900/20 border border-green-700/30">
                            <div className="flex items-center gap-2 mb-2">
                              <SpellCheck2 className="h-4 w-4 text-green-400" />
                              <span className="text-xs font-semibold text-green-300">Contract Checker</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                checkContract();
                              }}
                              disabled={isCheckingContract || !content.trim()}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs bg-green-600/30 hover:bg-green-600/50 text-green-200 hover:text-white transition-colors border border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCheckingContract ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  <span>Checking...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Check Contract</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Quick Tools */}
                          <div className="p-2 rounded-lg bg-slate-700/30 border border-slate-600">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="h-4 w-4 text-amber-400" />
                              <span className="text-xs font-semibold text-slate-300">Quick Tools</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowTemplates(!showTemplates);
                                  setShowSnippets(false);
                                  setShowLegalClauses(false);
                                  setShowToolsMenu(false);
                                }}
                                className={`px-2 py-1.5 rounded-md text-xs transition-colors border ${
                                  showTemplates
                                    ? "bg-green-600/30 border-green-500/50 text-green-300"
                                    : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                }`}
                              >
                                <FileText className="h-3 w-3 inline mr-1" />
                                Templates
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowSnippets(!showSnippets);
                                  setShowTemplates(false);
                                  setShowLegalClauses(false);
                                  setShowToolsMenu(false);
                                }}
                                className={`px-2 py-1.5 rounded-md text-xs transition-colors border ${
                                  showSnippets
                                    ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-300"
                                    : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                }`}
                              >
                                <Sparkles className="h-3 w-3 inline mr-1" />
                                Sections
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowLegalClauses(!showLegalClauses);
                                  setShowTemplates(false);
                                  setShowSnippets(false);
                                  setShowToolsMenu(false);
                                }}
                                className={`px-2 py-1.5 rounded-md text-xs transition-colors border ${
                                  showLegalClauses
                                    ? "bg-purple-600/30 border-purple-500/50 text-purple-300"
                                    : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                }`}
                              >
                                <Shield className="h-3 w-3 inline mr-1" />
                                Legal
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{content.length} characters</span>
                  </div>
                </div>
                <Textarea
                  ref={contentRef}
                  id="content"
                  className="bg-slate-700/50 border-slate-600 text-white min-h-[400px] font-mono text-sm"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start typing your contract content, or use Quick Insert to add sections..."
                  required
                />
                <p className="text-xs text-slate-500">
                  Use {"{{fieldName}}"} syntax to insert dynamic fields. Add fields in the sidebar, then copy their placeholder.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Validation & Checklist Panel */}
          <TooltipProvider>
            <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <ListChecks className="h-5 w-5 text-amber-400" />
                    <CardTitle className="text-sm font-bold text-white">Validation</CardTitle>
                  </div>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        getValidationScore() >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                        getValidationScore() >= 50 ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
                        "bg-gradient-to-r from-red-500 to-orange-400"
                      }`}
                      style={{ width: `${getValidationScore()}%` }}
                    />
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                    getValidationScore() >= 80 ? "bg-green-600/20 text-green-400" :
                    getValidationScore() >= 50 ? "bg-amber-600/20 text-amber-400" :
                    "bg-red-600/20 text-red-400"
                  }`}>
                    {getValidationScore()}%
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Section Reordering Tools */}
                <div className="mb-4 p-3 rounded-lg border border-indigo-500/30 bg-indigo-900/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-300">Section Reordering Tools</span>
                  </div>
                  <button
                    onClick={() => setShowSectionReorder(true)}
                    className="w-full mb-2 p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 hover:text-indigo-100 transition-colors border border-indigo-500/50 text-xs font-medium flex items-center justify-center gap-2"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                    Open Section Order Manager
                  </button>
                  <button
                    onClick={autoReorderContract}
                    className="w-full p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-600 text-xs font-medium flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Auto-Reorder All Sections
                  </button>
                  {getCurrentSectionOrder().length > 0 && (
                    <p className="text-[10px] text-slate-500 mt-2 text-center">
                      {getCurrentSectionOrder().length} section{getCurrentSectionOrder().length !== 1 ? 's' : ''} detected
                    </p>
                  )}
                </div>

                {/* Unfilled Placeholders Warning */}
                {getUnfilledPlaceholders().length > 0 && (
                  <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-300">Unfilled Fields</p>
                        <p className="text-xs text-amber-400/80 mt-1">
                          {getUnfilledPlaceholders().length} placeholder{getUnfilledPlaceholders().length !== 1 ? "s" : ""} need values:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {getUnfilledPlaceholders().slice(0, 5).map((field) => (
                            <span key={field} className="px-2 py-0.5 text-xs rounded bg-amber-600/20 text-amber-300 font-mono">
                              {`{{${field}}}`}
                            </span>
                          ))}
                          {getUnfilledPlaceholders().length > 5 && (
                            <span className="px-2 py-0.5 text-xs rounded bg-slate-600/50 text-slate-400">
                              +{getUnfilledPlaceholders().length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Spelling Warnings */}
                {getSpellingWarnings().length > 0 && (
                  <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/10">
                    <div className="flex items-start gap-2">
                      <SpellCheck2 className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-300">Possible Typos</p>
                        <div className="space-y-1 mt-2">
                          {getSpellingWarnings().slice(0, 3).map((warning) => (
                            <div key={warning.word} className="flex items-center gap-2 text-xs">
                              <span className="text-red-400 line-through">{warning.word}</span>
                              <ChevronRight className="h-3 w-3 text-slate-500" />
                              <span className="text-green-400">{warning.suggestion}</span>
                              <button
                                onClick={() => {
                                  const regex = new RegExp(`\\b${warning.word}\\b`, "gi");
                                  setContent(content.replace(regex, warning.suggestion));
                                  toast({ title: "Fixed!", description: `Replaced "${warning.word}" with "${warning.suggestion}"` });
                                }}
                                className="px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 transition-colors"
                              >
                                Fix
                              </button>
                            </div>
                          ))}
                          {getSpellingWarnings().length > 3 && (
                            <p className="text-xs text-slate-500">+{getSpellingWarnings().length - 3} more issues</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contract Checklist - Click to add missing sections! */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm font-medium text-slate-300">Essential Sections</span>
                    <span className="text-[10px] text-slate-500 ml-auto">Click missing to add</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                    {getChecklistStatus().map((item) => (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          {item.checked ? (
                            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-green-600/10 border border-green-500/20">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                              <span className="text-[11px] text-green-300 truncate">{item.label}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => insertMissingSection(item.id)}
                              className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-700/30 border border-slate-700 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all group text-left"
                            >
                              <Plus className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0" />
                              <span className="text-[11px] text-slate-400 group-hover:text-indigo-300 truncate">{item.label}</span>
                            </button>
                          )}
                        </TooltipTrigger>
                        <TooltipContent side="left" className="bg-slate-900 border-slate-700 max-w-xs">
                          <p className="text-sm font-bold text-white">{item.label}</p>
                          <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                          {!item.checked && (
                            <p className="text-xs text-indigo-400 mt-2 font-medium">👆 Click to add this section!</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                  
                  {/* Quick Add All Missing */}
                  {getChecklistStatus().filter(i => !i.checked).length > 0 && (
                    <button
                      onClick={() => {
                        const missing = getChecklistStatus().filter(i => !i.checked);
                        missing.forEach((item, index) => {
                          setTimeout(() => insertMissingSection(item.id), index * 100);
                        });
                      }}
                      className="w-full mt-2 p-2 rounded-lg border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all text-xs font-medium flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Add All {getChecklistStatus().filter(i => !i.checked).length} Missing Sections
                    </button>
                  )}
                </div>

                {/* Legal Terms Found */}
                {getLegalTermsInContent().length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm font-medium text-slate-300">Legal Terms Detected</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getLegalTermsInContent().map((term) => (
                        <Tooltip key={term}>
                          <TooltipTrigger asChild>
                            <span className="px-2 py-1 text-xs rounded-full bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 cursor-help hover:bg-cyan-600/30 transition-colors">
                              <HelpCircle className="h-3 w-3 inline mr-1" />
                              {legalTermDefinitions[term]?.term || term}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="bg-slate-900 border-slate-700 max-w-sm">
                            <p className="text-sm font-bold text-white">{legalTermDefinitions[term]?.term}</p>
                            <p className="text-xs text-slate-300 mt-1">{legalTermDefinitions[term]?.definition}</p>
                            {legalTermDefinitions[term]?.example && (
                              <p className="text-xs text-slate-500 mt-2 italic">
                                Example: {legalTermDefinitions[term].example}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Good Message */}
                {getValidationScore() >= 80 && getSpellingWarnings().length === 0 && getUnfilledPlaceholders().length === 0 && (
                  <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10 text-center">
                    <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-green-300">Looking Good!</p>
                    <p className="text-xs text-green-400/80">Your contract covers all essential sections</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TooltipProvider>

          {/* Section Reorder Panel - Shows when enabled from Tools */}
          {showSectionReorder && getCurrentSectionOrder().length > 0 && (
            <Card className="border-2 border-indigo-500/50 shadow-xl bg-slate-800/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-indigo-400" />
                    Section Order Manager
                  </CardTitle>
                  <button
                    onClick={() => setShowSectionReorder(false)}
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <CardDescription className="text-slate-400">
                  Use arrows to reorder your contract sections
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {getCurrentSectionOrder().map((section, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors border border-slate-600 group"
                    >
                      <span className="w-8 text-center text-xs text-slate-400 font-mono font-bold">{index + 1}</span>
                      <GripVertical className="h-4 w-4 text-slate-600 group-hover:text-slate-400" />
                      <span className="flex-1 text-sm text-slate-300 font-medium">{section.label}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveSection(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 rounded hover:bg-indigo-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ChevronRight className="h-4 w-4 text-slate-400 hover:text-indigo-400 rotate-[-90deg]" />
                        </button>
                        <button
                          onClick={() => moveSection(index, "down")}
                          disabled={index === getCurrentSectionOrder().length - 1}
                          className="p-1.5 rounded hover:bg-indigo-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ChevronRight className="h-4 w-4 text-slate-400 hover:text-indigo-400 rotate-90" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-700">
                  <button
                    onClick={() => {
                      autoReorderContract();
                      setShowSectionReorder(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 transition-colors border border-indigo-500/50 text-sm font-medium"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Auto-Reorder All Sections
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contract Checker Panel - Shows when check is run */}
          {showContractChecker && (
            <Card className="border-2 border-green-500/50 shadow-xl bg-slate-800/95 backdrop-blur-sm animate-in slide-in-from-top-2">
              <CardHeader className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <SpellCheck2 className="h-5 w-5 text-green-400" />
                    Contract Checker Results
                  </CardTitle>
                  <button
                    onClick={() => {
                      setShowContractChecker(false);
                      setContractErrors([]);
                    }}
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <CardDescription className="text-slate-400">
                  {contractErrors.length === 0 
                    ? "No errors found! Your contract looks good."
                    : `Found ${contractErrors.length} issue${contractErrors.length !== 1 ? 's' : ''} that can be fixed`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {contractErrors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-400 mb-3" />
                    <p className="text-green-300 font-semibold mb-1">All Clear!</p>
                    <p className="text-xs text-slate-400">No errors, typos, or formatting issues detected.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {contractErrors.map((error, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-slate-700/30 border border-slate-600 hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              {error.type === "spelling" && <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                              {error.type === "punctuation" && <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />}
                              {error.type === "formatting" && <AlertCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />}
                              {error.type === "capitalization" && <Info className="h-4 w-4 text-indigo-400 flex-shrink-0" />}
                              {!error.type && <AlertCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-semibold uppercase px-1.5 py-0.5 rounded ${
                                  error.type === "spelling" ? "bg-red-900/30 text-red-300" :
                                  error.type === "punctuation" ? "bg-yellow-900/30 text-yellow-300" :
                                  error.type === "formatting" ? "bg-blue-900/30 text-blue-300" :
                                  error.type === "capitalization" ? "bg-indigo-900/30 text-indigo-300" :
                                  "bg-slate-700 text-slate-300"
                                }`}>
                                  {error.type || "Issue"}
                                </span>
                              </div>
                              <p className="text-sm text-slate-300 mb-1">{error.message}</p>
                              {error.original && error.fix && (
                                <div className="flex items-center gap-2 text-xs mt-2 p-2 rounded bg-slate-900/50 border border-slate-700">
                                  <span className="text-red-400 line-through">{error.original}</span>
                                  <span className="text-slate-500">→</span>
                                  <span className="text-green-400 font-semibold">{error.fix}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-slate-700 space-y-2">
                      <button
                        onClick={autoFixAllErrors}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-300 hover:text-green-200 transition-colors border border-green-500/50 text-sm font-medium"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Auto-Fix All {contractErrors.length} Issue{contractErrors.length !== 1 ? 's' : ''}
                      </button>
                      <p className="text-[10px] text-slate-500 text-center">
                        💡 Auto-fix will correct all detected issues automatically. Review changes after fixing.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Compensation Section */}
          <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-400" />
                Payment & Compensation
              </CardTitle>
              <CardDescription className="text-slate-400">
                Specify if this contract includes payment or compensation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="hasCompensationScratch"
                  checked={hasCompensation}
                  onCheckedChange={(checked) => {
                    setHasCompensation(checked === true);
                    if (checked) {
                      // Set default compensation type when enabling compensation
                      if (!compensationType || compensationType === "no_compensation") {
                        setCompensationType("fixed_amount");
                      }
                    } else {
                      setCompensationType("no_compensation");
                      setPaymentTerms("");
                    }
                  }}
                  className="mt-0.5 border-slate-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <div className="flex-1 space-y-3">
                  <Label htmlFor="hasCompensationScratch" className="text-slate-300 font-semibold cursor-pointer text-base">
                    This contract includes payment or compensation
                  </Label>
                  {hasCompensation && (
                    <div className="space-y-3 pl-6 border-l-2 border-indigo-500/30 pt-2">
                      <div className="space-y-2">
                        <Label className="text-slate-400 text-sm">Compensation Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setCompensationType("fixed_amount")}
                            className={`p-2 rounded-lg border text-sm transition-all ${
                              compensationType === "fixed_amount"
                                ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                                : "bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500"
                            }`}
                          >
                            Fixed Amount
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompensationType("hourly")}
                            className={`p-2 rounded-lg border text-sm transition-all ${
                              compensationType === "hourly"
                                ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                                : "bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500"
                            }`}
                          >
                            Hourly Rate
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompensationType("milestone")}
                            className={`p-2 rounded-lg border text-sm transition-all ${
                              compensationType === "milestone"
                                ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                                : "bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500"
                            }`}
                          >
                            Milestone-Based
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompensationType("other")}
                            className={`p-2 rounded-lg border text-sm transition-all ${
                              compensationType === "other"
                                ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                                : "bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500"
                            }`}
                          >
                            Other
                          </button>
                        </div>
                        {compensationType && compensationType !== "no_compensation" && (
                          <p className="text-xs text-indigo-400 mt-1">
                            Selected: {compensationType === "fixed_amount" && "Fixed Amount"}
                            {compensationType === "hourly" && "Hourly Rate"}
                            {compensationType === "milestone" && "Milestone-Based"}
                            {compensationType === "other" && "Other"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="paymentTermsScratch" className="text-slate-400 text-sm">
                            Payment Terms & Legal Clauses
                          </Label>
                          <button
                            type="button"
                            onClick={() => setShowPaymentQuickInserts(!showPaymentQuickInserts)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                          >
                            <Zap className="h-3 w-3" />
                            Quick Inserts
                            <ChevronRight className={`h-3 w-3 transition-transform ${showPaymentQuickInserts ? 'rotate-90' : ''}`} />
                          </button>
                        </div>
                        {showPaymentQuickInserts && (
                          <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-900/10 mb-2 animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="h-3.5 w-3.5 text-indigo-400" />
                              <p className="text-xs font-medium text-indigo-300">Quick Insert Payment Clauses</p>
                              <span className="text-[10px] text-slate-500 ml-auto">Click to add</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                              {paymentTermTemplates.map((template) => (
                                <Tooltip key={template.id}>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newTerms = paymentTerms 
                                          ? `${paymentTerms}\n\n${template.template}`
                                          : template.template;
                                        setPaymentTerms(newTerms);
                                        toast({
                                          title: `✅ ${template.label} added`,
                                          description: "Payment clause inserted into terms.",
                                        });
                                      }}
                                      className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-600 bg-slate-700/50 hover:bg-indigo-600/30 hover:border-indigo-500 transition-all group"
                                    >
                                      <template.icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" />
                                      <span className="text-[10px] text-slate-300 group-hover:text-indigo-200 text-center leading-tight">{template.label}</span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="bg-slate-900 border-slate-700 max-w-xs p-2">
                                    <p className="text-xs text-white whitespace-pre-wrap">{template.template}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 text-center">
                              💡 Click any clause to insert it into your payment terms
                            </p>
                          </div>
                        )}
                        <Textarea
                          id="paymentTermsScratch"
                          className="bg-slate-700/50 border-slate-600 text-white min-h-[120px]"
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          placeholder="E.g., Net 30 days, payment due upon completion, late fees of 1.5% per month, payment schedule, refund policy, etc. Click 'Quick Inserts' above for common clauses."
                        />
                        <p className="text-xs text-slate-500">
                          Specify payment terms, schedules, penalties, late fees, refund policies, and other legal payment-related clauses. Use Quick Inserts for common clauses.
                        </p>
                      </div>
                    </div>
                  )}
                  {!hasCompensation && (
                    <p className="text-xs text-slate-500 pl-6 border-l-2 border-slate-700 pt-2">
                      No compensation or payment will be specified for this contract. You can skip the payment step.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => onSubmit(customFieldValues, {
                hasCompensation,
                compensationType,
                paymentTerms: hasCompensation ? paymentTerms : undefined,
              })}
              disabled={!title.trim() || !content.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Sidebar - Fields & Preview */}
        <div className="space-y-4 lg:col-span-2">
          {/* Simple Fields Section - Combined Add & Fill */}
          <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm flex flex-col max-h-[450px]">
            <CardHeader className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-b border-slate-700 py-3 flex-shrink-0">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                📝 Your Info
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">Fill in these blanks for your contract</p>
            </CardHeader>
            <CardContent className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
              {/* Show existing fields with inline editing - SIMPLE */}
              {customFields.length > 0 ? (
                <div className="space-y-3">
                  {customFields.map((field, index) => (
                    <div key={`${field.id}-${index}`} className="group">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-medium text-white">
                          {field.label}
                        </span>
                        {field.required && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">required</span>
                        )}
                        <button
                          onClick={() => removeField(field.id)}
                          className="ml-auto p-1 rounded hover:bg-red-600/20 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {field.type === "textarea" ? (
                        <Textarea
                          className="bg-slate-700/50 border-slate-600 text-white text-sm min-h-[70px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          value={customFieldValues[field.id] || ""}
                          onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.id]: e.target.value })}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                      ) : field.type === "date" ? (
                        <Input
                          type="date"
                          className="bg-slate-700/50 border-slate-600 text-white text-sm focus:border-indigo-500"
                          value={customFieldValues[field.id] || ""}
                          onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.id]: e.target.value })}
                        />
                      ) : field.type === "number" ? (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                          <Input
                            type="number"
                            className="bg-slate-700/50 border-slate-600 text-white text-sm pl-7 focus:border-indigo-500"
                            value={customFieldValues[field.id] || ""}
                            onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.id]: e.target.value })}
                            placeholder="0.00"
                          />
                        </div>
                      ) : (
                        <Input
                          type="text"
                          className="bg-slate-700/50 border-slate-600 text-white text-sm focus:border-indigo-500"
                          value={customFieldValues[field.id] || ""}
                          onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.id]: e.target.value })}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-sm text-slate-400">No fields yet!</p>
                  <p className="text-xs text-slate-500 mt-1">Use a template or add fields below</p>
                </div>
              )}

              {/* Divider */}
              {customFields.length > 0 && <div className="border-t border-slate-700" />}

              {/* Super Simple Add Field */}
              {showAddField ? (
                <div className="p-3 rounded-xl border-2 border-indigo-500/50 bg-indigo-500/10 space-y-3">
                  <div className="text-sm font-medium text-white flex items-center gap-2">
                    <Plus className="h-4 w-4 text-indigo-400" />
                    Add New Field
                  </div>
                  <Input
                    placeholder="What info do you need? (e.g., Client Name)"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                    autoFocus
                  />
                  
                  {/* Simple Type Picker with Icons */}
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setNewFieldType("text")}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        newFieldType === "text" 
                          ? "border-indigo-500 bg-indigo-500/20 text-white" 
                          : "border-slate-600 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <Type className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-[10px]">Text</span>
                    </button>
                    <button
                      onClick={() => setNewFieldType("number")}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        newFieldType === "number" 
                          ? "border-indigo-500 bg-indigo-500/20 text-white" 
                          : "border-slate-600 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <DollarSign className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-[10px]">Money</span>
                    </button>
                    <button
                      onClick={() => setNewFieldType("date")}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        newFieldType === "date" 
                          ? "border-indigo-500 bg-indigo-500/20 text-white" 
                          : "border-slate-600 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <Calendar className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-[10px]">Date</span>
                    </button>
                    <button
                      onClick={() => setNewFieldType("textarea")}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        newFieldType === "textarea" 
                          ? "border-indigo-500 bg-indigo-500/20 text-white" 
                          : "border-slate-600 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <AlignLeft className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-[10px]">Long</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowAddField(false);
                        setNewFieldLabel("");
                      }}
                      className="flex-1 text-slate-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={addField}
                      disabled={!newFieldLabel.trim()}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddField(true)}
                  className="w-full p-3 rounded-xl border-2 border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-indigo-500 hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add a Field</span>
                </button>
              )}

              {/* Quick Add Common Fields */}
              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-2">Quick Add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Client Name", type: "text" },
                    { label: "Email", type: "text" },
                    { label: "Phone", type: "text" },
                    { label: "Amount", type: "number" },
                    { label: "Start Date", type: "date" },
                    { label: "End Date", type: "date" },
                  ].filter(q => !customFields.find(f => f.label.toLowerCase() === q.label.toLowerCase())).map((quick) => (
                    <button
                      key={quick.label}
                      onClick={() => {
                        const id = quick.label.toLowerCase().replace(/\s+/g, "_");
                        if (!customFields.find(f => f.id === id)) {
                          setCustomFields([...customFields, {
                            id,
                            label: quick.label,
                            type: quick.type as any,
                            placeholder: `Enter ${quick.label.toLowerCase()}`,
                            required: false,
                          }]);
                          toast({ title: "Field added!", description: `${quick.label} field ready to fill.` });
                        }
                      }}
                      className="px-2 py-1 text-xs rounded-full bg-slate-700/50 text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all border border-slate-600 hover:border-indigo-500"
                    >
                      + {quick.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sticky Live Preview Modal */}
          <div className={`fixed right-4 z-40 w-[260px] sm:w-[280px] max-w-[calc(100vw-2rem)] transition-all duration-300 ${showPreview ? 'bottom-4' : 'bottom-4'}`}>
            <Card className="border-2 border-slate-700 shadow-2xl bg-slate-800/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700 py-1.5 cursor-pointer" onClick={() => setShowPreview(!showPreview)}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-green-400" />
                    Live Preview
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowImportExport(!showImportExport);
                      }}
                      className={`h-5 px-1.5 ${showImportExport ? "bg-amber-600 text-white hover:bg-amber-700" : "text-slate-300 hover:bg-slate-700"}`}
                    >
                      <FileDown className="h-2.5 w-2.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPreview(!showPreview);
                      }}
                      className="h-5 px-1.5 text-slate-300 hover:bg-slate-700"
                      title={showPreview ? "Collapse Preview" : "Expand Preview"}
                    >
                      {showPreview ? (
                        <ChevronRight className="h-2.5 w-2.5 rotate-90" />
                      ) : (
                        <ChevronRight className="h-2.5 w-2.5 -rotate-90" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {showPreview && (
                <CardContent className="p-2.5 space-y-2.5 max-h-[240px] overflow-y-auto">
                  {/* Preview Area */}
                  <div className="bg-white rounded-lg p-2.5 min-h-[100px] max-h-[200px] overflow-y-auto shadow-inner">
                    <h3 className="text-xs font-bold text-slate-900 mb-1">{title || "Contract Title"}</h3>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700 text-[10px] leading-relaxed">
                      {getPreviewContent() || "Start typing to see preview..."}
                    </div>
                  </div>

              {/* Import/Export Section */}
              {showImportExport && (
                <div className="border-t border-slate-700 pt-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Import Section */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                        <Upload className="h-3.5 w-3.5" />
                        Import
                      </h4>
                      <input ref={fileInputRef} type="file" accept=".txt,.doc,.docx,.html,.htm" onChange={handleFileImport} className="hidden" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border-2 border-dashed border-slate-600 bg-slate-700/30 hover:border-amber-500 hover:bg-amber-500/10 transition-all text-slate-300 hover:text-white"
                      >
                        {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4 text-amber-400" />}
                        <span className="text-xs font-medium">{importing ? "Importing..." : "Upload File"}</span>
                      </button>
                      <p className="text-[10px] text-slate-500 text-center">.txt, .doc, .docx, .html</p>
                    </div>

                    {/* Export Section */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                        <Download className="h-3.5 w-3.5" />
                        Export
                      </h4>
                      <div className="grid grid-cols-4 gap-1">
                        <button onClick={exportAsPDF} className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-700 bg-slate-700/50 hover:border-red-500 hover:bg-red-500/10 transition-all group">
                          <Printer className="h-4 w-4 text-red-400 group-hover:text-red-300" />
                          <span className="text-[10px] text-slate-300 group-hover:text-white">PDF</span>
                        </button>
                        <button onClick={exportAsWord} className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-700 bg-slate-700/50 hover:border-blue-500 hover:bg-blue-500/10 transition-all group">
                          <FileType className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />
                          <span className="text-[10px] text-slate-300 group-hover:text-white">Word</span>
                        </button>
                        <button onClick={exportAsText} className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-700 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-500/10 transition-all group">
                          <FileType2 className="h-4 w-4 text-slate-400 group-hover:text-slate-300" />
                          <span className="text-[10px] text-slate-300 group-hover:text-white">Text</span>
                        </button>
                        <button onClick={copyToClipboard} className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-700 bg-slate-700/50 hover:border-green-500 hover:bg-green-500/10 transition-all group">
                          <Copy className="h-4 w-4 text-green-400 group-hover:text-green-300" />
                          <span className="text-[10px] text-slate-300 group-hover:text-white">Copy</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email Button */}
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                      <DialogTrigger asChild>
                        <button className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition-all text-sm">
                          <Mail className="h-4 w-4" />
                          <span>Email Contract</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-700 text-white">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Mail className="h-5 w-5 text-indigo-400" />
                            Send Contract via Email
                          </DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Send this contract directly to your client or collaborator.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="emailTo" className="text-slate-300">Recipient Email *</Label>
                            <Input id="emailTo" type="email" placeholder="client@example.com" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emailSubject" className="text-slate-300">Subject (optional)</Label>
                            <Input id="emailSubject" type="text" placeholder={`Contract: ${title || "Agreement"}`} value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emailMessage" className="text-slate-300">Message (optional)</Label>
                            <Textarea id="emailMessage" placeholder="Hi, please find the contract attached..." value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} className="bg-slate-800 border-slate-700 text-white min-h-[100px]" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowEmailDialog(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</Button>
                          <Button onClick={sendEmail} disabled={sendingEmail || !emailTo.trim()} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                            {sendingEmail ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : <><Send className="h-4 w-4 mr-2" />Send Email</>}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step4SetAmounts({
  depositAmount,
  totalAmount,
  compensationType,
  paymentTerms,
  paymentSchedule: initialPaymentSchedule,
  paymentMethods: initialPaymentMethods,
  onSubmit,
  onBack,
}: {
  depositAmount: string;
  totalAmount: string;
  compensationType?: string;
  paymentTerms?: string;
  paymentSchedule?: "upfront" | "partial" | "full" | "split" | "incremental";
  paymentMethods?: string[];
  onSubmit: (
    deposit: string, 
    total: string, 
    hourlyRate?: string, 
    milestonePayments?: Array<{ name: string; amount: string; dueDate: string }>,
    paymentSchedule?: "upfront" | "partial" | "full" | "split" | "incremental",
    paymentMethods?: string[],
    insertPaymentIntoContract?: boolean,
    paymentScheduleConfig?: {
      numberOfPayments?: number;
      paymentDates?: Array<{ date: string; amount: string; percentage?: string }>;
      depositPercentage?: string;
      balanceDueDate?: string;
      paymentFrequency?: "weekly" | "biweekly" | "monthly" | "quarterly";
      firstPaymentDate?: string;
      paymentAfterSigning?: {
        amount?: string;
        dueDate?: string;
      };
    }
  ) => void;
  onBack: () => void;
}) {
  const [deposit, setDeposit] = useState(depositAmount || "0");
  const [total, setTotal] = useState(totalAmount || "0");
  const [hourlyRate, setHourlyRate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [milestones, setMilestones] = useState<Array<{ id: string; name: string; amount: string; dueDate: string }>>([]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ name: "", amount: "", dueDate: "" });
  
  // Set default payment schedule based on compensation type if not already set
  const getDefaultPaymentSchedule = (): "upfront" | "partial" | "full" | "split" | "incremental" => {
    if (initialPaymentSchedule) return initialPaymentSchedule;
    
    switch (compensationType) {
      case "milestone":
        return "split"; // Milestone-based payments are typically split
      case "hourly":
        return "incremental"; // Hourly payments are typically incremental
      case "fixed_amount":
        return "partial"; // Fixed amount often uses partial (deposit + balance)
      case "other":
        return "incremental"; // Default for other types
      default:
        return "incremental";
    }
  };
  
  const [paymentSchedule, setPaymentSchedule] = useState<"upfront" | "partial" | "full" | "split" | "incremental">(getDefaultPaymentSchedule());
  const [showScheduleConfig, setShowScheduleConfig] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState<{
    numberOfPayments?: number;
    paymentDates?: Array<{ date: string; amount: string; percentage?: string }>;
    depositPercentage?: string;
    balanceDueDate?: string;
    paymentFrequency?: "weekly" | "biweekly" | "monthly" | "quarterly";
    firstPaymentDate?: string;
  }>({});
  const [requirePaymentAfterSigning, setRequirePaymentAfterSigning] = useState(true);
  const [paymentAfterSigningAmount, setPaymentAfterSigningAmount] = useState("");
  const [paymentAfterSigningDue, setPaymentAfterSigningDue] = useState<"upon_signing" | "within_3_days" | "within_7_days" | "within_14_days" | "custom">("upon_signing");
  const [customPaymentDate, setCustomPaymentDate] = useState("");
  
  // Update payment schedule when compensation type changes
  useEffect(() => {
    if (!initialPaymentSchedule && compensationType) {
      const defaultSchedule = getDefaultPaymentSchedule();
      setPaymentSchedule(defaultSchedule);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compensationType, initialPaymentSchedule]);

  const { toast } = useToast();

  // Auto-configure payment schedule when total and deposit amounts are entered
  useEffect(() => {
    const totalNum = parseFloat(total);
    const depositNum = parseFloat(deposit);
    
    // Only auto-configure if both amounts are valid and positive
    if (totalNum > 0 && depositNum > 0 && depositNum < totalNum) {
      // If "partial" payment schedule is selected and not yet configured
      if (paymentSchedule === "partial" && (!scheduleConfig.depositPercentage || Object.keys(scheduleConfig).length === 0)) {
        const depositPercent = ((depositNum / totalNum) * 100).toFixed(1);
        
        // Calculate a default balance due date (30 days from now)
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 30);
        
        setScheduleConfig({
          depositPercentage: depositPercent,
          balanceDueDate: defaultDueDate.toISOString().split('T')[0],
        });
        
        // Also set payment after signing if not already set
        if (requirePaymentAfterSigning && !paymentAfterSigningAmount) {
          setPaymentAfterSigningAmount(depositNum.toFixed(2));
          setPaymentAfterSigningDue("upon_signing");
        }
        
        // Show notification that it was auto-configured
        toast({
          title: "✅ Payment Schedule Auto-Configured",
          description: `Partial payment schedule configured: ${depositPercent}% deposit, balance due in 30 days.`,
        });
      }
      // If "upfront" is selected and total is set, configure it
      else if (paymentSchedule === "upfront" && !paymentAfterSigningAmount) {
        if (requirePaymentAfterSigning) {
          setPaymentAfterSigningAmount(totalNum.toFixed(2));
          setPaymentAfterSigningDue("upon_signing");
          
          toast({
            title: "✅ Payment Schedule Auto-Configured",
            description: `Upfront payment configured: Full amount ($${totalNum.toFixed(2)}) due upon signing.`,
          });
        }
      }
    }
    // If total is set but no deposit, and "full" payment is selected
    else if (totalNum > 0 && (!deposit || parseFloat(deposit) === 0) && paymentSchedule === "full") {
      if (requirePaymentAfterSigning && !paymentAfterSigningAmount) {
        // Calculate completion date (default 30 days from now)
        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + 30);
        
        setPaymentAfterSigningAmount(totalNum.toFixed(2));
        setPaymentAfterSigningDue("custom");
        setCustomPaymentDate(completionDate.toISOString().split('T')[0]);
        
        toast({
          title: "✅ Payment Schedule Auto-Configured",
          description: `Full payment configured: $${totalNum.toFixed(2)} due upon completion.`,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, deposit, paymentSchedule]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(initialPaymentMethods || []);
  const [paymentMethodDetails, setPaymentMethodDetails] = useState<Record<string, { email?: string; account?: string; phone?: string; routing?: string; notes?: string }>>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({ email: "", account: "", phone: "", routing: "", notes: "" });
  const [insertPaymentIntoContract, setInsertPaymentIntoContract] = useState(true);

  // Calculate total from hourly if applicable
  useEffect(() => {
    if (compensationType === "hourly" && hourlyRate && estimatedHours) {
      const calculated = (parseFloat(hourlyRate) * parseFloat(estimatedHours)).toFixed(2);
      setTotal(calculated);
    }
  }, [hourlyRate, estimatedHours, compensationType]);

  // Calculate total from milestones if applicable
  useEffect(() => {
    if (compensationType === "milestone" && milestones.length > 0) {
      const calculated = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0).toFixed(2);
      setTotal(calculated);
    }
  }, [milestones, compensationType]);

  const addMilestone = () => {
    if (newMilestone.name && newMilestone.amount) {
      setMilestones([...milestones, { ...newMilestone, id: Date.now().toString() }]);
      setNewMilestone({ name: "", amount: "", dueDate: "" });
      setShowAddMilestone(false);
    }
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleSubmit = () => {
    // Check if payment schedule is configured
    const isScheduleConfigured = scheduleConfig && Object.keys(scheduleConfig).length > 0;
    
    // Warn if payment schedule is selected but not configured
    if (paymentSchedule && compensationType && compensationType !== "no_compensation" && !isScheduleConfigured) {
      toast({
        title: "⚠️ Payment Schedule Not Configured",
        description: "Please configure your payment schedule before proceeding. Click the 'Configure' button on your selected payment schedule option.",
        variant: "destructive",
      });
      return; // Prevent submission
    }
    
    // Ensure compensation type is known and payment schedule aligns with it
    const finalPaymentSchedule = paymentSchedule || getDefaultPaymentSchedule();
    
    // Prepare payment after signing config if enabled
    const paymentAfterSigningConfig = requirePaymentAfterSigning ? {
      amount: paymentAfterSigningAmount,
      dueDate: paymentAfterSigningDue === "custom" ? customPaymentDate : paymentAfterSigningDue,
    } : undefined;
    
    // Merge schedule config with payment after signing config
    const finalScheduleConfig = {
      ...scheduleConfig,
      paymentAfterSigning: paymentAfterSigningConfig,
    };
    
    if (compensationType === "hourly") {
      onSubmit(deposit, total, hourlyRate, undefined, finalPaymentSchedule, paymentMethods, insertPaymentIntoContract, finalScheduleConfig);
    } else if (compensationType === "milestone") {
      onSubmit(deposit, total, undefined, milestones.map(m => ({ name: m.name, amount: m.amount, dueDate: m.dueDate })), finalPaymentSchedule, paymentMethods, insertPaymentIntoContract, finalScheduleConfig);
    } else {
      onSubmit(deposit, total, undefined, undefined, finalPaymentSchedule, paymentMethods, insertPaymentIntoContract, finalScheduleConfig);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "cash":
        return "💵";
      case "check":
        return "📝";
      case "bank transfer":
        return "🏦";
      case "credit card":
        return "💳";
      case "paypal":
        return "🔵";
      case "venmo":
        return "💚";
      case "zelle":
        return "🏦";
      case "cash app":
        return "💰";
      case "wire transfer":
        return "💸";
      default:
        return "💳";
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "paypal":
        return "from-blue-500 to-cyan-500";
      case "venmo":
        return "from-green-500 to-emerald-500";
      case "zelle":
        return "from-blue-600 to-indigo-600";
      case "cash app":
        return "from-green-600 to-emerald-600";
      case "credit card":
        return "from-purple-500 to-indigo-500";
      default:
        return "from-slate-600 to-gray-600";
    }
  };

  const getPaymentMethodFields = (method: string) => {
    switch (method.toLowerCase()) {
      case "paypal":
      case "venmo":
      case "zelle":
      case "cash app":
        return ["email", "phone"];
      case "bank transfer":
      case "wire transfer":
        return ["account", "routing"];
      case "check":
        return ["notes"];
      case "credit card":
        return ["email"];
      case "cash":
        return ["notes"];
      default:
        return ["email", "account"];
    }
  };

  const handlePaymentMethodClick = (method: string) => {
    if (paymentMethods.includes(method)) {
      // Remove if already selected
      setPaymentMethods(prev => prev.filter(m => m !== method));
      setPaymentMethodDetails(prev => {
        const updated = { ...prev };
        delete updated[method];
        return updated;
      });
      toast({
        title: "Payment Method Removed",
        description: `${method} has been removed from accepted payment methods.`,
      });
    } else {
      // Open modal to enter details
      setSelectedPaymentMethod(method);
      const existingDetails = paymentMethodDetails[method];
      setPaymentFormData({
        email: existingDetails?.email || "",
        account: existingDetails?.account || "",
        phone: existingDetails?.phone || "",
        routing: existingDetails?.routing || "",
        notes: existingDetails?.notes || ""
      });
      setShowPaymentModal(true);
    }
  };

  const handleSavePaymentDetails = () => {
    if (selectedPaymentMethod) {
      // Validate required fields based on payment method
      const requiredFields = getPaymentMethodFields(selectedPaymentMethod);
      const hasEmail = requiredFields.includes("email") && paymentFormData.email.trim();
      const hasPhone = requiredFields.includes("phone") && paymentFormData.phone.trim();
      const hasAccount = requiredFields.includes("account") && paymentFormData.account.trim();
      const hasRouting = requiredFields.includes("routing") && paymentFormData.routing.trim();
      
      // Check if at least one required field is filled
      const hasRequiredFields = hasEmail || hasPhone || hasAccount || hasRouting || paymentFormData.notes.trim();
      
      if (!hasRequiredFields) {
        toast({
          title: "Missing Information",
          description: `Please enter at least one detail for ${selectedPaymentMethod}.`,
          variant: "destructive",
        });
        return;
      }
      
      setPaymentMethods(prev => 
        prev.includes(selectedPaymentMethod) 
          ? prev 
          : [...prev, selectedPaymentMethod]
      );
      setPaymentMethodDetails(prev => ({
        ...prev,
        [selectedPaymentMethod]: { ...paymentFormData }
      }));
      
      toast({
        title: "Payment Method Added",
        description: `${selectedPaymentMethod} has been added and will be included in your contract.`,
      });
      
      setShowPaymentModal(false);
      setSelectedPaymentMethod(null);
      setPaymentFormData({ email: "", account: "", phone: "", routing: "", notes: "" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Payment & Compensation</h2>
            <p className="text-indigo-100 text-sm">Set up all payment amounts, schedules, and methods</p>
          </div>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-700 shadow-xl">
        <CardContent className="p-6 space-y-6">
        {/* Compensation Type Display */}
        {compensationType && compensationType !== "no_compensation" && (
          <div className="p-4 rounded-lg bg-indigo-900/20 border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">Compensation Type</span>
            </div>
            <p className="text-sm text-white font-medium">
              {compensationType === "fixed_amount" && "Fixed Amount"}
              {compensationType === "hourly" && "Hourly Rate"}
              {compensationType === "milestone" && "Milestone-Based"}
              {compensationType === "other" && "Other"}
            </p>
          </div>
        )}

        {/* Fixed Amount or Other - Default view when compensation is enabled */}
        {compensationType !== "hourly" && compensationType !== "milestone" && (
          <>
        <div className="space-y-2">
              <Label className="text-slate-300 font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-indigo-400" />
                Total Contract Amount
                <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <Input
            type="number"
            step="0.01"
            min="0"
                  className="pl-8 bg-slate-800 border-slate-600 text-white text-lg font-semibold h-12"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <p className="text-xs text-slate-500">Enter the total amount for this contract</p>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-400" />
                Deposit Amount (Optional)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-8 bg-slate-800 border-slate-600 text-white h-12"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="0.00"
          />
        </div>
              <p className="text-xs text-slate-500">Initial payment or deposit (if applicable)</p>
              {deposit && total && parseFloat(deposit) > 0 && parseFloat(total) > 0 && (
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Balance Due:</span>
                    <span className="text-white font-semibold">
                      ${(parseFloat(total) - parseFloat(deposit)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-slate-400">Deposit %:</span>
                    <span className="text-indigo-400 font-semibold">
                      {((parseFloat(deposit) / parseFloat(total)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Hourly Rate */}
        {compensationType === "hourly" && (
          <>
            <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
                <Label className="text-slate-300 font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  Hourly Rate
                  <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <Input
            type="number"
            step="0.01"
            min="0"
                    className="pl-8 bg-slate-800 border-slate-600 text-white h-12"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  Estimated Hours
                  <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  className="bg-slate-800 border-slate-600 text-white h-12"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            {hourlyRate && estimatedHours && (
              <div className="p-4 rounded-lg bg-indigo-900/20 border border-indigo-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Calculated Total:</span>
                  <span className="text-2xl font-bold text-indigo-400">
                    ${(parseFloat(hourlyRate) * parseFloat(estimatedHours)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-slate-300 font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-400" />
                Deposit Amount (Optional)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-8 bg-slate-800 border-slate-600 text-white h-12"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </>
        )}

        {/* Milestone-Based */}
        {compensationType === "milestone" && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300 font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-indigo-400" />
                  Milestone Payments
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddMilestone(!showAddMilestone)}
                  className="border-indigo-500 text-indigo-400 hover:bg-indigo-600/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              </div>

              {showAddMilestone && (
                <div className="p-4 rounded-lg bg-slate-800/50 border border-indigo-500/30 space-y-3">
                  <Input
                    placeholder="Milestone name (e.g., Phase 1 Complete)"
                    className="bg-slate-700 border-slate-600 text-white"
                    value={newMilestone.name}
                    onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        className="pl-8 bg-slate-700 border-slate-600 text-white"
                        value={newMilestone.amount}
                        onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })}
                      />
                    </div>
                    <Input
                      type="date"
                      placeholder="Due Date"
                      className="bg-slate-700 border-slate-600 text-white"
                      value={newMilestone.dueDate}
                      onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={addMilestone}
                      disabled={!newMilestone.name || !newMilestone.amount}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddMilestone(false);
                        setNewMilestone({ name: "", amount: "", dueDate: "" });
                      }}
                      className="border-slate-600 text-slate-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {milestones.length > 0 && (
                <div className="space-y-2">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">{milestone.name}</p>
                        <div className="flex gap-4 mt-1 text-sm text-slate-400">
                          <span>${parseFloat(milestone.amount).toFixed(2)}</span>
                          {milestone.dueDate && <span>{new Date(milestone.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(milestone.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-500/30">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-medium">Total Amount:</span>
                      <span className="text-xl font-bold text-indigo-400">
                        ${milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {milestones.length === 0 && !showAddMilestone && (
                <div className="p-6 rounded-lg border-2 border-dashed border-slate-700 text-center">
                  <Target className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No milestones added yet</p>
                  <p className="text-slate-500 text-xs mt-1">Click &quot;Add Milestone&quot; to get started</p>
                </div>
              )}
            </div>

            {/* Payment After Signing Configuration for Hourly */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="requirePaymentAfterSigningHourly"
                  checked={requirePaymentAfterSigning}
                  onCheckedChange={(checked) => {
                    setRequirePaymentAfterSigning(checked === true);
                    if (checked === true && !paymentAfterSigningAmount) {
                      if (deposit && parseFloat(deposit) > 0) {
                        setPaymentAfterSigningAmount(deposit);
                      } else if (total && parseFloat(total) > 0) {
                        setPaymentAfterSigningAmount((parseFloat(total) * 0.5).toFixed(2));
                      }
                    }
                  }}
                  className="mt-0.5 border-slate-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="requirePaymentAfterSigningHourly" className="text-slate-300 font-semibold cursor-pointer flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-indigo-400" />
                      Require Payment After Signing
                    </Label>
                  </div>
                  <p className="text-xs text-slate-500">
                    {requirePaymentAfterSigning 
                      ? "Client must make a payment after signing this contract."
                      : "No payment required immediately after signing. Payment will be due based on the payment schedule."}
                  </p>
                  
                  {requirePaymentAfterSigning && (
                    <div className="space-y-3 pl-6 border-l-2 border-indigo-500/30 mt-3">
                      <div className="space-y-2">
                        <Label className="text-slate-400 text-sm">Payment Amount After Signing</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={paymentAfterSigningAmount}
                              onChange={(e) => setPaymentAfterSigningAmount(e.target.value)}
                              className="pl-8 bg-slate-700/50 border-slate-600 text-white"
                            />
                          </div>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="%"
                              value={paymentAfterSigningAmount && total ? ((parseFloat(paymentAfterSigningAmount) / parseFloat(total)) * 100).toFixed(1) : ""}
                              onChange={(e) => {
                                const pct = parseFloat(e.target.value);
                                if (!isNaN(pct) && pct > 0 && pct <= 100 && total) {
                                  setPaymentAfterSigningAmount((parseFloat(total) * pct / 100).toFixed(2));
                                }
                              }}
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-slate-400 text-sm">Payment Due Date</Label>
                        <select
                          value={paymentAfterSigningDue}
                          onChange={(e) => setPaymentAfterSigningDue(e.target.value as any)}
                          className="w-full bg-slate-700/50 border-slate-600 text-white rounded-md px-3 py-2 text-sm"
                        >
                          <option value="upon_signing">Upon signing this agreement</option>
                          <option value="within_3_days">Within 3 business days of signing</option>
                          <option value="within_7_days">Within 7 business days of signing</option>
                          <option value="within_14_days">Within 14 business days of signing</option>
                          <option value="custom">Custom date</option>
                        </select>
                        {paymentAfterSigningDue === "custom" && (
                          <Input
                            type="date"
                            value={customPaymentDate}
                            onChange={(e) => setCustomPaymentDate(e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Payment Schedule Options - Show for all compensation types */}
        <div className="space-y-3 pt-2 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-400" />
                Payment Schedule
              </Label>
              {compensationType && compensationType !== "no_compensation" && (
                <span className="text-xs text-slate-500">
                  Recommended: {
                    compensationType === "milestone" ? "Split Payments" :
                    compensationType === "hourly" ? "Incremental" :
                    compensationType === "fixed_amount" ? "Partial Payment" :
                    "Incremental"
                  }
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: "upfront", label: "Pay Upfront", icon: CreditCard, desc: "Full payment upon signing" },
                { value: "partial", label: "Partial Payment", icon: DollarSign, desc: "Deposit + balance later" },
                { value: "full", label: "Pay in Full", icon: CheckCircle2, desc: "Payment upon completion" },
                { value: "split", label: "Split Payments", icon: RefreshCw, desc: "Multiple installments" },
                { value: "incremental", label: "Incremental", icon: Target, desc: "Pay as you go" },
              ].map((option) => {
                const Icon = option.icon;
                const isRecommended = compensationType && compensationType !== "no_compensation" && (
                  (compensationType === "milestone" && option.value === "split") ||
                  (compensationType === "hourly" && option.value === "incremental") ||
                  (compensationType === "fixed_amount" && option.value === "partial")
                );
                const isSelected = paymentSchedule === option.value;
                return (
                  <div
                    key={option.value}
                    className={`p-4 rounded-lg border-2 transition-all relative cursor-pointer ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-600/20 shadow-lg shadow-indigo-500/20"
                        : isRecommended
                        ? "border-green-500/50 bg-green-900/10 hover:border-green-500"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    }`}
                    onClick={() => {
                      setPaymentSchedule(option.value as any);
                    }}
                  >
                    {isRecommended && !isSelected && (
                      <span className="absolute top-2 right-2 text-xs bg-green-600/20 text-green-400 px-1.5 py-0.5 rounded">Recommended</span>
                    )}
                    {isSelected && scheduleConfig && Object.keys(scheduleConfig).length > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full border border-white"></span>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${paymentSchedule === option.value ? "text-indigo-400" : "text-slate-400"}`} />
                      <span className={`font-semibold text-sm ${paymentSchedule === option.value ? "text-white" : "text-slate-300"}`}>
                        {option.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{option.desc}</p>
                    {isSelected && (
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowScheduleConfig(true);
                        }}
                        className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500"
                      >
                        <span className="mr-1">⚙️</span>
                        {scheduleConfig && Object.keys(scheduleConfig).length > 0 ? "Edit Configuration" : "Configure"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Schedule Configuration Modal */}
          <Dialog open={showScheduleConfig} onOpenChange={setShowScheduleConfig}>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">
                      Configure {paymentSchedule === "upfront" && "Pay Upfront"}
                      {paymentSchedule === "partial" && "Partial Payment"}
                      {paymentSchedule === "full" && "Pay in Full"}
                      {paymentSchedule === "split" && "Split Payments"}
                      {paymentSchedule === "incremental" && "Incremental Payments"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-sm mt-1">
                      Set up the details for this payment schedule
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 py-6">
                {/* Context-specific help */}
                <div className="p-4 rounded-lg bg-indigo-900/20 border border-indigo-500/30">
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-400 text-lg">💡</span>
                    <div>
                      <p className="text-sm font-medium text-indigo-200 mb-1">
                        {paymentSchedule === "upfront" && "Full Payment Upfront"}
                        {paymentSchedule === "partial" && "Partial Payment with Deposit"}
                        {paymentSchedule === "full" && "Payment Upon Completion"}
                        {paymentSchedule === "split" && "Multiple Installments"}
                        {paymentSchedule === "incremental" && "Pay as You Go"}
                      </p>
                      <p className="text-xs text-indigo-300/80 leading-relaxed">
                        {paymentSchedule === "upfront" && "Client pays the full contract amount before work begins. Specify when payment is due (e.g., upon signing, within X days)."}
                        {paymentSchedule === "partial" && "Client pays a deposit upfront, then the balance later. Configure the deposit percentage/amount and when the balance is due."}
                        {paymentSchedule === "full" && "Client pays the full amount after work is completed. Set the completion criteria and payment due date."}
                        {paymentSchedule === "split" && "Divide the total into multiple payments. Set the number of payments, amounts, and due dates for each installment."}
                        {paymentSchedule === "incremental" && "Client pays based on progress or time. Set payment frequency (weekly, monthly, etc.) and when payments begin."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upfront Configuration */}
                {paymentSchedule === "upfront" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Payment Due Date</Label>
                      <div className="space-y-2">
                        <select
                          value={scheduleConfig.firstPaymentDate || "upon_signing"}
                          onChange={(e) => setScheduleConfig({ ...scheduleConfig, firstPaymentDate: e.target.value })}
                          className="w-full bg-slate-800 border-slate-600 text-white rounded-md px-3 py-2"
                        >
                          <option value="upon_signing">Upon signing this agreement</option>
                          <option value="within_3_days">Within 3 business days</option>
                          <option value="within_7_days">Within 7 business days</option>
                          <option value="within_14_days">Within 14 business days</option>
                          <option value="custom">Custom date</option>
                        </select>
                        {scheduleConfig.firstPaymentDate === "custom" && (
                          <Input
                            type="date"
                            value={scheduleConfig.balanceDueDate || ""}
                            onChange={(e) => setScheduleConfig({ ...scheduleConfig, balanceDueDate: e.target.value })}
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        )}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Total Amount Due:</span>
                        <span className="text-xl font-bold text-indigo-400">${parseFloat(total || "0").toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Partial Payment Configuration */}
                {paymentSchedule === "partial" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Deposit Amount</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Deposit amount"
                            value={deposit}
                            onChange={(e) => setDeposit(e.target.value)}
                            className="pl-8 bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Percentage"
                            value={scheduleConfig.depositPercentage || ""}
                            onChange={(e) => {
                              const pct = parseFloat(e.target.value);
                              if (!isNaN(pct) && pct > 0 && pct <= 100) {
                                const depositAmt = (parseFloat(total || "0") * pct / 100).toFixed(2);
                                setDeposit(depositAmt);
                                setScheduleConfig({ ...scheduleConfig, depositPercentage: e.target.value });
                              }
                            }}
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                        </div>
                      </div>
                      {deposit && total && (
                        <p className="text-xs text-slate-500">
                          Deposit: ${parseFloat(deposit).toFixed(2)} ({((parseFloat(deposit) / parseFloat(total)) * 100).toFixed(1)}%) | 
                          Balance: ${(parseFloat(total) - parseFloat(deposit)).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Deposit Due Date</Label>
                      <select
                        value={scheduleConfig.firstPaymentDate || "upon_signing"}
                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, firstPaymentDate: e.target.value })}
                        className="w-full bg-slate-800 border-slate-600 text-white rounded-md px-3 py-2"
                      >
                        <option value="upon_signing">Upon signing this agreement</option>
                        <option value="within_3_days">Within 3 business days</option>
                        <option value="within_7_days">Within 7 business days</option>
                        <option value="custom">Custom date</option>
                      </select>
                      {scheduleConfig.firstPaymentDate === "custom" && (
                        <Input
                          type="date"
                          value={scheduleConfig.balanceDueDate || ""}
                          onChange={(e) => setScheduleConfig({ ...scheduleConfig, balanceDueDate: e.target.value })}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Balance Due Date</Label>
                      <select
                        value={scheduleConfig.balanceDueDate || "upon_completion"}
                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, balanceDueDate: e.target.value })}
                        className="w-full bg-slate-800 border-slate-600 text-white rounded-md px-3 py-2"
                      >
                        <option value="upon_completion">Upon completion of work</option>
                        <option value="within_7_days_completion">Within 7 days of completion</option>
                        <option value="within_14_days_completion">Within 14 days of completion</option>
                        <option value="net_15">Net 15 days</option>
                        <option value="net_30">Net 30 days</option>
                        <option value="custom">Custom date</option>
                      </select>
                      {scheduleConfig.balanceDueDate === "custom" && (
                        <Input
                          type="date"
                          value={scheduleConfig.balanceDueDate || ""}
                          onChange={(e) => setScheduleConfig({ ...scheduleConfig, balanceDueDate: e.target.value })}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Pay in Full Configuration */}
                {paymentSchedule === "full" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Payment Due Date</Label>
                      <select
                        value={scheduleConfig.balanceDueDate || "upon_completion"}
                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, balanceDueDate: e.target.value })}
                        className="w-full bg-slate-800 border-slate-600 text-white rounded-md px-3 py-2"
                      >
                        <option value="upon_completion">Upon completion and acceptance</option>
                        <option value="within_7_days_completion">Within 7 days of completion</option>
                        <option value="within_14_days_completion">Within 14 days of completion</option>
                        <option value="net_15">Net 15 days after completion</option>
                        <option value="net_30">Net 30 days after completion</option>
                        <option value="custom">Custom date</option>
                      </select>
                      {scheduleConfig.balanceDueDate === "custom" && (
                        <Input
                          type="date"
                          value={scheduleConfig.balanceDueDate || ""}
                          onChange={(e) => setScheduleConfig({ ...scheduleConfig, balanceDueDate: e.target.value })}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      )}
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Total Amount Due:</span>
                        <span className="text-xl font-bold text-indigo-400">${parseFloat(total || "0").toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Split Payments Configuration */}
                {paymentSchedule === "split" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Number of Payments</Label>
                      <Input
                        type="number"
                        min="2"
                        max="12"
                        value={scheduleConfig.numberOfPayments || "2"}
                        onChange={(e) => {
                          const num = parseInt(e.target.value) || 2;
                          const payments = Array.from({ length: num }, (_, i) => ({
                            date: scheduleConfig.paymentDates?.[i]?.date || "",
                            amount: scheduleConfig.paymentDates?.[i]?.amount || "",
                            percentage: scheduleConfig.paymentDates?.[i]?.percentage || "",
                          }));
                          setScheduleConfig({ ...scheduleConfig, numberOfPayments: num, paymentDates: payments });
                        }}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-500">Divide the total into 2-12 equal or custom payments</p>
                    </div>
                    {scheduleConfig.numberOfPayments && scheduleConfig.numberOfPayments > 0 && (
                      <div className="space-y-3">
                        <Label className="text-slate-300 font-medium">Payment Schedule</Label>
                        {Array.from({ length: scheduleConfig.numberOfPayments }).map((_, index) => {
                          const payment = scheduleConfig.paymentDates?.[index] || { date: "", amount: "", percentage: "" };
                          const equalAmount = (parseFloat(total || "0") / (scheduleConfig.numberOfPayments || 2)).toFixed(2);
                          return (
                            <div key={index} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-indigo-400">Payment {index + 1}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder={equalAmount}
                                    value={payment.amount || ""}
                                    onChange={(e) => {
                                      const newPayments = [...(scheduleConfig.paymentDates || [])];
                                      newPayments[index] = { ...payment, amount: e.target.value };
                                      setScheduleConfig({ ...scheduleConfig, paymentDates: newPayments });
                                    }}
                                    className="pl-6 bg-slate-700 border-slate-600 text-white text-sm"
                                  />
                                </div>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="%"
                                    value={payment.percentage || ""}
                                    onChange={(e) => {
                                      const pct = parseFloat(e.target.value);
                                      if (!isNaN(pct) && pct > 0 && pct <= 100) {
                                        const amt = (parseFloat(total || "0") * pct / 100).toFixed(2);
                                        const newPayments = [...(scheduleConfig.paymentDates || [])];
                                        newPayments[index] = { ...payment, amount: amt, percentage: e.target.value };
                                        setScheduleConfig({ ...scheduleConfig, paymentDates: newPayments });
                                      }
                                    }}
                                    className="bg-slate-700 border-slate-600 text-white text-sm"
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                                </div>
                                <Input
                                  type="date"
                                  placeholder="Due date"
                                  value={payment.date || ""}
                                  onChange={(e) => {
                                    const newPayments = [...(scheduleConfig.paymentDates || [])];
                                    newPayments[index] = { ...payment, date: e.target.value };
                                    setScheduleConfig({ ...scheduleConfig, paymentDates: newPayments });
                                  }}
                                  className="bg-slate-700 border-slate-600 text-white text-sm"
                                />
                              </div>
                            </div>
                          );
                        })}
                        <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-500/30">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300">Total Scheduled:</span>
                            <span className="text-lg font-bold text-indigo-400">
                              ${scheduleConfig.paymentDates?.reduce((sum, p) => sum + (parseFloat(p.amount || "0")), 0).toFixed(2) || "0.00"}
                            </span>
                          </div>
                          {scheduleConfig.paymentDates && scheduleConfig.paymentDates.reduce((sum, p) => sum + (parseFloat(p.amount || "0")), 0) !== parseFloat(total || "0") && (
                            <p className="text-xs text-amber-400 mt-1">
                              Total doesn&apos;t match contract amount. Adjust payments to equal ${parseFloat(total || "0").toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Incremental Configuration */}
                {paymentSchedule === "incremental" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Payment Frequency</Label>
                      <select
                        value={scheduleConfig.paymentFrequency || "monthly"}
                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, paymentFrequency: e.target.value as any })}
                        className="w-full bg-slate-800 border-slate-600 text-white rounded-md px-3 py-2"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly (Every 3 months)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">First Payment Date</Label>
                      <Input
                        type="date"
                        value={scheduleConfig.firstPaymentDate || ""}
                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, firstPaymentDate: e.target.value })}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium">Payment Amount per Period</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Amount per payment period"
                          value={scheduleConfig.paymentDates?.[0]?.amount || ""}
                          onChange={(e) => {
                            const payments = [{ date: scheduleConfig.firstPaymentDate || "", amount: e.target.value, percentage: "" }];
                            setScheduleConfig({ ...scheduleConfig, paymentDates: payments });
                          }}
                          className="pl-8 bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        Client will pay this amount {scheduleConfig.paymentFrequency === "weekly" && "every week"}
                        {scheduleConfig.paymentFrequency === "biweekly" && "every 2 weeks"}
                        {scheduleConfig.paymentFrequency === "monthly" && "every month"}
                        {scheduleConfig.paymentFrequency === "quarterly" && "every 3 months"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowScheduleConfig(false);
                  }}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowScheduleConfig(false);
                    toast({
                      title: "Payment Schedule Configured",
                      description: `${paymentSchedule} schedule has been configured and will be included in your contract.`,
                    });
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Payment Methods */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-400" />
              Accepted Payment Methods
            </Label>
            <div className="flex flex-wrap gap-3">
              {["Cash", "Check", "Bank Transfer", "Credit Card", "PayPal", "Venmo", "Zelle", "Cash App", "Wire Transfer"].map((method: string) => {
                const isSelected = paymentMethods.includes(method);
                const hasDetails = paymentMethodDetails[method];
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handlePaymentMethodClick(method)}
                    className={`relative flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all min-w-[100px] ${
                      isSelected
                        ? `bg-gradient-to-br ${getPaymentMethodColor(method)} border-indigo-500 text-white shadow-lg`
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <span className="text-3xl">{getPaymentMethodIcon(method)}</span>
                    <span className="text-xs font-medium">{method}</span>
                    {isSelected && hasDetails && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full border border-white"></span>
                    )}
                  </button>
                );
              })}
            </div>
            {paymentMethods.length === 0 && (
              <p className="text-xs text-slate-500">Optional: Select accepted payment methods</p>
            )}
            {paymentMethods.length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-400 mb-2">Selected Methods:</p>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((method: string) => (
                    <div key={method} className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-700/50 border border-slate-600">
                      <span className="text-lg">{getPaymentMethodIcon(method)}</span>
                      <span className="text-sm text-slate-300">{method}</span>
                      {paymentMethodDetails[method] && (
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Details Modal */}
          <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
              <DialogHeader className="pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl">{selectedPaymentMethod && getPaymentMethodIcon(selectedPaymentMethod)}</span>
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">
                      Setup {selectedPaymentMethod}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-sm mt-1">
                      Add payment details that will be included in your contract
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-5 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {/* Context-specific help text */}
                {selectedPaymentMethod && (
                  <div className="p-4 rounded-lg bg-indigo-900/20 border border-indigo-500/30">
                    <div className="flex items-start gap-2">
                      <span className="text-indigo-400 text-lg">💡</span>
                      <div>
                        <p className="text-sm font-medium text-indigo-200 mb-1">
                          {selectedPaymentMethod === "Check" && "Check Payment Instructions"}
                          {selectedPaymentMethod === "Cash" && "Cash Payment Instructions"}
                          {selectedPaymentMethod === "Bank Transfer" && "Bank Transfer Details"}
                          {selectedPaymentMethod === "Wire Transfer" && "Wire Transfer Details"}
                          {selectedPaymentMethod === "PayPal" && "PayPal Account Setup"}
                          {selectedPaymentMethod === "Venmo" && "Venmo Account Setup"}
                          {selectedPaymentMethod === "Zelle" && "Zelle Account Setup"}
                          {selectedPaymentMethod === "Cash App" && "Cash App Account Setup"}
                          {selectedPaymentMethod === "Credit Card" && "Credit Card Processing"}
                          {!["Check", "Cash", "Bank Transfer", "Wire Transfer", "PayPal", "Venmo", "Zelle", "Cash App", "Credit Card"].includes(selectedPaymentMethod) && "Payment Setup"}
                        </p>
                        <p className="text-xs text-indigo-300/80 leading-relaxed">
                          {selectedPaymentMethod === "Check" && "Provide details for where checks should be sent. Include the payee name (your business name) and mailing address if applicable."}
                          {selectedPaymentMethod === "Cash" && "Specify where and when cash payments can be made. Include any meeting locations or pickup instructions."}
                          {selectedPaymentMethod === "Bank Transfer" && "Enter your bank account details. These will be shared with the client for direct deposit or ACH transfers."}
                          {selectedPaymentMethod === "Wire Transfer" && "Provide wire transfer instructions including account and routing numbers. These details will be included in the contract."}
                          {selectedPaymentMethod === "PayPal" && "Enter the email address associated with your PayPal account. Clients will use this to send payments."}
                          {selectedPaymentMethod === "Venmo" && "Provide your Venmo username or phone number. Clients can send payments directly through Venmo."}
                          {selectedPaymentMethod === "Zelle" && "Enter the email or phone number linked to your Zelle account. This enables instant bank-to-bank transfers."}
                          {selectedPaymentMethod === "Cash App" && "Enter your Cash App $Cashtag, email, or phone number. Clients can send payments instantly through Cash App using your $Cashtag."}
                          {selectedPaymentMethod === "Credit Card" && "Enter the email where credit card payment links or invoices should be sent."}
                          {!["Check", "Cash", "Bank Transfer", "Wire Transfer", "PayPal", "Venmo", "Zelle", "Cash App", "Credit Card"].includes(selectedPaymentMethod) && "Enter the necessary payment details for this method."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedPaymentMethod && getPaymentMethodFields(selectedPaymentMethod).includes("email") && (
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium flex items-center gap-2">
                        <span>📧</span>
                        Email Address
                        {selectedPaymentMethod === "PayPal" || selectedPaymentMethod === "Zelle" || selectedPaymentMethod === "Cash App" ? (
                          <span className="text-xs text-red-400">*</span>
                        ) : null}
                      </Label>
                      <Input
                        type="email"
                        placeholder={
                          selectedPaymentMethod === "PayPal" ? "your.paypal@email.com" :
                          selectedPaymentMethod === "Zelle" ? "your.zelle@email.com" :
                          selectedPaymentMethod === "Cash App" ? "your.cashapp@email.com" :
                          "your@email.com"
                        }
                        value={paymentFormData.email}
                        onChange={(e) => setPaymentFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-slate-800 border-slate-600 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                      {(selectedPaymentMethod === "PayPal" || selectedPaymentMethod === "Zelle" || selectedPaymentMethod === "Cash App") && (
                        <p className="text-xs text-slate-500">This email must be linked to your {selectedPaymentMethod} account</p>
                      )}
                    </div>
                  )}
                  
                  {selectedPaymentMethod && getPaymentMethodFields(selectedPaymentMethod).includes("phone") && (
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium flex items-center gap-2">
                        <span>📱</span>
                        Phone Number
                        {selectedPaymentMethod === "Venmo" || selectedPaymentMethod === "Zelle" || selectedPaymentMethod === "Cash App" ? (
                          <span className="text-xs text-red-400">*</span>
                        ) : null}
                      </Label>
                      <Input
                        type="tel"
                        placeholder={
                          selectedPaymentMethod === "Venmo" ? "Your Venmo phone number" :
                          selectedPaymentMethod === "Zelle" ? "Your Zelle phone number" :
                          selectedPaymentMethod === "Cash App" ? "Your Cash App phone number or $Cashtag" :
                          "(555) 123-4567"
                        }
                        value={paymentFormData.phone}
                        onChange={(e) => setPaymentFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-slate-800 border-slate-600 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                      {(selectedPaymentMethod === "Venmo" || selectedPaymentMethod === "Zelle" || selectedPaymentMethod === "Cash App") && (
                        <p className="text-xs text-slate-500">
                          {selectedPaymentMethod === "Cash App" 
                            ? "Enter your phone number or $Cashtag (e.g., $YourName). This must be linked to your Cash App account."
                            : `This phone number must be linked to your ${selectedPaymentMethod} account`}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {selectedPaymentMethod && getPaymentMethodFields(selectedPaymentMethod).includes("account") && (
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium flex items-center gap-2">
                        <span>🏦</span>
                        Account Number
                        <span className="text-xs text-red-400">*</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder={
                          selectedPaymentMethod === "Bank Transfer" ? "Your bank account number" :
                          selectedPaymentMethod === "Wire Transfer" ? "Your account number for wire transfers" :
                          "Account number"
                        }
                        value={paymentFormData.account}
                        onChange={(e) => setPaymentFormData(prev => ({ ...prev, account: e.target.value }))}
                        className="bg-slate-800 border-slate-600 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                      <p className="text-xs text-slate-500">Keep this secure. Only share with trusted clients.</p>
                    </div>
                  )}
                  
                  {selectedPaymentMethod && getPaymentMethodFields(selectedPaymentMethod).includes("routing") && (
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium flex items-center gap-2">
                        <span>🔢</span>
                        Routing Number
                        <span className="text-xs text-red-400">*</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder="9-digit routing number"
                        value={paymentFormData.routing}
                        onChange={(e) => setPaymentFormData(prev => ({ ...prev, routing: e.target.value.replace(/\D/g, "").slice(0, 9) }))}
                        className="bg-slate-800 border-slate-600 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                        maxLength={9}
                      />
                      <p className="text-xs text-slate-500">Your bank&apos;s 9-digit routing number (ABA number)</p>
                    </div>
                  )}
                  
                  {selectedPaymentMethod && getPaymentMethodFields(selectedPaymentMethod).includes("notes") && (
                    <div className="space-y-2">
                      <Label className="text-slate-300 font-medium flex items-center gap-2">
                        <span>📝</span>
                        Additional Instructions
                      </Label>
                      <Textarea
                        placeholder={
                          selectedPaymentMethod === "Check" ? "e.g., Make checks payable to: [Your Business Name]\nMailing address: [Your Address]" :
                          selectedPaymentMethod === "Cash" ? "e.g., Cash payments can be made at [Location] during [Hours]\nOr arrange pickup at [Address]" :
                          "Any additional payment instructions or notes..."
                        }
                        value={paymentFormData.notes}
                        onChange={(e) => setPaymentFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="bg-slate-800 border-slate-600 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        rows={4}
                      />
                      <p className="text-xs text-slate-500">
                        {selectedPaymentMethod === "Check" && "Include payee name and mailing address if needed"}
                        {selectedPaymentMethod === "Cash" && "Specify location, hours, or pickup arrangements"}
                        {selectedPaymentMethod !== "Check" && selectedPaymentMethod !== "Cash" && "Optional: Add any special instructions for this payment method"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="pt-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPaymentMethod(null);
                    setPaymentFormData({ email: "", account: "", phone: "", routing: "", notes: "" });
                  }}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePaymentDetails}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Payment Method
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Insert into Contract Option */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-start gap-3">
              <Checkbox
                id="insertPayment"
                checked={insertPaymentIntoContract}
                onCheckedChange={(checked) => setInsertPaymentIntoContract(checked === true)}
                className="mt-0.5 border-slate-500 data-[state=checked]:bg-indigo-600"
              />
              <div className="flex-1">
                <Label htmlFor="insertPayment" className="text-slate-300 font-semibold cursor-pointer flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  Insert Payment Details into Contract
                </Label>
                <p className="text-xs text-slate-500 mt-1">
                  Automatically add payment terms, amounts, and schedule to your contract content
                </p>
              </div>
            </div>
          </div>

          {/* Payment Terms Display */}
          {paymentTerms && (
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <Label className="text-slate-300 font-semibold mb-2 block">Additional Payment Terms</Label>
              <p className="text-sm text-slate-400 whitespace-pre-wrap">{paymentTerms}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-700">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
              onClick={handleSubmit}
              disabled={
                !total || 
                parseFloat(total) < 0 ||
                (compensationType === "hourly" && (!hourlyRate || !estimatedHours)) ||
                (compensationType === "milestone" && milestones.length === 0)
              }
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
            >
              Continue to Review
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

function Step5Preview({
  data,
  onSubmit,
  onBack,
  isLoading,
  hasAIAccess,
  setData,
}: {
  data: ContractData;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
  hasAIAccess?: boolean | null;
  setData: (data: ContractData | ((prev: ContractData) => ContractData)) => void;
}) {
  const { toast } = useToast();
  const client = data.client || data.newClient;
  const paymentSchedule = (data as any).paymentSchedule;
  const paymentMethods = (data as any).paymentMethods || [];
  const paymentScheduleConfig = (data as any).paymentScheduleConfig;
  const [isFixingContract, setIsFixingContract] = useState(false);
  const [showFullScreenEditor, setShowFullScreenEditor] = useState(false);
  const [editedContent, setEditedContent] = useState(data.content);
  const [insertPaymentIntoContract, setInsertPaymentIntoContract] = useState((data as any).insertPaymentIntoContract ?? true);

  // Generate payment section function
  const generatePaymentSection = (
    total: string,
    deposit: string,
    compType?: string,
    schedule?: string,
    methods?: string[],
    hourly?: string,
    milestones?: Array<{ name: string; amount: string; dueDate: string }>
  ): string => {
    let section = "PAYMENT TERMS AND COMPENSATION\n\n";
    
    // Hourly rate if applicable
    if (compType === "hourly" && hourly) {
      section += `COMPENSATION RATE:\n`;
      section += `Hourly Rate: $${parseFloat(hourly).toFixed(2)} per hour\n\n`;
    }
    
    // Total amount
    section += `TOTAL CONTRACT AMOUNT: $${parseFloat(total || "0").toFixed(2)}\n\n`;
    
    // Deposit and balance
    if (parseFloat(deposit || "0") > 0) {
      const depositAmount = parseFloat(deposit);
      const totalAmount = parseFloat(total || "0");
      const depositPercent = totalAmount > 0 ? ((depositAmount / totalAmount) * 100).toFixed(1) : "0";
      const balance = totalAmount - depositAmount;
      
      section += `PAYMENT BREAKDOWN:\n`;
      section += `Deposit: $${depositAmount.toFixed(2)} (${depositPercent}%)\n`;
      section += `Balance Due: $${balance.toFixed(2)}\n\n`;
    }
    
    // Payment schedule
    if (schedule) {
      section += `PAYMENT SCHEDULE:\n`;
      switch(schedule) {
        case "upfront":
          section += `Payment due in full upon execution of this Agreement.\n\n`;
          break;
        case "partial":
          section += `Partial payment due upfront, with the remaining balance due upon completion and acceptance of all deliverables.\n\n`;
          break;
        case "full":
          section += `Full payment due upon completion and acceptance of all deliverables.\n\n`;
          break;
        case "split":
          section += `Payments will be split as agreed between the parties.\n\n`;
          break;
        case "incremental":
          section += `Incremental payments based on project milestones as specified below.\n\n`;
          break;
        default:
          section += `As specified in this Agreement.\n\n`;
      }
    }
    
    // Milestone payments
    if (milestones && milestones.length > 0) {
      section += `MILESTONE PAYMENTS:\n`;
      milestones.forEach((m, i) => {
        section += `${i + 1}. ${m.name}: $${parseFloat(m.amount).toFixed(2)}`;
        if (m.dueDate) {
          try {
            const dueDate = new Date(m.dueDate);
            section += ` (Due: ${dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})`;
          } catch (e) {
            section += ` (Due: ${m.dueDate})`;
          }
        }
        section += `\n`;
      });
      section += `\n`;
    }
    
    // Payment methods
    if (methods && methods.length > 0) {
      section += `ACCEPTED PAYMENT METHODS:\n`;
      section += `${methods.join(", ")}\n\n`;
    }
    
    // Payment terms footer
    section += `All payments are due within the timeframes specified above. Late payments may be subject to interest charges as permitted by law.`;
    
    return section;
  };

  // Check if payment schedule is configured when component mounts
  const hasShownWarning = useRef(false);
  useEffect(() => {
    if (!hasShownWarning.current && data.hasCompensation && paymentSchedule && (!paymentScheduleConfig || Object.keys(paymentScheduleConfig).length === 0)) {
      hasShownWarning.current = true;
      toast({
        title: "⚠️ Payment Schedule Not Configured",
        description: "Your payment schedule hasn't been configured yet. Go back to Step 4 and click 'Configure' on your selected payment schedule option to set up payment details.",
        variant: "destructive",
        duration: 8000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <FileCheck className="h-6 w-6 text-white" />
        </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Preview Contract</h2>
            <p className="text-green-100 text-sm">Review all details before creating the contract</p>
        </div>
                </div>
            </div>

      {/* Warning if payment schedule not configured */}
      {data.hasCompensation && paymentSchedule && (!paymentScheduleConfig || Object.keys(paymentScheduleConfig).length === 0) && (
        <div className="p-4 rounded-lg bg-amber-900/30 border-2 border-amber-500/50 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-amber-200 font-semibold mb-1">Payment Schedule Not Configured</h3>
            <p className="text-amber-300/80 text-sm mb-3">
              Your selected payment schedule ({paymentSchedule === "upfront" && "Pay Upfront"}
              {paymentSchedule === "partial" && "Partial Payment"}
              {paymentSchedule === "full" && "Pay in Full"}
              {paymentSchedule === "split" && "Split Payments"}
              {paymentSchedule === "incremental" && "Incremental"}) hasn&apos;t been configured yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="border-amber-500/50 text-amber-200 hover:bg-amber-900/50 hover:text-amber-100"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Go Back to Configure
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-slate-400 text-xs uppercase tracking-wide mb-1 block">Contract Title</Label>
                <p className="text-white font-semibold text-lg">{data.title || "Untitled Contract"}</p>
          </div>
              <div>
                <Label className="text-slate-400 text-xs uppercase tracking-wide mb-1 block">Client</Label>
                <p className="text-white font-medium">{client?.name || "No client selected"}</p>
                {client?.email && (
                  <p className="text-slate-400 text-sm">{client.email}</p>
                )}
                {client?.phone && (
                  <p className="text-slate-400 text-sm">{client.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Compensation Card */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-400" />
                Compensation & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
          {data.hasCompensation ? (
                <>
                  <div className="p-4 rounded-lg bg-indigo-900/20 border border-indigo-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">Type</span>
                      <span className="text-white font-medium">
                    {data.compensationType === "fixed_amount" ? "Fixed Amount" :
                     data.compensationType === "hourly" ? "Hourly Rate" :
                     data.compensationType === "milestone" ? "Milestone-Based" :
                         data.compensationType === "other" ? "Other" : "Fixed Amount"}
                  </span>
                </div>
                    
                    {parseFloat(data.totalAmount || "0") > 0 && (
                      <div className="flex justify-between items-center py-2 border-t border-indigo-500/20">
                        <span className="text-slate-300">Total Amount:</span>
                        <span className="text-2xl font-bold text-indigo-400">
                          ${parseFloat(data.totalAmount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                {parseFloat(data.depositAmount || "0") > 0 && (
                      <div className="flex justify-between items-center py-2 border-t border-indigo-500/20">
                        <span className="text-slate-300">Deposit:</span>
                        <span className="text-xl font-semibold text-white">
                          ${parseFloat(data.depositAmount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {parseFloat(data.depositAmount || "0") > 0 && parseFloat(data.totalAmount || "0") > 0 && (
                      <div className="flex justify-between items-center py-2 border-t border-indigo-500/20">
                        <span className="text-slate-300">Balance Due:</span>
                        <span className="text-lg font-semibold text-green-400">
                          ${(parseFloat(data.totalAmount) - parseFloat(data.depositAmount)).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {paymentSchedule && (
                      <div className="mt-3 pt-3 border-t border-indigo-500/20">
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Payment Schedule</span>
                        <p className="text-sm text-white mt-1">
                          {paymentSchedule === "upfront" && "Pay Upfront - Full payment upon signing"}
                          {paymentSchedule === "partial" && "Partial Payment - Deposit + balance later"}
                          {paymentSchedule === "full" && "Pay in Full - Payment upon completion"}
                          {paymentSchedule === "split" && "Split Payments - Multiple installments"}
                          {paymentSchedule === "incremental" && "Incremental - Pay as you go"}
                        </p>
                  </div>
                )}

                    {paymentMethods.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-indigo-500/20">
                        <span className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Payment Methods</span>
                        <div className="flex flex-wrap gap-2">
                          {paymentMethods.map((method: string) => (
                            <span key={method} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs">
                              {method}
                            </span>
                          ))}
              </div>
            </div>
                    )}

                    {data.paymentTerms && (
                      <div className="mt-3 pt-3 border-t border-indigo-500/20">
                        <span className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Additional Terms</span>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{data.paymentTerms}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 text-center">
                  <p className="text-slate-400 text-sm">No compensation specified for this contract</p>
            </div>
          )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Contract Content */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                Contract Content
              </CardTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditedContent(data.content);
                    setShowFullScreenEditor(true);
                  }}
                  className="border-indigo-500 bg-indigo-600/10 text-indigo-300 hover:bg-indigo-600/20 hover:text-indigo-200 hover:border-indigo-400 whitespace-nowrap"
                  title="Edit contract in full screen"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Full Screen Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    // Check access first
                    if (hasAIAccess !== true) {
                      toast({
                        title: "AI Feature Unavailable",
                        description: "AI contract fixing is only available for paid subscribers. Please upgrade your plan.",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    setIsFixingContract(true);
                    try {
                      const compensationData = {
                        hasCompensation: data.hasCompensation,
                        compensationType: data.compensationType,
                        totalAmount: data.totalAmount,
                        depositAmount: data.depositAmount,
                        hourlyRate: data.hourlyRate,
                        paymentSchedule: paymentSchedule,
                        paymentScheduleConfig: paymentScheduleConfig,
                        paymentMethods: paymentMethods,
                        paymentTerms: data.paymentTerms,
                      };

                      const response = await fetch("/api/ai/fix-contract", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          contractContent: data.content,
                          compensationData,
                        }),
                      });

                      const result = await response.json();

                      if (!response.ok) {
                        throw new Error(result.message || "Failed to fix contract");
                      }

                      if (result.success && result.fixedContent) {
                        setData((prev: ContractData) => ({
                          ...prev,
                          content: result.fixedContent,
                        }));
                        toast({
                          title: "✅ Contract Fixed",
                          description: "Your contract has been enhanced with payment information and cleaned up.",
                        });
                      }
                    } catch (error: any) {
                      console.error("Error fixing contract:", error);
                      toast({
                        title: "Error",
                        description: error.message || "Failed to fix contract. Please try again.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsFixingContract(false);
                    }
                  }}
                  disabled={isFixingContract || !data.content}
                  className="border-indigo-500 text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300 whitespace-nowrap"
                >
                  {isFixingContract ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Fixing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      AI Fix Contract
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Toggle to insert payment info */}
            {data.hasCompensation && (
              <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="insertPaymentStep5"
                    checked={insertPaymentIntoContract}
                    onCheckedChange={(checked) => {
                      const shouldInsert = checked === true;
                      setInsertPaymentIntoContract(shouldInsert);
                      
                      // Update data immediately
                      setData((prev: ContractData) => {
                        const updated = { ...prev };
                        (updated as any).insertPaymentIntoContract = shouldInsert;
                        
                        // If enabling, insert payment section
                        if (shouldInsert) {
                          const paymentSection = generatePaymentSection(
                            prev.totalAmount || "0",
                            prev.depositAmount || "0",
                            prev.compensationType,
                            paymentSchedule,
                            paymentMethods,
                            prev.hourlyRate,
                            prev.milestonePayments
                          );
                          
                          let updatedContent = prev.content;
                          
                          // Check if payment section already exists (more comprehensive check)
                          const hasPaymentSection = /PAYMENT\s+(TERMS|AND|COMPENSATION)|COMPENSATION|PAYMENT\s+TERMS|PAYMENT\s+SCHEDULE/i.test(updatedContent);
                          
                          if (!hasPaymentSection) {
                            // Try to find the best insertion point
                            // 1. After "SCOPE OF SERVICES" or "SERVICES" section
                            const servicesMatch = updatedContent.match(/(\d+\.?\s*(SCOPE\s+OF\s+)?SERVICES?[^\n]*\n[^\n]*\n)/i);
                            if (servicesMatch) {
                              const insertPos = servicesMatch.index! + servicesMatch[0].length;
                              updatedContent = updatedContent.slice(0, insertPos) + "\n\n" + paymentSection + "\n\n" + updatedContent.slice(insertPos);
                            } else {
                              // 2. After "COMPENSATION" or "PAYMENT" if mentioned but not detailed
                              const compensationMatch = updatedContent.match(/(COMPENSATION|PAYMENT)[^\n]*\n/i);
                              if (compensationMatch && !updatedContent.includes("PAYMENT TERMS")) {
                                const insertPos = compensationMatch.index! + compensationMatch[0].length;
                                updatedContent = updatedContent.slice(0, insertPos) + "\n" + paymentSection + "\n" + updatedContent.slice(insertPos);
                              } else {
                                // 3. Before signatures section
                                const signatureMatch = updatedContent.match(/(AGREED|SIGNED|SIGNATURE|IN\s+WITNESS|WITNESS\s+WHEREOF)/i);
                                if (signatureMatch) {
                                  const insertPos = signatureMatch.index!;
                                  updatedContent = updatedContent.slice(0, insertPos).trim() + "\n\n" + paymentSection + "\n\n" + updatedContent.slice(insertPos);
                                } else {
                                  // 4. At the end if no good location found
                                  updatedContent = updatedContent.trim() + "\n\n" + paymentSection;
                                }
                              }
                            }
                            updated.content = updatedContent;
                          }
                        }
                        
                        return updated;
                      });
                    }}
                    className="mt-0.5 border-slate-500 data-[state=checked]:bg-indigo-600"
                  />
                  <div className="flex-1">
                    <Label htmlFor="insertPaymentStep5" className="text-slate-300 font-semibold cursor-pointer flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-400" />
                      Insert Payment Details into Contract
                    </Label>
                    <p className="text-xs text-slate-500 mt-1">
                      Automatically add payment terms, amounts, and schedule to your contract content
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="prose prose-invert max-w-none whitespace-pre-wrap bg-slate-800 rounded-lg p-4 max-h-[600px] overflow-y-auto text-slate-300 text-sm leading-relaxed">
              {data.content || "No content yet..."}
          </div>
          </CardContent>
        </Card>
        </div>

      {/* Full Screen Editor Dialog */}
      <Dialog open={showFullScreenEditor} onOpenChange={setShowFullScreenEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              Edit Contract Content
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Make any manual edits to your contract content. Changes will be saved when you close this editor.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[70vh] bg-slate-800 border-slate-600 text-white font-mono text-sm leading-relaxed"
              placeholder="Enter contract content..."
            />
          </div>
          <DialogFooter>
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setShowFullScreenEditor(false);
                  setEditedContent(data.content);
                }}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setData((prev: ContractData) => ({
                    ...prev,
                    content: editedContent,
                  }));
                  setShowFullScreenEditor(false);
                  toast({
                    title: "✅ Contract Updated",
                    description: "Your contract content has been saved.",
                  });
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Buttons */}
        <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={onBack} 
          disabled={isLoading}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        <Button 
          onClick={onSubmit} 
          disabled={isLoading}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Create Contract
            </>
          )}
          </Button>
        </div>
    </div>
  );
}
