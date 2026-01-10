"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
}

export default function NewContractPage({
  searchParams,
}: {
  searchParams: { draftId?: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [defaultTemplates, setDefaultTemplates] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingDefaultTemplates, setLoadingDefaultTemplates] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [useNewClient, setUseNewClient] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [draftIdFromUrl, setDraftIdFromUrl] = useState<string | null>(searchParams?.draftId || null);

  const [data, setData] = useState<ContractData>({
    fieldValues: {},
    depositAmount: "0",
    totalAmount: "0",
    title: "",
    content: "",
    hasCompensation: false,
    compensationType: "no_compensation",
  });

  useEffect(() => {
    fetchTemplates();
    fetchDefaultTemplates();
    fetchClients();
    
    // Load draft if draftId is in URL
    if (draftIdFromUrl) {
      loadDraftFromDatabase(draftIdFromUrl);
    }
  }, [draftIdFromUrl]);

  const loadDraftFromDatabase = async (id: string) => {
    setLoadingDraft(true);
    try {
      const response = await fetch(`/api/drafts/contracts/${id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.draft) {
          const draft = result.draft;
          setData({
            ...data,
            title: draft.title || "",
            content: draft.content || "",
            fieldValues: draft.fieldValues || {},
            depositAmount: draft.depositAmount?.toString() || "0",
            totalAmount: draft.totalAmount?.toString() || "0",
            clientId: draft.clientId,
            templateId: draft.templateId,
          });
          // If client and template are set, skip to step 3
          if (draft.clientId) {
            // Fetch client and template details
            const clientResponse = await fetch(`/api/clients/${draft.clientId}`);
            if (clientResponse.ok) {
              const clientData = await clientResponse.json();
              setData(prev => ({ ...prev, client: clientData.client }));
            }
            if (draft.templateId) {
              const templateResponse = await fetch(`/api/templates/${draft.templateId}`);
              if (templateResponse.ok) {
                const templateData = await templateResponse.json();
                setData(prev => ({ ...prev, template: templateData.template }));
              }
            }
            setStep(3);
          } else if (draft.templateId) {
            const templateResponse = await fetch(`/api/templates/${draft.templateId}`);
            if (templateResponse.ok) {
              const templateData = await templateResponse.json();
              setData(prev => ({ ...prev, template: templateData.template }));
            }
            setStep(2);
          }
          toast({ title: "Draft loaded", description: "Your draft has been restored. Continue editing..." });
        }
      } else {
        toast({ title: "Draft not found", description: "Could not load the draft. Starting fresh.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error loading draft:", error);
      toast({ title: "Error", description: "Failed to load draft", variant: "destructive" });
    } finally {
      setLoadingDraft(false);
    }
  };

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
    if (compensationData?.hasCompensation) {
      setStep(4);
    } else {
      // Skip to step 5 (review) if no compensation
      setStep(5);
    }
  };

  const handleAmountsSubmit = (depositAmount: string, totalAmount: string) => {
    setData({
      ...data,
      depositAmount,
      totalAmount,
    });
    setStep(5);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Contract</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span className={step >= 1 ? "font-medium text-foreground" : ""}>1. Template</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step >= 2 ? "font-medium text-foreground" : ""}>2. Client</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step >= 3 ? "font-medium text-foreground" : ""}>3. Fields</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step >= 4 ? "font-medium text-foreground" : ""}>4. Amount</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step >= 5 ? "font-medium text-foreground" : ""}>5. Preview</span>
        </div>
      </div>

      {step === 1 && (
        <Step1ChooseTemplate
          templates={templates}
          defaultTemplates={defaultTemplates}
          loadingTemplates={loadingTemplates}
          loadingDefaultTemplates={loadingDefaultTemplates}
          onSelect={handleTemplateSelect}
          onSelectDefault={handleDefaultTemplateSelect}
          onBack={() => router.back()}
        />
      )}

      {step === 2 && (
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

      {step === 3 && (
        <Step3ContractBuilder
          data={data}
          setData={setData}
          template={data.template}
          fieldValues={data.fieldValues}
          onSubmit={handleFieldsSubmit}
          onBack={() => setStep(2)}
          draftId={draftIdFromUrl}
        />
      )}

      {step === 4 && data.hasCompensation && (
        <Step4SetAmounts
          depositAmount={data.depositAmount}
          totalAmount={data.totalAmount}
          onSubmit={handleAmountsSubmit}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <Step5Preview
          data={data}
          onSubmit={handlePreviewSubmit}
          onBack={() => setStep(data.hasCompensation ? 4 : 3)}
          isLoading={isLoading}
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
  onBack,
}: {
  templates: ContractTemplate[];
  defaultTemplates: any[];
  loadingTemplates: boolean;
  loadingDefaultTemplates: boolean;
  onSelect: (template: ContractTemplate | null) => void;
  onSelectDefault: (template: any) => void;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"default" | "custom" | "scratch">("default");

  return (
    <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-slate-800 via-slate-800 to-slate-700 border-b border-slate-700/50">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-indigo-400" />
          Choose Template
        </CardTitle>
        <CardDescription className="text-slate-400 mt-1.5">
          Select a template or start from scratch
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

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
        </div>
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
}: {
  clients: Client[];
  loading: boolean;
  useNewClient: boolean;
  setUseNewClient: (value: boolean) => void;
  onSelect: (clientId: string) => void;
  onNewClient: (client: { name: string; email: string; phone?: string }) => void;
  onBack: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

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
}) {
  const [values, setValues] = useState<Record<string, string>>(fieldValues);
  const [title, setTitle] = useState(data.title);
  const [content, setContent] = useState(data.content);
  const [hasCompensation, setHasCompensation] = useState(data.hasCompensation || false);
  const [compensationType, setCompensationType] = useState<"no_compensation" | "fixed_amount" | "hourly" | "milestone" | "other">(
    (data.compensationType as any) || "no_compensation"
  );
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
  useEffect(() => {
    if (initialDraftId) {
      loadDraftFromDatabase();
    } else {
      // Fallback to localStorage for backwards compatibility
      const savedDraft = localStorage.getItem("contract_draft");
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft.title) setTitle(draft.title);
          if (draft.content) setContent(draft.content);
          if (draft.customFields) setCustomFields(draft.customFields);
          if (draft.customFieldValues) setCustomFieldValues(draft.customFieldValues);
          if (draft.savedAt) setLastSaved(new Date(draft.savedAt));
          if (draft.draftId) setDraftId(draft.draftId);
          toast({ title: "Draft restored", description: "Your previous work has been loaded from local storage." });
        } catch (e) { console.error("Failed to load draft:", e); }
      }
    }
    const savedBranding = localStorage.getItem("contract_branding");
    if (savedBranding) {
      try { setBranding(JSON.parse(savedBranding)); } catch (e) {}
    }
  }, [initialDraftId]);

  const loadDraftFromDatabase = async () => {
    if (!initialDraftId) return;
    try {
      const response = await fetch(`/api/drafts/contracts/${initialDraftId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.draft) {
          const draft = result.draft;
          if (draft.title) setTitle(draft.title);
          if (draft.content) setContent(draft.content);
          if (draft.customFields) setCustomFields(draft.customFields);
          if (draft.fieldValues) setCustomFieldValues(draft.fieldValues);
          if (draft.updatedAt) setLastSaved(new Date(draft.updatedAt));
          setDraftId(draft.id);
          toast({ title: "Draft loaded", description: "Your draft has been restored from the database." });
        }
      }
    } catch (e) {
      console.error("Failed to load draft from database:", e);
    }
  };

  useEffect(() => {
    setData({ ...data, title, content });
  }, [title, content]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (title.trim() || content.trim()) saveDraftToDatabase(true);
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [title, content, customFields, customFieldValues, draftId]);

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

  // Save draft to database
  const saveDraftToDatabase = async (silent = false) => {
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
          metadata: { branding },
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
            toast({ title: "Draft saved!", description: "Your contract has been saved to the cloud." });
          }
        }
      } else {
        throw new Error("Failed to save draft");
      }
    } catch (e) {
      console.error("Failed to save draft:", e);
      // Fallback to localStorage if database save fails (only use local ID for localStorage, not database)
      try {
        const localDraftId = draftId || `local_draft_${Date.now()}`; // Use local prefix to distinguish from DB drafts
        const draft = { draftId: localDraftId, title, content, customFields, customFieldValues, savedAt: new Date().toISOString() };
        localStorage.setItem("contract_draft", JSON.stringify(draft));
        if (!silent) {
          toast({ title: "Draft saved locally", description: "Saved to browser storage (database unavailable)." });
        }
      } catch (localError) {
        if (!silent) {
          toast({ title: "Failed to save", description: "Could not save draft.", variant: "destructive" });
        }
      }
    } finally {
      setSavingDraft(false);
    }
  };

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
    return `<!DOCTYPE html><html><head><title>${title || "Contract"}</title><style>body{font-family:${branding.fontFamily};max-width:800px;margin:0 auto;padding:40px;line-height:1.6;color:#333}.header{text-align:${headerAlign};margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid ${branding.primaryColor}}.logo{max-height:80px;max-width:200px;margin-bottom:10px}.company-name{font-size:14px;color:${branding.secondaryColor};font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:20px}h1{font-size:28px;color:${branding.primaryColor};margin:20px 0;text-align:${headerAlign}}.content{white-space:pre-wrap;font-size:12pt}.footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;text-align:center;font-size:10px;color:#888}</style></head><body><div class="header">${branding.showLogo && branding.logo ? `<img src="${branding.logo}" class="logo" alt="Logo" />` : ""}${branding.showCompanyName && branding.companyName ? `<div class="company-name">${branding.companyName}</div>` : ""}</div><h1>${title || "Contract Agreement"}</h1><div class="content">${previewContent}</div><div class="footer">${branding.companyName ? `© ${new Date().getFullYear()} ${branding.companyName}. All rights reserved.` : ""}</div></body></html>`;
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
      const headerMatch = content.match(/^(.*?)(---|\n\n)/s);
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
      printWindow.document.write(getBrandedPdfHtml(previewContent));
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
            {template.fields.map((field) => (
              <div key={field.id} className="space-y-2">
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
                    if (!checked) {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-purple-400" />
            Contract Builder
          </h2>
          <p className="text-slate-400 mt-1">Build your contract from scratch with custom fields</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSnippets(!showSnippets)}
            className={`border-slate-600 ${showSnippets ? "bg-indigo-600 text-white border-indigo-500" : "text-slate-300 hover:bg-slate-700"}`}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Quick Insert
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLegalClauses(!showLegalClauses)}
            className={`border-slate-600 ${showLegalClauses ? "bg-purple-600 text-white border-purple-500" : "text-slate-300 hover:bg-slate-700"}`}
          >
            <Shield className="h-4 w-4 mr-2" />
            Legal Clauses
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowTemplates(!showTemplates); setShowSnippets(false); setShowLegalClauses(false); }}
            className={`border-slate-600 ${showTemplates ? "bg-green-600 text-white border-green-500" : "text-slate-300 hover:bg-slate-700"}`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <div className="h-6 w-px bg-slate-600" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveDraftToDatabase(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-green-500 hover:text-green-400"
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowBranding(!showBranding); setShowPdfPreview(false); setShowTemplates(false); }}
            className={`border-slate-600 ${showBranding ? "bg-pink-600 text-white border-pink-500" : "text-slate-300 hover:bg-slate-700"}`}
          >
            <Building className="h-4 w-4 mr-2" />
            Branding
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowPdfPreview(!showPdfPreview); setShowBranding(false); setShowTemplates(false); }}
            className={`border-slate-600 ${showPdfPreview ? "bg-red-600 text-white border-red-500" : "text-slate-300 hover:bg-slate-700"}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            PDF Preview
          </Button>
          {lastSaved && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Draft Status Bar */}
      {(lastSaved || (title.trim() || content.trim())) && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${lastSaved ? "bg-green-500" : "bg-amber-500"} animate-pulse`} />
            <span className="text-sm text-slate-400">
              {lastSaved ? `Draft saved ${lastSaved.toLocaleString()}` : "Unsaved changes"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => saveDraftToDatabase(false)} disabled={savingDraft} className="text-slate-400 hover:text-green-400 hover:bg-green-500/10">
              <FileCheck className="h-4 w-4 mr-1" />
              Save Now
            </Button>
            <Button variant="ghost" size="sm" onClick={clearDraft} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Draft
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
                  {branding.logo ? <img src={branding.logo} alt="Logo" className="max-h-12 object-contain" style={{ opacity: branding.logoOpacity / 100 }} /> : <Upload className="h-4 w-4 text-slate-500" />}
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
              <div className="overflow-y-auto p-8" style={{ maxHeight: "500px", fontFamily: branding.fontFamily }}>
                <div className="mb-6 pb-4" style={{ textAlign: branding.headerStyle === "centered" ? "center" : branding.headerStyle, borderBottom: `3px solid ${branding.primaryColor}` }}>
                  {branding.showLogo && branding.logo && <img src={branding.logo} alt="Logo" className="mb-2" style={{ maxHeight: "60px", maxWidth: "150px", margin: branding.headerStyle === "centered" ? "0 auto" : undefined }} />}
                  {branding.showCompanyName && branding.companyName && <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: branding.secondaryColor }}>{branding.companyName}</div>}
                </div>
                <h1 className="text-2xl font-bold mb-6" style={{ color: branding.primaryColor, textAlign: branding.headerStyle === "centered" ? "center" : branding.headerStyle }}>{title || "Contract Agreement"}</h1>
                <div className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{getPreviewContent() || "Start typing to see preview..."}</div>
                {branding.companyName && <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">© {new Date().getFullYear()} {branding.companyName}. All rights reserved.</div>}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
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
                    if (!checked) {
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
        <div className="space-y-4">
          {/* Simple Fields Section - Combined Add & Fill */}
          <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-b border-slate-700 py-3">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                📝 Your Info
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">Fill in these blanks for your contract</p>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Show existing fields with inline editing - SIMPLE */}
              {customFields.length > 0 ? (
                <div className="space-y-3">
                  {customFields.map((field) => (
                    <div key={field.id} className="group">
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

          {/* Live Preview & Import/Export */}
          <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-400" />
                  Live Preview
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImportExport(!showImportExport)}
                  className={`border-slate-600 ${showImportExport ? "bg-amber-600 text-white border-amber-500" : "text-slate-300 hover:bg-slate-700"}`}
                >
                  <FileDown className="h-4 w-4 mr-1" />
                  {showImportExport ? "Hide" : "Import/Export"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Preview Area */}
              <div className="bg-white rounded-lg p-4 min-h-[200px] max-h-[300px] overflow-y-auto shadow-inner">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title || "Contract Title"}</h3>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700 text-xs">
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
          </Card>
        </div>
      </div>
    </div>
  );
}

function Step4SetAmounts({
  depositAmount,
  totalAmount,
  onSubmit,
  onBack,
}: {
  depositAmount: string;
  totalAmount: string;
  onSubmit: (deposit: string, total: string) => void;
  onBack: () => void;
}) {
  const [deposit, setDeposit] = useState(depositAmount);
  const [total, setTotal] = useState(totalAmount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Amounts</CardTitle>
        <CardDescription>Enter deposit and total contract amounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Deposit Amount ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Total Amount ($) <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => onSubmit(deposit, total)}
            disabled={!total || parseFloat(total) < 0}
          >
            Continue
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Step5Preview({
  data,
  onSubmit,
  onBack,
  isLoading,
}: {
  data: ContractData;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const client = data.client || data.newClient;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview Contract</CardTitle>
        <CardDescription>Review all details before creating the contract</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Contract Title</h3>
          <p>{data.title}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Client</h3>
          <p>{client?.name}</p>
          <p className="text-sm text-muted-foreground">{client?.email}</p>
          {client?.phone && (
            <p className="text-sm text-muted-foreground">{client.phone}</p>
          )}
        </div>
        {Object.keys(data.fieldValues).length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Field Values</h3>
            <div className="space-y-1">
              {Object.entries(data.fieldValues).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium">{key}:</span> {value}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <h3 className="font-semibold">Compensation</h3>
          {data.hasCompensation ? (
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium">Compensation Type:</span>
                  <span className="text-indigo-700">
                    {data.compensationType === "fixed_amount" ? "Fixed Amount" :
                     data.compensationType === "hourly" ? "Hourly Rate" :
                     data.compensationType === "milestone" ? "Milestone-Based" :
                     data.compensationType === "other" ? "Other" : "No Compensation"}
                  </span>
                </div>
                {parseFloat(data.depositAmount || "0") > 0 && (
                  <div>Deposit: <span className="font-semibold">${parseFloat(data.depositAmount).toFixed(2)}</span></div>
                )}
                {parseFloat(data.totalAmount || "0") > 0 && (
                  <div>Total: <span className="font-semibold">${parseFloat(data.totalAmount).toFixed(2)}</span></div>
                )}
                {data.paymentTerms && (
                  <div className="mt-2 pt-2 border-t border-indigo-200">
                    <p className="text-xs text-gray-600 mb-1">Payment Terms:</p>
                    <p className="text-sm whitespace-pre-wrap">{data.paymentTerms}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">No compensation specified for this contract</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Contract Content</h3>
          <div className="prose max-w-none whitespace-pre-wrap border rounded p-4 max-h-96 overflow-y-auto">
            {data.content}
          </div>
        </div>
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack} disabled={isLoading}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Contract"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
