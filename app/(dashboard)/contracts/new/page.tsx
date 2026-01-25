"use client";

import { useState, useEffect, useRef, lazy, Suspense } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  UserPlus, 
  DollarSign,
  Eye,
  Loader2,
  Sparkles,
  CheckCircle2,
  FolderOpen,
  Plus,
  Trash2,
  Mail,
  Phone,
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
  Clock,
  MapPin,
  Globe,
  Building,
  User,
  Users,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ContractTemplate } from "@/lib/types";
import type { Client } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import dynamic from "next/dynamic";

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@/components/editor/rich-text-editor"),
  { 
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-slate-700/50 rounded-lg min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    )
  }
);

type Step = 1 | 2 | 3 | 4 | 5 | 6;

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
  contractType?: "contract" | "proposal"; // "contract" = client pays contractor, "proposal" = contractor offers to pay client
  hasCompensation?: boolean;
  compensationType?: "no_compensation" | "fixed_amount" | "hourly" | "milestone" | "other";
  paymentTerms?: string;
  usePassword?: boolean;
  password?: string;
  confirmPassword?: string;
}

export default function NewContractPage() {
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
  const [showPreview, setShowPreview] = useState(false);

  const [data, setData] = useState<ContractData>({
    fieldValues: {},
    depositAmount: "0",
    totalAmount: "0",
    title: "",
    content: "",
    contractType: "contract", // Default to regular contract
    hasCompensation: false,
    compensationType: "no_compensation",
  });

  const [branding, setBranding] = useState({
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    accentColor: "#10b981",
    fontFamily: "Georgia, serif",
    fontSize: "normal" as "small" | "normal" | "large",
    headerStyle: "centered" as "centered" | "left" | "right",
    showBorder: true,
    borderStyle: "solid" as "solid" | "double" | "dashed" | "none",
    backgroundColor: "#ffffff",
    paperStyle: "clean" as "clean" | "lined" | "subtle",
  });

  const progress = ((step - 1) / 5) * 100;

  useEffect(() => {
    fetchTemplates();
    fetchDefaultTemplates();
    fetchClients();
  }, []);

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

  const handleAIContractGenerate = async (aiContract: { title: string; content: string }) => {
    // Set the AI-generated contract data
    setData({
      ...data,
      templateId: undefined,
      template: undefined,
      title: aiContract.title,
      content: aiContract.content,
    });
    setStep(2); // Move to client selection step
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

  const handleNewClient = (client: Client) => {
    setData({
      ...data,
      clientId: client.id,
      client,
      newClient: undefined,
    });
    setUseNewClient(false);
    setStep(3);
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients?id=${clientId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const client = clients.find((c) => c.id === clientId);
        toast({
          title: "Client deleted",
          description: `${client?.name || "Client"} has been deleted.`,
        });
        fetchClients(); // Refresh the client list
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to delete client",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFieldsSubmit = (fieldValues: Record<string, string>, compensationData?: {
    hasCompensation: boolean;
    compensationType?: string;
    paymentTerms?: string;
  }) => {
    let content = data.content;
    
    // Replace field placeholders in content
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
      contractType: data.contractType || "contract", // Include contract type from data
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
      // Skip to step 6 (styling) if no compensation
      setStep(6);
    }
  };

  const handleAmountsSubmit = (depositAmount: string, totalAmount: string) => {
    setData({
      ...data,
      depositAmount,
      totalAmount,
    });
    setStep(6); // Go to styling step
  };

  const handlePreviewSubmit = async () => {
    setIsLoading(true);
    try {
      const contractData: any = {
        title: data.title,
        content: data.content,
        depositAmount: parseFloat(data.depositAmount) || 0,
        totalAmount: parseFloat(data.totalAmount) || 0,
        contractType: data.contractType || "contract", // Include contract type
        hasCompensation: data.hasCompensation || false,
        compensationType: data.compensationType || "no_compensation",
        paymentTerms: data.paymentTerms || null,
        paymentSchedule: data.paymentSchedule,
        paymentScheduleConfig: data.paymentScheduleConfig,
        // Include branding/styling settings for PDF generation
        branding: branding,
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
          title: "Contract created successfully!",
          description: "Your contract has been saved and sent to the client.",
          duration: 5000,
        });
        // Redirect to contract detail page - use replace for faster navigation
        router.replace(`/dashboard/contracts/${result.contract.id}`);
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

  const steps = [
    { number: 1, label: "Template", icon: FileText },
    { number: 2, label: "Client", icon: UserPlus },
    { number: 3, label: "Details", icon: Sparkles },
    { number: 4, label: "Payment", icon: DollarSign },
    { number: 6, label: "Style", icon: FileType },
    { number: 5, label: "Review", icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Create Contract</h1>
            <p className="text-slate-400 text-lg">
              Build professional contracts with our step-by-step builder
            </p>
          </div>
          <Link href="/dashboard/contracts">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancel
            </Button>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step >= s.number;
              const isCurrent = step === s.number;
              
              return (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500 text-white"
                          : "bg-slate-700 border-slate-600 text-slate-400"
                      } ${isCurrent ? "ring-4 ring-purple-500/30" : ""}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs mt-2 ${isActive ? "text-white" : "text-slate-500"}`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded ${
                        step > s.number ? "bg-gradient-to-r from-purple-600 to-indigo-600" : "bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2 bg-slate-700" />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {step === 1 && (
          <Step1ChooseTemplate
            templates={templates}
            defaultTemplates={defaultTemplates}
            loadingTemplates={loadingTemplates}
            loadingDefaultTemplates={loadingDefaultTemplates}
            onSelect={handleTemplateSelect}
            onSelectDefault={handleDefaultTemplateSelect}
            onAIGenerate={handleAIContractGenerate}
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
            onRefresh={fetchClients}
            onDelete={handleDeleteClient}
          />
        )}

        {step === 3 && (
          <Step3ContractDetails
            data={data}
            setData={setData}
            template={data.template}
            fieldValues={data.fieldValues}
            onSubmit={handleFieldsSubmit}
            onBack={() => setStep(2)}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
          />
        )}

        {step === 4 && data.hasCompensation && (
          <Step4SetAmounts
            depositAmount={data.depositAmount}
            totalAmount={data.totalAmount}
            contractType={data.contractType || "contract"}
            onSubmit={handleAmountsSubmit}
            onBack={() => setStep(3)}
          />
        )}

        {step === 6 && (
          <Step6Styling
            data={data}
            branding={branding}
            setBranding={setBranding}
            onSubmit={() => setStep(5)}
            onBack={() => setStep(data.hasCompensation ? 4 : 3)}
          />
        )}

        {step === 5 && (
          <Step5Preview
            data={data}
            setData={setData}
            onSubmit={handlePreviewSubmit}
            onBack={() => setStep(6)}
            isLoading={isLoading}
          />
        )}
      </div>
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
}: {
  templates: ContractTemplate[];
  defaultTemplates: any[];
  loadingTemplates: boolean;
  loadingDefaultTemplates: boolean;
  onSelect: (template: ContractTemplate | null) => void;
  onSelectDefault: (template: any) => void;
  onAIGenerate: (contract: { title: string; content: string }) => void;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"default" | "custom" | "scratch" | "ai">("default");
  const [aiDescription, setAiDescription] = useState("");
  const [aiContractType, setAiContractType] = useState("");
  const [aiAdditionalDetails, setAiAdditionalDetails] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
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
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "default" | "custom" | "scratch" | "ai")} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-slate-700/50 border border-slate-600/50">
            <TabsTrigger
              value="default"
              className="flex items-center gap-2 text-slate-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Default
            </TabsTrigger>
            <TabsTrigger
              value="custom"
              className="flex items-center gap-2 text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 transition-all"
            >
              <FolderOpen className="h-4 w-4" />
              My Templates
            </TabsTrigger>
            <TabsTrigger
              value="scratch"
              className="flex items-center gap-2 text-slate-300 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              Scratch
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="flex items-center gap-2 text-slate-300 data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/20 transition-all"
            >
              <Wand2 className="h-4 w-4" />
              AI Contract
            </TabsTrigger>
          </TabsList>

          {/* Default Templates Tab */}
          <TabsContent value="default" className="mt-4">
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
          </TabsContent>

          {/* Custom Templates Tab */}
          <TabsContent value="custom" className="mt-4">
          <div className="space-y-3">
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
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
                <FolderOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">You haven&apos;t created any templates yet.</p>
                <Link href="/dashboard/templates/new">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Button>
                </Link>
              </div>
            )}
          </div>
          </TabsContent>

          {/* Start from Scratch Tab */}
          <TabsContent value="scratch" className="mt-4">
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
          </TabsContent>

          {/* AI Contract Generation Tab */}
          <TabsContent value="ai" className="mt-4">
            <div className="space-y-4">
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
                      const response = await fetch("/api/ai/generate-contract", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          description: aiDescription,
                          contractType: aiContractType || undefined,
                          additionalDetails: aiAdditionalDetails || undefined,
                        }),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.contract) {
                          toast({
                            title: "Contract generated",
                            description: "AI has successfully generated your contract!",
                          });
                          onAIGenerate(result.contract);
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
                  disabled={isGenerating || !aiDescription.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Contract...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Contract with AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
  onRefresh,
  onDelete,
}: {
  clients: Client[];
  loading: boolean;
  useNewClient: boolean;
  setUseNewClient: (value: boolean) => void;
  onSelect: (clientId: string) => void;
  onNewClient: (client: { name: string; email: string; phone?: string }) => void;
  onBack: () => void;
  onCancel: () => void;
  onRefresh: () => void;
  onDelete: (clientId: string) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  if (useNewClient) {
    return (
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-indigo-400" />
            Create New Client
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Enter client information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Name *</Label>
            <Input
              id="name"
              type="text"
              className="bg-slate-700/50 border-slate-600 text-white"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email *</Label>
            <Input
              id="email"
              type="email"
              className="bg-slate-700/50 border-slate-600 text-white"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-300">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              className="bg-slate-700/50 border-slate-600 text-white"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={() => setUseNewClient(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (formData.name && formData.email) {
                    setIsSaving(true);
                    try {
                      // Save client to database
                      const response = await fetch("/api/clients", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: formData.name,
                          email: formData.email,
                          phone: formData.phone || null,
                        }),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        toast({
                          title: "Client created",
                          description: `${formData.name} has been added to your clients.`,
                        });
                        onRefresh(); // Refresh the client list
                        onNewClient(result.client); // Pass the created client
                        setFormData({ name: "", email: "", phone: "" });
                      } else {
                        const error = await response.json();
                        toast({
                          title: "Error",
                          description: error.message || "Failed to create client",
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
                      setIsSaving(false);
                    }
                  }
                }}
                disabled={!formData.name || !formData.email || isSaving}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-indigo-400" />
          Choose Client
        </CardTitle>
        <CardDescription className="text-slate-400 mt-1">
          Select an existing client or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        ) : (
          <>
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 border-2 border-slate-600 hover:border-indigo-500 bg-slate-700/50 hover:bg-slate-700 text-white"
              onClick={() => setUseNewClient(true)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Create New Client</div>
                  <div className="text-xs text-slate-400">Add a new client to your database</div>
                </div>
              </div>
            </Button>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="group relative border-2 border-slate-700 rounded-lg bg-slate-800/50 hover:border-indigo-500/60 hover:bg-slate-700/50 transition-all duration-200 overflow-hidden"
                >
                  <button
                    onClick={() => onSelect(client.id)}
                    className="w-full text-left p-4 flex items-center gap-3 min-h-[80px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-semibold text-white group-hover:text-indigo-100 transition-colors">{client.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3 text-slate-500 flex-shrink-0" />
                        <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors truncate">{client.email}</div>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-3 w-3 text-slate-500 flex-shrink-0" />
                          <div className="text-xs text-slate-500">{client.phone}</div>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete ${client.name}?`)) {
                        setDeletingId(client.id);
                        await onDelete(client.id);
                        setDeletingId(null);
                      }
                    }}
                    disabled={deletingId === client.id}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="Delete client"
                  >
                    {deletingId === client.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
            {clients.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-lg bg-slate-900/20">
                <UserPlus className="h-16 w-16 text-slate-600 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400 mb-2 text-lg font-medium">No clients yet</p>
                <p className="text-sm text-slate-500 mb-4">Create your first client to get started</p>
              </div>
            )}
          </>
        )}
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
            variant="outline" 
            onClick={onCancel}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Step3ContractDetails({
  data,
  setData,
  template,
  fieldValues: initialFieldValues,
  onSubmit,
  onBack,
  showPreview,
  setShowPreview,
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
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
}) {
  // All hooks must be called unconditionally at the top
  const [values, setValues] = useState<Record<string, string>>(initialFieldValues);
  const [title, setTitle] = useState(data.title);
  const [content, setContent] = useState(data.content);
  const [contractType, setContractType] = useState<"contract" | "proposal">(data.contractType || "contract");
  const [hasCompensation, setHasCompensation] = useState(data.hasCompensation || false);
  const [compensationType, setCompensationType] = useState<"no_compensation" | "fixed_amount" | "hourly" | "milestone" | "other">(
    (data.compensationType as any) || "no_compensation"
  );
  const [paymentTerms, setPaymentTerms] = useState(data.paymentTerms || "");
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
  const [scratchFieldValues, setScratchFieldValues] = useState<Record<string, string>>({});
  const [showSnippets, setShowSnippets] = useState(false);
  const [showLegalClauses, setShowLegalClauses] = useState(false);
  const [showQuickFields, setShowQuickFields] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showSectionReorder, setShowSectionReorder] = useState(false);
  const [activeSnippetCategory, setActiveSnippetCategory] = useState<"sections" | "details" | "parties">("sections");
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [editorMode, setEditorMode] = useState<"rich" | "markdown">("rich");
  const [showImportExport, setShowImportExport] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [importing, setImporting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
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
  const { toast } = useToast();

  // Load branding from localStorage
  useEffect(() => {
    const savedBranding = localStorage.getItem("contract_branding");
    if (savedBranding) {
      try {
        setBranding(JSON.parse(savedBranding));
      } catch (e) {
        console.error("Failed to load branding:", e);
      }
    }
  }, []);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("contract_draft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.title) setTitle(draft.title);
        if (draft.content) setContent(draft.content);
        if (draft.customFields) setCustomFields(draft.customFields);
        if (draft.fieldValues) setFieldValues(draft.fieldValues);
        if (draft.savedAt) setLastSaved(new Date(draft.savedAt));
        if (draft.draftId) setDraftId(draft.draftId);
        toast({
          title: "Draft restored",
          description: "Your previous work has been loaded.",
        });
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, []);

  useEffect(() => {
    setData({ ...data, title, content });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

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
      setData((prev) => ({
        ...prev,
        insertPaymentIntoContract: true,
      }));
    }
  }, [title, content, hasCompensation, compensationType, setData]);

  // Auto-save draft every 30 seconds if there's content
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (title.trim() || content.trim()) {
        saveDraftToLocalStorage(true);
      }
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [title, content, customFields, fieldValues]);

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

  // Save draft to localStorage
  const saveDraftToLocalStorage = (silent = false) => {
    try {
      const draft = {
        draftId: draftId || `draft_${Date.now()}`,
        title,
        content,
        customFields,
        fieldValues,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem("contract_draft", JSON.stringify(draft));
      setLastSaved(new Date());
      if (!draftId) setDraftId(draft.draftId);
      if (!silent) {
        toast({
          title: "Draft saved!",
          description: "Your contract has been saved locally.",
        });
      }
    } catch (e) {
      if (!silent) {
        toast({
          title: "Failed to save",
          description: "Could not save draft to browser storage.",
          variant: "destructive",
        });
      }
    }
  };

  // Clear draft
  const clearDraft = () => {
    localStorage.removeItem("contract_draft");
    setTitle("");
    setContent("");
    setCustomFields([]);
    setFieldValues({});
    setLastSaved(null);
    setDraftId(null);
    toast({
      title: "Draft cleared",
      description: "Starting fresh with a blank contract.",
    });
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
      reader.onload = (event) => {
        setBranding({ ...branding, logo: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate branded PDF HTML
  const getBrandedPdfHtml = (previewContent: string) => {
    const headerAlign = branding.headerStyle === "centered" ? "center" : branding.headerStyle;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title || "Contract"}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: ${branding.fontFamily};
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: ${headerAlign};
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid ${branding.primaryColor};
          }
          .logo {
            max-height: 80px;
            max-width: 200px;
            margin-bottom: 10px;
          }
          .company-name {
            font-size: 14px;
            color: ${branding.secondaryColor};
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 20px;
          }
          h1 {
            font-size: 28px;
            color: ${branding.primaryColor};
            margin: 20px 0;
            text-align: ${headerAlign};
          }
          .content {
            white-space: pre-wrap;
            font-size: 12pt;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #888;
          }
          @media print {
            body { margin: 0; padding: 20px; }
            .header { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${branding.showLogo && branding.logo ? `<img src="${branding.logo}" class="logo" alt="Logo" />` : ""}
          ${branding.showCompanyName && branding.companyName ? `<div class="company-name">${branding.companyName}</div>` : ""}
        </div>
        <h1>${title || "Contract Agreement"}</h1>
        <div class="content">${previewContent}</div>
        <div class="footer">
          ${branding.companyName ? `© ${new Date().getFullYear()} ${branding.companyName}. All rights reserved.` : ""}
        </div>
      </body>
      </html>
    `;
  };

  // Export as PDF
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
      
      setTimeout(() => {
        printWindow.print();
      }, 500);
      
      toast({ title: "PDF Ready", description: "Use the print dialog to save as PDF." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
    }
  };

  // Export as Word (.doc) with branding
  const exportAsWord = () => {
    try {
      const previewContent = getPreviewContent();
      const headerAlign = branding.headerStyle === "centered" ? "center" : branding.headerStyle;
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${title || "Contract"}</title>
          <style>
            body { font-family: ${branding.fontFamily.includes("Georgia") ? "Georgia, serif" : "Calibri, sans-serif"}; font-size: 12pt; line-height: 1.5; }
            .header { text-align: ${headerAlign}; margin-bottom: 20px; border-bottom: 2px solid ${branding.primaryColor}; padding-bottom: 15px; }
            .company-name { font-size: 10pt; color: ${branding.secondaryColor}; font-weight: bold; text-transform: uppercase; }
            h1 { font-size: 18pt; text-align: ${headerAlign}; color: ${branding.primaryColor}; }
            .content { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="header">
            ${branding.showCompanyName && branding.companyName ? `<div class="company-name">${branding.companyName}</div>` : ""}
          </div>
          <h1>${title || "Contract Agreement"}</h1>
          <div class="content">${previewContent.replace(/\n/g, "<br>")}</div>
        </body>
        </html>
      `;
      
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
        // Plain text file
        const text = await file.text();
        const lines = text.split("\n");
        const importedTitle = lines[0] || "Imported Contract";
        const importedContent = lines.slice(1).join("\n").trim();
        
        setTitle(importedTitle);
        setContent(importedContent || text);
        toast({ title: "Imported!", description: "Text file imported successfully." });
      } else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
        // For Word files, we need to extract text
        // This is a simplified version - full Word parsing requires a library
        const text = await file.text();
        // Try to extract readable text from the file
        const cleanText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        
        if (cleanText.length > 50) {
          setContent(cleanText);
          setTitle(file.name.replace(/\.(doc|docx)$/i, ""));
          toast({ title: "Imported!", description: "Document imported. Some formatting may be lost." });
        } else {
          toast({ 
            title: "Limited Support", 
            description: "For best results, copy and paste content from Word directly.",
            variant: "destructive"
          });
        }
      } else if (fileName.endsWith(".html") || fileName.endsWith(".htm")) {
        // HTML file
        const html = await file.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const textContent = doc.body.textContent || "";
        const titleElement = doc.querySelector("title");
        
        setTitle(titleElement?.textContent || file.name.replace(/\.(html|htm)$/i, ""));
        setContent(textContent.trim());
        toast({ title: "Imported!", description: "HTML file imported successfully." });
      } else {
        toast({ 
          title: "Unsupported Format", 
          description: "Please use .txt, .doc, .docx, or .html files.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to import file", variant: "destructive" });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
      const body = emailMessage 
        ? `${emailMessage}\n\n---\n\n${title}\n\n${previewContent}`
        : `${title || "Contract Agreement"}\n\n${previewContent}`;
      
      // Use mailto link for now (can be replaced with API call for server-side email)
      const mailtoLink = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
      
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

  // Check if we should show template fields mode
  const hasTemplateFields = template && template.fields.length > 0;

  // If template has fields, show field form
  if (hasTemplateFields) {
    return (
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
            {template!.fields.map((field) => (
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
                        <Label className="text-slate-400 text-sm">
                          {data.contractType === "proposal" ? "Compensation Structure" : "Compensation Type"}
                        </Label>
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
                            {data.contractType === "proposal" ? "Fixed Offer" : "Fixed Amount"}
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
                            {data.contractType === "proposal" ? "Hourly Rate Offer" : "Hourly Rate"}
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
                            {data.contractType === "proposal" ? "Milestone-Based Offer" : "Milestone-Based"}
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
                        <Label htmlFor="paymentTerms" className="text-slate-400 text-sm">
                          {data.contractType === "proposal" 
                            ? "Compensation Terms & Legal Clauses" 
                            : "Payment Terms & Legal Clauses"}
                        </Label>
                        <Textarea
                          id="paymentTerms"
                          className="bg-slate-700/50 border-slate-600 text-white min-h-[80px]"
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          placeholder={data.contractType === "proposal"
                            ? "E.g., Compensation schedule, when payments will be made, terms of the offer, etc."
                            : "E.g., Net 30 days, payment due upon completion, late fees, etc."}
                        />
                        <p className="text-xs text-slate-500">
                          {data.contractType === "proposal"
                            ? "Specify compensation terms, payment schedules, and other legal clauses for your offer"
                            : "Specify payment terms, schedules, penalties, and other legal payment-related clauses"}
                        </p>
                      </div>
                    </div>
                  )}
                  {!hasCompensation && (
                    <p className="text-xs text-slate-500 pl-6 border-l-2 border-slate-700">
                      {data.contractType === "proposal"
                        ? "No compensation will be specified for this proposal"
                        : "No compensation or payment will be specified for this contract"}
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
                  template!.fields
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
              {(() => {
                let previewContent = content;
                template!.fields.forEach((field) => {
                  const value = values[field.id] || field.placeholder || `[${field.label}]`;
                  const regex = new RegExp(`\\{\\{${field.id}\\}\\}`, "g");
                  previewContent = previewContent.replace(regex, value);
                });
                return previewContent;
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No template or no fields - show full contract builder from scratch
  // Note: All hooks are already declared above, using scratchFieldValues for this mode
  const fieldValues = scratchFieldValues;
  const setFieldValues = setScratchFieldValues;

  // Quick insert fields - common fields users need
  const quickFields = [
    { id: "clientName", label: "Client Name", type: "text" as const, icon: User, category: "parties" },
    { id: "clientEmail", label: "Client Email", type: "text" as const, icon: Mail, category: "parties" },
    { id: "clientPhone", label: "Client Phone", type: "text" as const, icon: Phone, category: "parties" },
    { id: "clientAddress", label: "Client Address", type: "textarea" as const, icon: MapPin, category: "parties" },
    { id: "providerName", label: "Provider Name", type: "text" as const, icon: Building, category: "parties" },
    { id: "providerEmail", label: "Provider Email", type: "text" as const, icon: Mail, category: "parties" },
    { id: "companyName", label: "Company Name", type: "text" as const, icon: Building, category: "parties" },
    { id: "projectName", label: "Project Name", type: "text" as const, icon: Target, category: "project" },
    { id: "projectDescription", label: "Project Description", type: "textarea" as const, icon: FileText, category: "project" },
    { id: "scope", label: "Scope of Work", type: "textarea" as const, icon: Briefcase, category: "project" },
    { id: "deliverables", label: "Deliverables", type: "textarea" as const, icon: FileCheck, category: "project" },
    { id: "startDate", label: "Start Date", type: "date" as const, icon: Calendar, category: "dates" },
    { id: "endDate", label: "End Date", type: "date" as const, icon: Calendar, category: "dates" },
    { id: "deadline", label: "Deadline", type: "date" as const, icon: Clock, category: "dates" },
    { id: "totalAmount", label: "Total Amount", type: "number" as const, icon: DollarSign, category: "payment" },
    { id: "depositAmount", label: "Deposit Amount", type: "number" as const, icon: CreditCard, category: "payment" },
    { id: "hourlyRate", label: "Hourly Rate", type: "number" as const, icon: Clock, category: "payment" },
    { id: "paymentTerms", label: "Payment Terms", type: "textarea" as const, icon: CreditCard, category: "payment" },
    { id: "revisions", label: "Number of Revisions", type: "number" as const, icon: RefreshCw, category: "terms" },
    { id: "warranty", label: "Warranty Period", type: "text" as const, icon: Shield, category: "terms" },
    { id: "jurisdiction", label: "Jurisdiction", type: "text" as const, icon: Globe, category: "legal" },
  ];

  // Contract snippets organized by category
  const contractSnippets = {
    sections: [
      { 
        id: "header", 
        name: "Contract Header", 
        icon: FileText,
        description: "Professional contract opening",
        snippet: "CONTRACT AGREEMENT\n\nThis Agreement (\"Agreement\") is entered into as of {{effectiveDate}} (\"Effective Date\") by and between:\n\nSERVICE PROVIDER:\n{{providerName}}\n{{providerAddress}}\nEmail: {{providerEmail}}\n\nCLIENT:\n{{clientName}}\n{{clientAddress}}\nEmail: {{clientEmail}}\n\n---\n\n"
      },
      { 
        id: "services", 
        name: "Services & Scope", 
        icon: Briefcase,
        description: "Define work to be performed",
        snippet: "1. SERVICES\n\nThe Service Provider agrees to provide the following services (\"Services\"):\n\n{{serviceDescription}}\n\n1.1 Scope of Work:\n{{scope}}\n\n1.2 Deliverables:\n{{deliverables}}\n\n1.3 Exclusions:\nThe following are NOT included in this Agreement:\n{{exclusions}}\n\n"
      },
      { 
        id: "timeline", 
        name: "Timeline & Milestones", 
        icon: Calendar,
        description: "Project schedule and deadlines",
        snippet: "2. TIMELINE\n\n2.1 Project Schedule:\n- Project Start Date: {{startDate}}\n- Estimated Completion: {{endDate}}\n\n2.2 Milestones:\n\nPhase 1: {{phase1Name}}\n- Description: {{phase1Description}}\n- Due Date: {{phase1Date}}\n- Deliverables: {{phase1Deliverables}}\n\nPhase 2: {{phase2Name}}\n- Description: {{phase2Description}}\n- Due Date: {{phase2Date}}\n- Deliverables: {{phase2Deliverables}}\n\n2.3 Delays:\nIf delays occur due to Client's failure to provide necessary materials or feedback, the timeline will be adjusted accordingly.\n\n"
      },
      { 
        id: "payment", 
        name: "Payment Terms", 
        icon: DollarSign,
        description: "Pricing and payment schedule",
        snippet: "3. COMPENSATION\n\n3.1 Total Fee: ${{totalAmount}} USD\n\n3.2 Payment Schedule:\n- Deposit ({{depositPercent}}%): ${{depositAmount}} due upon signing\n- Milestone Payment: ${{milestonePayment}} due upon {{milestoneCondition}}\n- Final Payment: ${{finalPayment}} due upon project completion\n\n3.3 Payment Methods:\n- Bank Transfer\n- Credit Card\n- PayPal: {{paypalEmail}}\n\n3.4 Late Payments:\nPayments not received within {{lateDays}} days of the due date will incur a {{latePercent}}% late fee.\n\n"
      },
      { 
        id: "revisions", 
        name: "Revisions & Changes", 
        icon: RefreshCw,
        description: "Revision policy and change requests",
        snippet: "4. REVISIONS & CHANGES\n\n4.1 Included Revisions:\nThis Agreement includes {{revisionCount}} rounds of revisions at no additional cost.\n\n4.2 Additional Revisions:\nRevisions beyond the included amount will be billed at ${{revisionRate}} per hour.\n\n4.3 Change Requests:\nAny changes to the original scope of work must be submitted in writing and may result in additional fees and timeline adjustments. A Change Order will be provided for approval before work begins.\n\n"
      },
      { 
        id: "signature", 
        name: "Signature Block", 
        icon: Pen,
        description: "Final signatures section",
        snippet: "\n---\n\nIN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.\n\nSERVICE PROVIDER:\n\nSignature: _________________________\nPrinted Name: {{providerName}}\nTitle: {{providerTitle}}\nDate: _________________________\n\nCLIENT:\n\nSignature: _________________________\nPrinted Name: {{clientName}}\nTitle: {{clientTitle}}\nDate: _________________________\n"
      },
      { 
        id: "signatureWitness", 
        name: "Signature + Witness", 
        icon: Users,
        description: "Signatures with witness attestation",
        snippet: "\n---\n\nSIGNATURES\n\nIN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.\n\nSERVICE PROVIDER:\n{{providerName}}\n\nSignature: _________________________\nPrinted Name: {{providerSignatory}}\nTitle: {{providerTitle}}\nDate: _________________________\n\nWITNESS:\nSignature: _________________________\nPrinted Name: _________________________\nDate: _________________________\n\n\nCLIENT:\n{{clientName}}\n\nSignature: _________________________\nPrinted Name: {{clientSignatory}}\nTitle: {{clientTitle}}\nDate: _________________________\n\nWITNESS:\nSignature: _________________________\nPrinted Name: _________________________\nDate: _________________________\n"
      },
      { 
        id: "eSignature", 
        name: "Electronic Signature", 
        icon: Zap,
        description: "Digital signature acknowledgment",
        snippet: "\n---\n\nELECTRONIC SIGNATURE ACKNOWLEDGMENT\n\nBy signing below, the parties acknowledge and agree that:\n\n1. This Agreement may be signed electronically.\n2. Electronic signatures are legally binding and have the same effect as handwritten signatures.\n3. Each party has consented to conduct this transaction by electronic means.\n4. Each party has received a copy of this Agreement.\n\nSERVICE PROVIDER:\n{{providerName}}\nElectronic Signature: ☐ I agree to the terms above\nName: {{providerSignatory}}\nTitle: {{providerTitle}}\nDate: {{effectiveDate}}\nIP Address: [Recorded automatically]\n\nCLIENT:\n{{clientName}}\nElectronic Signature: ☐ I agree to the terms above\nName: {{clientSignatory}}\nTitle: {{clientTitle}}\nDate: _________________________\nIP Address: [Recorded automatically]\n"
      },
      { 
        id: "initials", 
        name: "Initials Box", 
        icon: CheckCircle2,
        description: "Section acknowledgment initials",
        snippet: "\n┌─────────────────────────────────────────────────────────────────┐\n│ INITIAL HERE TO ACKNOWLEDGE:                                    │\n│                                                                 │\n│ ☐ I have read and understand the terms of this section         │\n│ ☐ I agree to be bound by the terms stated above                │\n│                                                                 │\n│ Provider Initials: ______    Client Initials: ______           │\n│ Date: __________              Date: __________                  │\n└─────────────────────────────────────────────────────────────────┘\n"
      },
      { 
        id: "notary", 
        name: "Notary Block", 
        icon: Award,
        description: "Notary acknowledgment section",
        snippet: "\n---\n\nNOTARY ACKNOWLEDGMENT\n\nSTATE OF {{state}}\nCOUNTY OF {{county}}\n\nOn this _____ day of _____________, 20____, before me, the undersigned notary public, personally appeared:\n\n☐ {{providerSignatory}}, known to me (or proved to me on the basis of satisfactory evidence) to be the person whose name is subscribed to the within instrument and acknowledged to me that they executed the same in their authorized capacity.\n\n☐ {{clientSignatory}}, known to me (or proved to me on the basis of satisfactory evidence) to be the person whose name is subscribed to the within instrument and acknowledged to me that they executed the same in their authorized capacity.\n\nWITNESS my hand and official seal.\n\n_________________________\nNotary Public\nMy Commission Expires: _________________________\n"
      },
      { 
        id: "paymentAuth", 
        name: "Payment Authorization", 
        icon: CreditCard,
        description: "Client payment authorization",
        snippet: "\n---\n\nPAYMENT AUTHORIZATION\n\nI, {{clientSignatory}}, authorize {{providerName}} to charge the following payment method for services rendered under this Agreement:\n\n☐ Credit Card    ☐ Bank Transfer    ☐ Check    ☐ Other: __________\n\nPayment Amount: ${{totalAmount}}\nPayment Schedule: {{paymentSchedule}}\n\nBilling Address:\n{{billingAddress}}\n\nI understand and agree to the payment terms outlined in this Agreement.\n\nClient Signature: _________________________\nPrinted Name: {{clientSignatory}}\nDate: _________________________\n"
      },
      { 
        id: "acceptance", 
        name: "Acceptance Clause", 
        icon: FileCheck,
        description: "Final acceptance of terms",
        snippet: "\n---\n\nACCEPTANCE OF TERMS\n\nBy signing below, both parties acknowledge that:\n\n1. They have read this Agreement in its entirety\n2. They understand all terms and conditions\n3. They have had the opportunity to seek legal counsel\n4. They agree to be legally bound by this Agreement\n5. They have the authority to enter into this Agreement\n6. This Agreement supersedes all prior negotiations and agreements\n\n☐ Service Provider agrees and accepts\n   Signature: _________________________\n   Date: _________________________\n\n☐ Client agrees and accepts\n   Signature: _________________________\n   Date: _________________________\n"
      },
    ],
    details: [
      { 
        id: "communication", 
        name: "Communication", 
        icon: Mail,
        description: "How parties will communicate",
        snippet: "5. COMMUNICATION\n\n5.1 Primary Contacts:\n- Service Provider: {{providerContact}} ({{providerEmail}})\n- Client: {{clientContact}} ({{clientEmail}})\n\n5.2 Response Times:\nBoth parties agree to respond to communications within {{responseTime}} business days.\n\n5.3 Meetings:\nProgress meetings will be held {{meetingFrequency}} via {{meetingMethod}}.\n\n"
      },
      { 
        id: "materials", 
        name: "Client Materials", 
        icon: FolderOpen,
        description: "What client needs to provide",
        snippet: "6. CLIENT RESPONSIBILITIES\n\n6.1 The Client agrees to provide:\n- {{material1}}\n- {{material2}}\n- {{material3}}\n- Timely feedback and approvals\n- Access to necessary accounts/systems\n\n6.2 Delays:\nDelays caused by Client's failure to provide required materials may result in timeline extensions and additional fees.\n\n"
      },
      { 
        id: "warranty", 
        name: "Warranty", 
        icon: Shield,
        description: "Post-delivery support terms",
        snippet: "7. WARRANTY\n\n7.1 Warranty Period:\nThe Service Provider warrants the deliverables for {{warrantyPeriod}} from the date of final delivery.\n\n7.2 Coverage:\nThis warranty covers:\n- Bug fixes and technical errors\n- Issues caused by Service Provider's work\n\n7.3 Exclusions:\nThis warranty does NOT cover:\n- Issues caused by Client modifications\n- Third-party software or hosting issues\n- Normal wear and updates\n\n"
      },
      { 
        id: "support", 
        name: "Ongoing Support", 
        icon: Handshake,
        description: "Post-project support options",
        snippet: "8. ONGOING SUPPORT (OPTIONAL)\n\n8.1 Support Package:\nAfter the warranty period, the Client may opt for ongoing support:\n\n- Basic Support: ${{basicSupportRate}}/month\n  Includes: {{basicSupportIncludes}}\n\n- Premium Support: ${{premiumSupportRate}}/month\n  Includes: {{premiumSupportIncludes}}\n\n8.2 Support Hours:\nSupport is available {{supportHours}} during {{supportDays}}.\n\n"
      },
    ],
    parties: [
      { 
        id: "clientInfo", 
        name: "Client Information", 
        icon: User,
        description: "Client details section",
        snippet: "CLIENT INFORMATION:\n\nFull Name/Company: {{clientName}}\nAddress: {{clientAddress}}\nCity, State, ZIP: {{clientCity}}, {{clientState}} {{clientZip}}\nPhone: {{clientPhone}}\nEmail: {{clientEmail}}\nWebsite: {{clientWebsite}}\n\n"
      },
      { 
        id: "providerInfo", 
        name: "Provider Information", 
        icon: Building,
        description: "Service provider details",
        snippet: "SERVICE PROVIDER INFORMATION:\n\nBusiness Name: {{providerName}}\nAddress: {{providerAddress}}\nCity, State, ZIP: {{providerCity}}, {{providerState}} {{providerZip}}\nPhone: {{providerPhone}}\nEmail: {{providerEmail}}\nWebsite: {{providerWebsite}}\nTax ID: {{providerTaxId}}\n\n"
      },
      { 
        id: "projectInfo", 
        name: "Project Summary", 
        icon: Target,
        description: "Quick project overview",
        snippet: "PROJECT SUMMARY:\n\nProject Name: {{projectName}}\nProject Type: {{projectType}}\nStart Date: {{startDate}}\nTarget Completion: {{endDate}}\nTotal Investment: ${{totalAmount}}\nDeposit Required: ${{depositAmount}}\n\n"
      },
    ],
  };

  // Legal clauses - expanded
  const legalClauses = [
    {
      id: "confidentiality",
      name: "Confidentiality",
      icon: Lock,
      description: "Protect sensitive information",
      text: "\nCONFIDENTIALITY\n\nBoth parties agree to hold in strict confidence any proprietary information, trade secrets, and business information disclosed during the course of this agreement. This includes but is not limited to:\n- Business strategies and plans\n- Client lists and contact information\n- Pricing and financial information\n- Technical specifications and processes\n\nThis obligation shall survive the termination of this agreement for a period of {{confidentialityYears}} years.\n"
    },
    {
      id: "ip",
      name: "Intellectual Property",
      icon: Award,
      description: "Ownership of created work",
      text: "\nINTELLECTUAL PROPERTY\n\n1. Work Product: Upon full payment, all intellectual property rights to the deliverables created specifically for this project shall transfer to the Client.\n\n2. Pre-existing Materials: The Service Provider retains all rights to pre-existing materials, tools, and frameworks used in the project.\n\n3. Portfolio Rights: The Service Provider retains the right to display the work in their portfolio and marketing materials unless otherwise agreed in writing.\n\n4. Third-Party Materials: Any third-party materials incorporated into the deliverables shall remain subject to their original licenses.\n"
    },
    {
      id: "termination",
      name: "Termination",
      icon: AlertTriangle,
      description: "How to end the agreement",
      text: "\nTERMINATION\n\n1. Termination for Convenience: Either party may terminate this agreement with {{terminationDays}} days written notice.\n\n2. Termination for Cause: Either party may terminate immediately if the other party:\n   - Materially breaches this agreement\n   - Becomes insolvent or files for bankruptcy\n   - Fails to cure a breach within {{cureDays}} days of written notice\n\n3. Effect of Termination:\n   - Client shall pay for all work completed up to the termination date\n   - Deposits paid are non-refundable\n   - Service Provider shall deliver all completed work\n   - Both parties shall return confidential materials\n"
    },
    {
      id: "liability",
      name: "Limitation of Liability",
      icon: Shield,
      description: "Cap on damages",
      text: "\nLIMITATION OF LIABILITY\n\n1. Maximum Liability: The Service Provider's total liability under this agreement shall not exceed the total amount paid by the Client.\n\n2. Exclusions: Neither party shall be liable for:\n   - Indirect, incidental, or consequential damages\n   - Lost profits or business opportunities\n   - Data loss or corruption\n   - Damages arising from Client's misuse of deliverables\n\n3. Time Limit: Any claim must be brought within {{claimYears}} year(s) of the alleged breach.\n"
    },
    {
      id: "force_majeure",
      name: "Force Majeure",
      icon: Zap,
      description: "Unforeseeable circumstances",
      text: "\nFORCE MAJEURE\n\nNeither party shall be liable for delays or failures in performance resulting from circumstances beyond their reasonable control, including but not limited to:\n- Natural disasters (earthquakes, floods, hurricanes)\n- War, terrorism, or civil unrest\n- Government actions or regulations\n- Pandemics or public health emergencies\n- Internet or power outages\n- Labor strikes\n\nThe affected party shall notify the other party promptly and make reasonable efforts to mitigate the impact.\n"
    },
    {
      id: "indemnification",
      name: "Indemnification",
      icon: Shield,
      description: "Protection from third-party claims",
      text: "\nINDEMNIFICATION\n\n1. Client Indemnification: The Client agrees to indemnify and hold harmless the Service Provider from any claims arising from:\n   - Client-provided materials that infringe third-party rights\n   - Client's use of deliverables in violation of applicable laws\n   - Client's modifications to the deliverables\n\n2. Provider Indemnification: The Service Provider agrees to indemnify the Client from claims arising from:\n   - Infringement of third-party intellectual property rights in the original work\n   - Gross negligence or willful misconduct\n"
    },
    {
      id: "dispute",
      name: "Dispute Resolution",
      icon: Scale,
      description: "How to handle disagreements",
      text: "\nDISPUTE RESOLUTION\n\n1. Negotiation: The parties agree to first attempt to resolve any dispute through good-faith negotiation.\n\n2. Mediation: If negotiation fails, the parties agree to submit the dispute to mediation before pursuing other remedies.\n\n3. Arbitration/Litigation: If mediation fails, disputes shall be resolved through {{disputeMethod}} in {{jurisdiction}}.\n\n4. Governing Law: This agreement shall be governed by the laws of {{governingLaw}}.\n\n5. Attorneys' Fees: The prevailing party shall be entitled to recover reasonable attorneys' fees.\n"
    },
    {
      id: "noncompete",
      name: "Non-Compete",
      icon: Lock,
      description: "Competitive restrictions",
      text: "\nNON-COMPETE / NON-SOLICITATION\n\n1. Non-Solicitation: During the term of this agreement and for {{nonSolicitPeriod}} thereafter, neither party shall directly solicit the other party's employees or contractors.\n\n2. Non-Compete (if applicable): {{nonCompeteTerms}}\n\nNote: Non-compete provisions may not be enforceable in all jurisdictions.\n"
    },
    {
      id: "warranty_disclaimer",
      name: "Warranty Disclaimer",
      icon: Shield,
      description: "Limit warranty obligations",
      text: "\nWARRANTY DISCLAIMER\n\nTHE SERVICES AND DELIVERABLES ARE PROVIDED \"AS IS\" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.\n\n1. Limited Warranty: The Service Provider warrants that the deliverables will substantially conform to the agreed specifications for a period of {{warrantyPeriod}} from delivery.\n\n2. Exclusions: This warranty does NOT cover:\n   - Issues caused by Client modifications\n   - Third-party software, plugins, or integrations\n   - Normal wear, updates, or technology changes\n   - Issues arising from Client's misuse\n   - Compatibility with future software versions\n\n3. Remedy: If a defect is found within the warranty period, Service Provider will, at its option:\n   - Repair the defect at no additional cost\n   - Provide a workaround\n   - Refund a proportionate amount of the fee\n\n4. DISCLAIMER: EXCEPT FOR THE LIMITED WARRANTY ABOVE, SERVICE PROVIDER DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.\n"
    },
    {
      id: "refund_policy",
      name: "Refund Policy",
      icon: CreditCard,
      description: "Clear refund terms",
      text: "\nREFUND POLICY\n\n1. Deposit: The deposit of ${{depositAmount}} is non-refundable once work has commenced. It covers initial consultation, planning, and scheduling.\n\n2. Cancellation Refunds:\n   - Before work begins: Full refund minus {{adminFee}} administrative fee\n   - Within first {{refundWindow}}: {{refundPercent}}% refund of amount paid\n   - After {{refundWindow}}: No refund; Client pays for work completed\n\n3. Dissatisfaction:\n   - Client must notify Provider within {{complaintWindow}} of delivery\n   - Provider will attempt to remedy issues within scope\n   - If issues cannot be resolved, parties will negotiate in good faith\n\n4. No Refunds For:\n   - Change of mind after approval\n   - Delays caused by Client\n   - Scope changes requested by Client\n   - Completed and approved deliverables\n\n5. Refund Processing: Approved refunds will be processed within {{refundProcessingDays}} business days via the original payment method.\n"
    },
    {
      id: "cancellation",
      name: "Cancellation Policy",
      icon: AlertTriangle,
      description: "How to cancel the agreement",
      text: "\nCANCELLATION POLICY\n\n1. Cancellation by Client:\n   - More than {{longNotice}} days notice: Deposit refunded minus ${{adminFee}}\n   - {{shortNotice}}-{{longNotice}} days notice: {{partialRefund}}% of deposit refunded\n   - Less than {{shortNotice}} days notice: No refund; full payment required\n\n2. Cancellation by Provider:\n   - Provider may cancel with {{providerNotice}} days notice\n   - Client will receive full refund of unused payments\n   - Provider will deliver all completed work\n\n3. Cancellation for Cause:\n   Either party may cancel immediately if the other party:\n   - Materially breaches this agreement\n   - Fails to pay amounts due within {{paymentGrace}} days\n   - Becomes insolvent or files for bankruptcy\n   - Engages in illegal or unethical conduct\n\n4. Effect of Cancellation:\n   - All work stops immediately\n   - Client pays for work completed to date\n   - Provider delivers all completed materials\n   - Confidentiality obligations survive\n\n5. Rescheduling: Rescheduling is not cancellation. Rescheduling requests are subject to availability and may incur a ${{rescheduleFee}} fee.\n"
    },
    {
      id: "payment_terms",
      name: "Payment Terms",
      icon: DollarSign,
      description: "Detailed payment conditions",
      text: "\nPAYMENT TERMS\n\n1. Accepted Payment Methods:\n   - Credit/Debit Card\n   - Bank Transfer (ACH/Wire)\n   - Check (subject to clearance)\n   - {{otherPaymentMethods}}\n\n2. Payment Schedule:\n   - Deposit: ${{depositAmount}} due upon signing\n   - Progress payments: As outlined in the agreement\n   - Final payment: Due upon completion/delivery\n\n3. Late Payments:\n   - Grace period: {{gracePeriod}} days\n   - Late fee: {{lateFeePercent}}% per month on overdue amounts\n   - Work may be paused after {{pauseAfterDays}} days overdue\n   - Collection costs: Client responsible for all collection costs\n\n4. Disputed Charges:\n   - Client must dispute within {{disputeWindow}} days of invoice\n   - Undisputed portions must still be paid on time\n   - Disputes will be resolved in good faith\n\n5. Currency: All amounts are in {{currency}}.\n\n6. Taxes: Fees do not include applicable taxes. Client is responsible for any sales tax, VAT, or other taxes.\n"
    },
    {
      id: "scope_changes",
      name: "Scope Changes",
      icon: RefreshCw,
      description: "How to handle project changes",
      text: "\nSCOPE CHANGES & CHANGE ORDERS\n\n1. Original Scope: The scope of work is defined in this agreement. Any work outside this scope requires a change order.\n\n2. Change Request Process:\n   a. Client submits written change request\n   b. Provider evaluates impact on timeline and cost\n   c. Provider provides change order with updated terms\n   d. Client approves and signs change order\n   e. Work proceeds on approved changes\n\n3. Impact of Changes:\n   - Additional fees may apply\n   - Timeline may be extended\n   - Original deadlines may no longer apply\n\n4. Minor vs. Major Changes:\n   - Minor changes (under {{minorChangeHours}} hours): May be accommodated within scope\n   - Major changes: Require formal change order\n\n5. Rush Changes: Changes requiring expedited work may incur a {{rushFeePercent}}% rush fee.\n\n6. Change Order Fees: A ${{changeOrderFee}} administrative fee applies to each change order.\n"
    },
    {
      id: "acceptance",
      name: "Acceptance & Approval",
      icon: CheckCircle2,
      description: "Deliverable approval process",
      text: "\nACCEPTANCE & APPROVAL\n\n1. Review Period: Client has {{reviewPeriod}} business days to review each deliverable.\n\n2. Approval Process:\n   - Provider submits deliverable for review\n   - Client reviews and provides feedback\n   - Provider addresses feedback within scope\n   - Client provides written approval or specific revision requests\n\n3. Deemed Acceptance: Deliverables are deemed accepted if:\n   - Client provides written approval, OR\n   - Client fails to respond within {{reviewPeriod}} business days, OR\n   - Client uses the deliverable in production\n\n4. Revision Requests:\n   - Must be specific and actionable\n   - Must be within original scope\n   - Subject to revision limits in this agreement\n\n5. Final Acceptance: Upon final approval:\n   - All deliverables are considered complete\n   - Final payment becomes due\n   - Warranty period begins\n\n6. Rejection: If Client rejects deliverables, Client must provide specific reasons. Provider will have {{remedyPeriod}} days to remedy issues.\n"
    },
    {
      id: "insurance",
      name: "Insurance Requirements",
      icon: Shield,
      description: "Insurance coverage requirements",
      text: "\nINSURANCE\n\n1. Provider Insurance: The Service Provider maintains the following insurance coverage:\n   - General Liability: ${{generalLiability}} per occurrence\n   - Professional Liability/E&O: ${{professionalLiability}} per occurrence\n   - Workers Compensation: As required by law (if applicable)\n\n2. Certificates: Upon request, Provider will furnish certificates of insurance.\n\n3. Client Insurance: Client is responsible for maintaining appropriate insurance for:\n   - Their business operations\n   - Their use of deliverables\n   - Any events or activities\n\n4. Additional Insured: Provider will add Client as additional insured upon written request and payment of any additional premium costs.\n\n5. Claims: Each party shall promptly notify the other of any claims that may affect this agreement.\n"
    },
    {
      id: "data_privacy",
      name: "Data Privacy",
      icon: Lock,
      description: "GDPR & data protection",
      text: "\nDATA PRIVACY & PROTECTION\n\n1. Data Collection: Provider may collect and process:\n   - Contact information\n   - Project-related data\n   - Payment information\n   - Communication records\n\n2. Data Use: Data will only be used for:\n   - Providing services under this agreement\n   - Communication about the project\n   - Legal and accounting purposes\n\n3. Data Protection: Provider will:\n   - Implement reasonable security measures\n   - Not sell or share data with third parties (except as needed for services)\n   - Comply with applicable data protection laws\n\n4. Client Data: If Provider handles Client's customer data:\n   - Provider acts as data processor\n   - Client remains data controller\n   - Data processing agreement available upon request\n\n5. Data Retention: Project data retained for {{dataRetentionPeriod}} after project completion, then securely deleted.\n\n6. Rights: Parties may request access to, correction of, or deletion of their personal data.\n"
    },
  ];

  // Pre-built contract templates
  const contractTemplates = [
    {
      id: "freelance",
      name: "Freelance Services",
      icon: Briefcase,
      description: "General freelance work agreement",
      content: `FREELANCE SERVICES AGREEMENT

This Agreement is entered into as of {{effectiveDate}} between:

SERVICE PROVIDER: {{providerName}}
CLIENT: {{clientName}}

1. SERVICES
The Service Provider agrees to provide: {{serviceDescription}}

2. COMPENSATION
Total Fee: ${{totalAmount}}
Deposit: ${{depositAmount}} (due upon signing)
Balance: Due upon completion

3. TIMELINE
Start Date: {{startDate}}
Completion Date: {{endDate}}

4. REVISIONS
{{revisionCount}} rounds of revisions included.

5. OWNERSHIP
Upon full payment, all rights transfer to the Client.

---

AGREED AND ACCEPTED:

Provider: _________________________ Date: _________
Client: _________________________ Date: _________`
    },
    {
      id: "web",
      name: "Web Development",
      icon: Globe,
      description: "Website/app development contract",
      content: `WEB DEVELOPMENT AGREEMENT

Effective Date: {{effectiveDate}}

PARTIES:
Developer: {{providerName}} ("Developer")
Client: {{clientName}} ("Client")

PROJECT: {{projectName}}

1. SCOPE OF WORK
{{scope}}

2. DELIVERABLES
{{deliverables}}

3. TIMELINE
- Project Start: {{startDate}}
- Design Phase: {{designDate}}
- Development: {{devDate}}
- Testing: {{testDate}}
- Launch: {{endDate}}

4. COMPENSATION
Total Project Cost: ${{totalAmount}}
- 50% Deposit: ${{depositAmount}}
- 25% at Design Approval: ${{designPayment}}
- 25% at Launch: ${{finalPayment}}

5. HOSTING & MAINTENANCE
{{hostingTerms}}

6. REVISIONS
{{revisionCount}} design revisions included.
Additional revisions: ${{revisionRate}}/hour

7. WARRANTY
{{warrantyPeriod}} bug-fix warranty after launch.

---

SIGNATURES:

Developer: _________________________ Date: _________
Client: _________________________ Date: _________`
    },
    {
      id: "consulting",
      name: "Consulting Agreement",
      icon: Handshake,
      description: "Professional consulting services",
      content: `CONSULTING AGREEMENT

This Consulting Agreement ("Agreement") is made effective as of {{effectiveDate}}.

CONSULTANT: {{providerName}}
CLIENT: {{clientName}}

1. ENGAGEMENT
Client engages Consultant to provide professional consulting services as described below.

2. SERVICES
{{serviceDescription}}

3. TERM
This Agreement begins on {{startDate}} and continues until {{endDate}}, unless terminated earlier.

4. COMPENSATION
Hourly Rate: ${{hourlyRate}}/hour
OR
Fixed Fee: ${{totalAmount}}

Payment Terms: {{paymentTerms}}

5. EXPENSES
{{expenseTerms}}

6. INDEPENDENT CONTRACTOR
Consultant is an independent contractor, not an employee.

7. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information.

8. DELIVERABLES
{{deliverables}}

---

AGREED:

Consultant: _________________________ Date: _________
Client: _________________________ Date: _________`
    },
    {
      id: "photography",
      name: "Photography",
      icon: Eye,
      description: "Photo/video shoot agreement",
      content: `PHOTOGRAPHY SERVICES AGREEMENT

This Agreement is entered into as of {{effectiveDate}} between:

PHOTOGRAPHER: {{providerName}}
CLIENT: {{clientName}}

1. EVENT/PROJECT DETAILS
Event Type: {{eventType}}
Date: {{eventDate}}
Location: {{eventLocation}}
Start Time: {{startTime}}
Duration: {{duration}} hours

2. SERVICES
The Photographer agrees to provide:
{{serviceDescription}}

3. DELIVERABLES
- {{deliverableCount}} edited high-resolution digital images
- Online gallery for {{galleryDuration}}
- {{additionalDeliverables}}

Delivery Timeline: {{deliveryTimeline}} after the event

4. COMPENSATION
Total Fee: ${{totalAmount}}
- Deposit (non-refundable): ${{depositAmount}} (due upon signing)
- Balance: Due {{balanceDueDate}}

5. ADDITIONAL SERVICES
- Extra hours: ${{hourlyRate}}/hour
- Additional edits: ${{editRate}} per image
- Rush delivery: ${{rushFee}}
- Prints/Albums: Quoted separately

6. USAGE RIGHTS
The Client receives a personal, non-commercial license to use the images.
The Photographer retains copyright and may use images for portfolio/marketing.

7. CANCELLATION
- More than 30 days notice: Deposit refunded minus ${{adminFee}}
- 14-30 days notice: 50% of deposit forfeited
- Less than 14 days: Full deposit forfeited

8. MODEL RELEASE
The Client grants permission to use images for the Photographer's portfolio.
☐ Yes  ☐ No (check one)

---

AGREED AND ACCEPTED:

Photographer: _________________________ Date: _________
Client: _________________________ Date: _________`
    },
    {
      id: "marketing",
      name: "Marketing Services",
      icon: Target,
      description: "Digital marketing & advertising",
      content: `MARKETING SERVICES AGREEMENT

Effective Date: {{effectiveDate}}

PARTIES:
Marketing Agency: {{providerName}} ("Agency")
Client: {{clientName}} ("Client")

1. SCOPE OF SERVICES
The Agency agrees to provide the following marketing services:

{{serviceDescription}}

Services may include:
☐ Social Media Management
☐ Content Creation
☐ SEO/SEM
☐ Email Marketing
☐ Paid Advertising
☐ Analytics & Reporting

2. CAMPAIGN DETAILS
Campaign Name: {{campaignName}}
Target Audience: {{targetAudience}}
Goals/KPIs: {{campaignGoals}}
Platforms: {{platforms}}

3. TERM
Start Date: {{startDate}}
End Date: {{endDate}}
☐ Month-to-month after initial term

4. COMPENSATION
Monthly Retainer: ${{monthlyFee}}
OR
Project Fee: ${{totalAmount}}

Ad Spend Budget: ${{adBudget}} (managed by Agency)
Management Fee: {{managementFee}}% of ad spend

Payment Terms: {{paymentTerms}}

5. DELIVERABLES
- {{deliverable1}}
- {{deliverable2}}
- {{deliverable3}}
- Monthly performance reports

6. CLIENT RESPONSIBILITIES
- Provide brand assets and guidelines
- Approve content within {{approvalDays}} business days
- Provide access to necessary accounts
- Timely feedback and communication

7. PERFORMANCE METRICS
The Agency will track and report on:
{{metrics}}

8. INTELLECTUAL PROPERTY
Content created specifically for Client belongs to Client upon payment.
Agency retains rights to general strategies and methodologies.

9. CONFIDENTIALITY
Both parties agree to keep marketing strategies and business data confidential.

10. TERMINATION
Either party may terminate with {{noticeDays}} days written notice.
Client pays for all work completed through termination date.

---

AGREED:

Agency: _________________________ Date: _________
Client: _________________________ Date: _________`
    },
    {
      id: "nda",
      name: "NDA",
      icon: Lock,
      description: "Non-Disclosure Agreement",
      content: `NON-DISCLOSURE AGREEMENT (NDA)

Effective Date: {{effectiveDate}}

PARTIES:
Disclosing Party: {{disclosingParty}}
Receiving Party: {{receivingParty}}

RECITALS:
The Disclosing Party possesses certain confidential and proprietary information relating to {{businessPurpose}} and wishes to disclose such information to the Receiving Party for the purpose of {{disclosurePurpose}}.

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" includes, but is not limited to:
- Business plans and strategies
- Financial information and projections
- Customer and client lists
- Product designs and specifications
- Software code and algorithms
- Marketing strategies and data
- Trade secrets and know-how
- Any information marked as "Confidential"

2. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees to:
a) Hold all Confidential Information in strict confidence
b) Not disclose Confidential Information to any third party without prior written consent
c) Use Confidential Information only for the stated purpose
d) Protect Confidential Information with the same degree of care used for its own confidential information
e) Limit access to employees/contractors with a need to know

3. EXCLUSIONS
This Agreement does not apply to information that:
a) Is or becomes publicly available through no fault of the Receiving Party
b) Was already known to the Receiving Party before disclosure
c) Is independently developed without use of Confidential Information
d) Is disclosed with written permission of the Disclosing Party
e) Is required to be disclosed by law or court order

4. TERM
This Agreement shall remain in effect for {{termYears}} years from the Effective Date.
The confidentiality obligations shall survive for {{survivalYears}} years after termination.

5. RETURN OF INFORMATION
Upon request or termination, the Receiving Party shall:
- Return or destroy all Confidential Information
- Provide written certification of destruction if requested

6. NO LICENSE
Nothing in this Agreement grants any rights or licenses to any patents, copyrights, or other intellectual property.

7. REMEDIES
The Receiving Party acknowledges that breach may cause irreparable harm, and the Disclosing Party shall be entitled to seek injunctive relief in addition to other remedies.

8. GOVERNING LAW
This Agreement shall be governed by the laws of {{jurisdiction}}.

9. ENTIRE AGREEMENT
This Agreement constitutes the entire understanding between the parties regarding confidentiality.

---

AGREED AND ACCEPTED:

Disclosing Party: _________________________ Date: _________
Print Name: {{disclosingPartyName}}

Receiving Party: _________________________ Date: _________
Print Name: {{receivingPartyName}}`
    },
    {
      id: "retainer",
      name: "Retainer Agreement",
      icon: RefreshCw,
      description: "Ongoing monthly services",
      content: `RETAINER AGREEMENT

Effective Date: {{effectiveDate}}

PARTIES:
Service Provider: {{providerName}} ("Provider")
Client: {{clientName}} ("Client")

1. RETAINER SERVICES
The Provider agrees to provide ongoing {{serviceType}} services on a retainer basis.

Services Include:
{{serviceDescription}}

2. RETAINER STRUCTURE

☐ HOURS-BASED RETAINER
Monthly Hours: {{monthlyHours}} hours
Hourly Rate: ${{hourlyRate}}/hour
Monthly Fee: ${{monthlyFee}}

Unused hours: {{unusedHoursPolicy}}
Overage rate: ${{overageRate}}/hour

☐ VALUE-BASED RETAINER
Monthly Fee: ${{monthlyFee}}
Includes: {{includedServices}}

3. TERM
Initial Term: {{initialTerm}} months
Start Date: {{startDate}}
Renewal: Auto-renews monthly unless cancelled with {{noticeDays}} days notice

4. PAYMENT TERMS
- Retainer fee due on the {{dueDay}} of each month
- Payment method: {{paymentMethod}}
- Late payment fee: {{lateFee}}

5. SCOPE OF WORK
In Scope:
- {{inScope1}}
- {{inScope2}}
- {{inScope3}}

Out of Scope (billed separately):
- {{outOfScope1}}
- {{outOfScope2}}

6. COMMUNICATION & AVAILABILITY
- Response time: Within {{responseTime}} business hours
- Available: {{availabilityHours}}
- Primary contact method: {{contactMethod}}
- Monthly check-in calls: {{checkInFrequency}}

7. REPORTING
The Provider will deliver:
- {{reportType}} reports {{reportFrequency}}
- Hours tracking (if applicable)
- Project status updates

8. PRIORITY ACCESS
Retainer clients receive:
- Priority scheduling over non-retainer work
- {{priorityBenefit}}

9. INTELLECTUAL PROPERTY
Work product created under this retainer belongs to the Client upon payment.

10. CONFIDENTIALITY
Both parties agree to maintain confidentiality of business information.

11. TERMINATION
- Either party may terminate with {{noticeDays}} days written notice
- Client pays for all work completed through termination
- No refund for partial months unless otherwise agreed

12. RATE ADJUSTMENTS
Provider may adjust rates with {{rateNoticeDays}} days written notice.
Client may terminate if new rates are not acceptable.

---

AGREED AND ACCEPTED:

Provider: _________________________ Date: _________
Client: _________________________ Date: _________`
    },
    {
      id: "design",
      name: "Graphic Design",
      icon: Pen,
      description: "Logo, branding & design work",
      content: `GRAPHIC DESIGN AGREEMENT

This Agreement is entered into as of {{effectiveDate}} between:

DESIGNER: {{providerName}}
CLIENT: {{clientName}}

1. PROJECT DESCRIPTION
{{projectDescription}}

2. DELIVERABLES
The Designer will provide:
- {{deliverable1}}
- {{deliverable2}}
- {{deliverable3}}

File Formats: {{fileFormats}}

3. TIMELINE
- Concept Presentation: {{conceptDate}}
- Revisions Complete: {{revisionDate}}
- Final Delivery: {{endDate}}

4. COMPENSATION
Design Fee: ${{totalAmount}}
- Deposit (50%): ${{depositAmount}} due upon signing
- Balance (50%): Due upon final approval

5. REVISIONS
{{revisionCount}} rounds of revisions included.
Additional revisions: ${{revisionRate}} per round

6. USAGE RIGHTS
Upon full payment, Client receives:
☐ Exclusive rights (full ownership)
☐ Non-exclusive rights (Designer may resell)
☐ Limited use license for: {{usageLimitations}}

7. SOURCE FILES
☐ Source files included
☐ Source files available for additional ${{sourceFileFee}}

8. CREDIT
Designer may display work in portfolio unless otherwise agreed.

9. CANCELLATION
- Before concept presentation: Full deposit refunded minus ${{adminFee}}
- After concept presentation: Deposit non-refundable
- After revisions begin: Full payment required

---

AGREED:

Designer: _________________________ Date: _________
Client: _________________________ Date: _________`
    },
    {
      id: "construction",
      name: "Construction/Renovation",
      icon: Building,
      description: "Home improvement & construction",
      content: `CONSTRUCTION/RENOVATION AGREEMENT

Date: {{effectiveDate}}

CONTRACTOR: {{providerName}}
License #: {{licenseNumber}}
CLIENT: {{clientName}}

PROJECT ADDRESS: {{projectAddress}}

1. SCOPE OF WORK
{{scopeOfWork}}

2. MATERIALS
- Materials provided by: ☐ Contractor ☐ Client ☐ Both
- Material specifications: {{materialSpecs}}
- Material allowance: ${{materialAllowance}}

3. PROJECT TIMELINE
- Start Date: {{startDate}}
- Estimated Completion: {{endDate}}
- Working Hours: {{workingHours}}

4. COMPENSATION
Total Contract Price: ${{totalAmount}}

Payment Schedule:
- Deposit: ${{depositAmount}} ({{depositPercent}}%) due upon signing
- Progress Payment 1: ${{progress1}} at {{milestone1}}
- Progress Payment 2: ${{progress2}} at {{milestone2}}
- Final Payment: ${{finalPayment}} upon completion

5. CHANGE ORDERS
Any changes to the scope must be in writing and signed by both parties.
Change orders may affect timeline and cost.

6. PERMITS & INSPECTIONS
☐ Contractor responsible for permits
☐ Client responsible for permits
Permit costs: {{permitCosts}}

7. INSURANCE & LIABILITY
Contractor maintains:
- General Liability: ${{liabilityAmount}}
- Workers Compensation: As required by law

8. WARRANTY
Contractor warrants workmanship for {{warrantyPeriod}} from completion.
Manufacturer warranties apply to materials.

9. CLEANUP
Contractor will remove debris and leave work area broom clean.

10. DISPUTE RESOLUTION
Disputes will be resolved through {{disputeMethod}} in {{jurisdiction}}.

---

AGREED:

Contractor: _________________________ Date: _________
Client: _________________________ Date: _________`
    },
    {
      id: "subcontractor",
      name: "Subcontractor Agreement",
      icon: Handshake,
      description: "Hiring help for your projects",
      content: `SUBCONTRACTOR AGREEMENT

Effective Date: {{effectiveDate}}

CONTRACTOR: {{contractorName}} ("Contractor")
SUBCONTRACTOR: {{subcontractorName}} ("Subcontractor")

1. PROJECT DETAILS
Client Project: {{projectName}}
Client: {{clientName}}

2. SCOPE OF SUBCONTRACTED WORK
{{subcontractedWork}}

3. TIMELINE
- Start Date: {{startDate}}
- Deadline: {{endDate}}
- Milestones: {{milestones}}

4. COMPENSATION
☐ Fixed Fee: ${{fixedFee}}
☐ Hourly Rate: ${{hourlyRate}}/hour (estimated {{estimatedHours}} hours)
☐ Per deliverable: {{perDeliverableRate}}

Payment Terms: {{paymentTerms}}

5. RELATIONSHIP
Subcontractor is an independent contractor, NOT an employee.
Subcontractor is responsible for own taxes, insurance, and equipment.

6. CONFIDENTIALITY
Subcontractor agrees to:
- Keep all project information confidential
- Not contact the Client directly unless authorized
- Not disclose Contractor's business information

7. WORK PRODUCT
All work product belongs to Contractor (and ultimately to Client).
Subcontractor waives all rights to the deliverables.

8. NON-SOLICITATION
Subcontractor agrees not to:
- Solicit the Client for {{nonSolicitPeriod}} after project completion
- Hire Contractor's other subcontractors for {{nonHirePeriod}}

9. QUALITY STANDARDS
Work must meet the following standards:
{{qualityStandards}}

10. REVISIONS
{{revisionCount}} rounds of revisions included in the fee.
Additional revisions: ${{revisionRate}}

11. COMMUNICATION
- Report to: {{reportTo}}
- Check-ins: {{checkInFrequency}}
- Primary contact method: {{contactMethod}}

12. TERMINATION
Either party may terminate with {{noticeDays}} days notice.
Subcontractor will be paid for completed work.

---

AGREED:

Contractor: _________________________ Date: _________
Subcontractor: _________________________ Date: _________`
    },
    {
      id: "social_media",
      name: "Social Media Management",
      icon: Globe,
      description: "Social media & content creation",
      content: `SOCIAL MEDIA MANAGEMENT AGREEMENT

Effective Date: {{effectiveDate}}

SOCIAL MEDIA MANAGER: {{providerName}} ("Manager")
CLIENT: {{clientName}} ("Client")

1. PLATFORMS
Manager will manage the following accounts:
☐ Instagram: @{{instagramHandle}}
☐ Facebook: {{facebookPage}}
☐ Twitter/X: @{{twitterHandle}}
☐ LinkedIn: {{linkedinPage}}
☐ TikTok: @{{tiktokHandle}}
☐ Other: {{otherPlatforms}}

2. SERVICES
Monthly deliverables:
- {{postsPerWeek}} posts per week ({{postsPerMonth}} total)
- {{storiesPerWeek}} stories per week
- Community management: {{communityManagement}}
- Analytics reports: {{reportFrequency}}

Content types:
{{contentTypes}}

3. CONTENT CALENDAR
- Content submitted for approval by: {{approvalDeadline}}
- Client approval required within: {{approvalWindow}} hours
- Posting schedule: {{postingSchedule}}

4. COMPENSATION
Monthly Retainer: ${{monthlyFee}}
Due on the {{dueDay}} of each month

Additional services:
- Extra posts: ${{extraPostRate}} each
- Paid ad management: {{adManagementFee}}% of ad spend
- Influencer outreach: ${{influencerRate}}/campaign

5. CONTENT OWNERSHIP
- Content created belongs to Client
- Manager may use for portfolio with permission

6. ACCOUNT ACCESS
Client will provide secure access to all accounts.
Manager will not share credentials with third parties.

7. BRAND GUIDELINES
Manager will follow Client's brand voice and guidelines.
Client will provide: {{brandMaterials}}

8. TERM & TERMINATION
- Initial term: {{initialTerm}} months
- Renewal: Month-to-month after initial term
- Termination: {{noticeDays}} days written notice

9. EXCLUSIVITY
☐ Exclusive (Manager won't work with competitors)
☐ Non-exclusive

---

AGREED:

Manager: _________________________ Date: _________
Client: _________________________ Date: _________`
    },
    {
      id: "event_planning",
      name: "Event Planning",
      icon: Calendar,
      description: "Weddings, parties & corporate events",
      content: `EVENT PLANNING AGREEMENT

Date: {{effectiveDate}}

EVENT PLANNER: {{providerName}}
CLIENT: {{clientName}}

1. EVENT DETAILS
Event Type: {{eventType}}
Event Date: {{eventDate}}
Event Time: {{eventTime}}
Venue: {{venueName}}
Address: {{venueAddress}}
Expected Guests: {{guestCount}}

2. SERVICES
The Planner will provide:
{{planningServices}}

☐ Full Planning
☐ Partial Planning
☐ Day-of Coordination
☐ Vendor Management
☐ Design & Decor

3. TIMELINE
- Initial consultation: {{consultDate}}
- Vendor selection complete: {{vendorDate}}
- Final walkthrough: {{walkthroughDate}}
- Event day: {{eventDate}}

4. COMPENSATION
Planning Fee: ${{totalAmount}}

Payment Schedule:
- Retainer: ${{depositAmount}} due upon signing
- Second payment: ${{payment2}} due {{payment2Date}}
- Final payment: ${{finalPayment}} due {{finalPaymentDate}}

5. VENDOR MANAGEMENT
- Planner will coordinate with vendors
- Client responsible for vendor payments unless otherwise agreed
- Vendor budget: ${{vendorBudget}}

6. CANCELLATION & REFUNDS
- 90+ days before event: {{refund90Days}}% refund
- 60-89 days: {{refund60Days}}% refund
- 30-59 days: {{refund30Days}}% refund
- Less than 30 days: No refund

Rescheduling: {{reschedulingPolicy}}

7. FORCE MAJEURE
If event cannot occur due to circumstances beyond control, parties will work together to reschedule or adjust services.

8. LIABILITY
Planner is not responsible for vendor performance or venue issues.
Planner carries liability insurance of ${{liabilityInsurance}}.

---

AGREED:

Planner: _________________________ Date: _________
Client: _________________________ Date: _________`
    },
    {
      id: "coaching",
      name: "Coaching/Training",
      icon: Award,
      description: "Life coaching, business coaching, training",
      content: `COACHING/TRAINING AGREEMENT

Effective Date: {{effectiveDate}}

COACH/TRAINER: {{providerName}} ("Coach")
CLIENT: {{clientName}} ("Client")

1. COACHING PROGRAM
Program Name: {{programName}}
Duration: {{programDuration}}
Focus Areas: {{focusAreas}}

2. SESSION DETAILS
- Number of sessions: {{sessionCount}}
- Session length: {{sessionLength}}
- Frequency: {{sessionFrequency}}
- Format: ☐ In-person ☐ Video call ☐ Phone ☐ Hybrid

3. SCHEDULE
Sessions will be scheduled: {{schedulingMethod}}
Cancellation policy: {{cancellationNotice}} hours notice required

4. INVESTMENT
Program Fee: ${{totalAmount}}

Payment Options:
☐ Pay in full: ${{payInFull}} (save ${{discount}})
☐ Payment plan: {{paymentPlanDetails}}

5. WHAT'S INCLUDED
{{includedItems}}

6. CLIENT RESPONSIBILITIES
Client agrees to:
- Attend sessions on time
- Complete assigned exercises
- Be open and honest
- Take responsibility for own progress

7. COACH RESPONSIBILITIES
Coach agrees to:
- Prepare for each session
- Provide tools and resources
- Maintain confidentiality
- Support Client's goals

8. CONFIDENTIALITY
All session content is strictly confidential.
Coach will not share Client information without consent.

9. RESULTS DISCLAIMER
Coaching is not therapy or medical advice.
Results depend on Client's effort and implementation.
No specific outcomes are guaranteed.

10. TERMINATION
- Client may terminate with {{noticeDays}} days notice
- Unused sessions: {{unusedSessionPolicy}}

---

AGREED:

Coach: _________________________ Date: _________
Client: _________________________ Date: _________`
    },
  ];

  // Legal term definitions for tooltips
  const legalTermDefinitions: Record<string, { term: string; definition: string; example?: string }> = {
    "indemnification": {
      term: "Indemnification",
      definition: "A contractual obligation where one party agrees to compensate the other for certain damages or losses. It protects against third-party claims.",
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
      example: "Limiting liability to the total contract value means you can't be sued for more than what you were paid."
    },
    "intellectual property": {
      term: "Intellectual Property (IP)",
      definition: "Legal rights to creations of the mind including designs, code, artwork, and written content. Defines who owns the work product.",
      example: "Specifies whether the client owns the final work, or if you retain rights to reuse components."
    },
    "confidentiality": {
      term: "Confidentiality / NDA",
      definition: "An agreement to keep certain information private and not share it with third parties.",
      example: "Client's business strategies, pricing, customer lists, or trade secrets must be kept secret."
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
    "milestone": {
      term: "Milestone",
      definition: "A significant point or event in the project timeline, often tied to payments or deliverables.",
      example: "50% payment due upon design approval, 50% upon final delivery."
    },
    "retainer": {
      term: "Retainer",
      definition: "A fee paid in advance to secure services for a specified period, often monthly.",
      example: "Client pays $2,000/month for up to 20 hours of support and updates."
    },
    "warranty": {
      term: "Warranty",
      definition: "A guarantee that the work will be free from defects and function as intended for a specified period.",
      example: "30-day warranty covering bug fixes for issues caused by the developer's code."
    },
    "non-compete": {
      term: "Non-Compete",
      definition: "A clause preventing one party from working with competitors for a specified time after the contract ends.",
      example: "Contractor agrees not to work for direct competitors for 6 months after project completion."
    },
    "non-solicitation": {
      term: "Non-Solicitation",
      definition: "A clause preventing one party from recruiting or hiring the other party's employees or contractors.",
      example: "Client agrees not to hire the freelancer's team members directly for 1 year."
    },
  };

  // Contract checklist items with quick-insert snippets
  const contractChecklist = [
    { 
      id: "parties", 
      label: "Parties Identified", 
      description: "Client and provider names/details included", 
      keywords: ["client", "provider", "contractor", "company", "name"],
      quickInsert: "PARTIES\n\nThis Agreement is made between:\n\nSERVICE PROVIDER:\nName: {{providerName}}\nEmail: {{providerEmail}}\nAddress: {{providerAddress}}\n\nCLIENT:\nName: {{clientName}}\nEmail: {{clientEmail}}\nAddress: {{clientAddress}}\n\n"
    },
    { 
      id: "scope", 
      label: "Scope of Work", 
      description: "Clear description of what will be delivered", 
      keywords: ["scope", "services", "work", "deliverables", "description"],
      quickInsert: "SCOPE OF WORK\n\nThe Service Provider agrees to perform the following services:\n\n{{serviceDescription}}\n\nDELIVERABLES:\n- {{deliverable1}}\n- {{deliverable2}}\n- {{deliverable3}}\n\nOUT OF SCOPE:\nThe following items are NOT included in this agreement:\n- {{outOfScope1}}\n- {{outOfScope2}}\n\n"
    },
    { 
      id: "timeline", 
      label: "Timeline & Deadlines", 
      description: "Start date, end date, milestones defined", 
      keywords: ["date", "timeline", "deadline", "milestone", "start", "end", "delivery"],
      quickInsert: "TIMELINE\n\nProject Start Date: {{startDate}}\nEstimated Completion: {{endDate}}\n\nMILESTONES:\n1. {{milestone1}} - Due: {{milestone1Date}}\n2. {{milestone2}} - Due: {{milestone2Date}}\n3. Final Delivery - Due: {{endDate}}\n\nNote: Delays caused by client feedback or approvals may extend the timeline.\n\n"
    },
    { 
      id: "payment", 
      label: "Payment Terms", 
      description: "Total amount, deposit, payment schedule", 
      keywords: ["payment", "amount", "deposit", "fee", "rate", "price", "compensation"],
      quickInsert: "PAYMENT TERMS\n\nTotal Project Fee: ${{totalAmount}}\n\nPayment Schedule:\n- Deposit (50%): ${{depositAmount}} - Due upon signing\n- Final Payment (50%): ${{finalAmount}} - Due upon completion\n\nPayment Methods: Credit Card, Bank Transfer, Check\nLate Payment Fee: {{lateFee}}% per month on overdue amounts\n\nWork will not begin until deposit is received.\n\n"
    },
    { 
      id: "revisions", 
      label: "Revision Policy", 
      description: "Number of revisions included, additional revision costs", 
      keywords: ["revision", "changes", "modifications", "rounds"],
      quickInsert: "REVISIONS\n\n{{revisionCount}} rounds of revisions are included in the project fee.\n\nAdditional revisions beyond this will be billed at ${{revisionRate}} per hour.\n\nRevision requests must be:\n- Submitted in writing\n- Clear and specific\n- Within the original project scope\n\nMajor changes to scope may require a separate change order.\n\n"
    },
    { 
      id: "ownership", 
      label: "Ownership/IP Rights", 
      description: "Who owns the final work product", 
      keywords: ["ownership", "intellectual property", "rights", "ip", "copyright"],
      quickInsert: "INTELLECTUAL PROPERTY & OWNERSHIP\n\nUpon FULL PAYMENT:\n- All deliverables become the property of the Client\n- Client receives full ownership and usage rights\n- Service Provider retains the right to display work in portfolio\n\nBefore full payment:\n- All work remains the property of Service Provider\n- Client may not use, publish, or distribute any deliverables\n\nPre-existing materials, templates, and tools remain property of Service Provider.\n\n"
    },
    { 
      id: "confidentiality", 
      label: "Confidentiality", 
      description: "Protection of sensitive information", 
      keywords: ["confidential", "nda", "secret", "private", "proprietary"],
      quickInsert: "CONFIDENTIALITY\n\nBoth parties agree to keep confidential:\n- Business strategies and plans\n- Financial information\n- Customer/client lists\n- Trade secrets and proprietary methods\n- Any information marked as confidential\n\nThis obligation continues for {{confidentialityPeriod}} years after the end of this agreement.\n\nExceptions: Information that is publicly available or legally required to be disclosed.\n\n"
    },
    { 
      id: "termination", 
      label: "Termination Clause", 
      description: "How either party can end the agreement", 
      keywords: ["termination", "cancel", "end", "terminate"],
      quickInsert: "TERMINATION\n\nEither party may terminate this agreement:\n\n1. WITH NOTICE: {{noticePeriod}} days written notice\n2. FOR CAUSE: Immediately if the other party breaches this agreement\n\nUpon termination:\n- Client pays for all work completed to date\n- Service Provider delivers all completed work\n- Deposit is non-refundable\n- Confidentiality obligations survive termination\n\n"
    },
    { 
      id: "liability", 
      label: "Liability Limits", 
      description: "Cap on damages and exclusions", 
      keywords: ["liability", "damages", "limitation", "responsible"],
      quickInsert: "LIMITATION OF LIABILITY\n\nService Provider's total liability shall not exceed the total amount paid under this agreement.\n\nNeither party shall be liable for:\n- Indirect, incidental, or consequential damages\n- Lost profits or business opportunities\n- Damages arising from circumstances beyond reasonable control\n\nClient is responsible for:\n- Accuracy of information provided\n- Backup of their own data\n- Compliance with applicable laws\n\n"
    },
    { 
      id: "signatures", 
      label: "Signature Block", 
      description: "Space for both parties to sign", 
      keywords: ["signature", "sign", "agreed", "accepted", "date"],
      quickInsert: "\n---\n\nAGREED AND ACCEPTED\n\nBy signing below, both parties agree to the terms and conditions of this agreement.\n\nSERVICE PROVIDER:\n\nSignature: _________________________\n\nPrinted Name: {{providerName}}\n\nDate: _________________________\n\n\nCLIENT:\n\nSignature: _________________________\n\nPrinted Name: {{clientName}}\n\nDate: _________________________\n"
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
    
    const reorderedCount = sections.length - (isAlreadyOrdered ? 0 : sections.length);
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

  // Common misspellings to check
  const commonMisspellings: Record<string, string> = {
    "recieve": "receive",
    "seperate": "separate",
    "occured": "occurred",
    "occurence": "occurrence",
    "accomodate": "accommodate",
    "definately": "definitely",
    "occassion": "occasion",
    "neccessary": "necessary",
    "acheive": "achieve",
    "beleive": "believe",
    "calender": "calendar",
    "commitee": "committee",
    "concensus": "consensus",
    "definite": "definite",
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
    "millenium": "millennium",
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

  // Check for unfilled placeholders
  const getUnfilledPlaceholders = () => {
    const placeholderRegex = /\{\{(\w+)\}\}/g;
    const unfilled: string[] = [];
    let match;
    while ((match = placeholderRegex.exec(content)) !== null) {
      const fieldId = match[1];
      if (!fieldValues[fieldId] || fieldValues[fieldId].trim() === "") {
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
    const lowerContent = content.toLowerCase();
    
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
    score -= unfilledCount * 5; // Deduct 5 points per unfilled field
    score -= spellingCount * 3; // Deduct 3 points per spelling error
    
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

  const addQuickField = (field: typeof quickFields[0]) => {
    // Check if field already exists
    if (customFields.find(f => f.id === field.id)) {
      toast({
        title: "Field already exists",
        description: `${field.label} is already in your fields.`,
        variant: "destructive",
      });
      return;
    }
    
    const newField = {
      id: field.id,
      label: field.label,
      type: field.type,
      placeholder: `Enter ${field.label.toLowerCase()}`,
      required: false,
    };
    
    setCustomFields([...customFields, newField]);
    
    // Insert placeholder - works for both modes
    const placeholder = `{{${field.id}}}`;
    if (editorMode === "markdown" && contentRef.current) {
      const start = contentRef.current.selectionStart;
      const end = contentRef.current.selectionEnd;
      const newContent = content.substring(0, start) + placeholder + content.substring(end);
      setContent(newContent);
    } else {
      // For rich text mode, append at end
      setContent(content + placeholder);
    }
    
    toast({
      title: "Field added",
      description: `{{${field.id}}} inserted and field created.`,
    });
  };

  const removeField = (fieldId: string) => {
    setCustomFields(customFields.filter(f => f.id !== fieldId));
    const newValues = { ...fieldValues };
    delete newValues[fieldId];
    setFieldValues(newValues);
  };

  const insertSnippet = (snippet: string) => {
    // For rich text mode, convert plain text snippet to HTML-friendly format
    const formattedSnippet = editorMode === "rich" 
      ? snippet.replace(/\n/g, '<br>').replace(/\n\n/g, '</p><p>')
      : snippet;
    
    if (editorMode === "markdown" && contentRef.current) {
      const start = contentRef.current.selectionStart;
      const end = contentRef.current.selectionEnd;
      const newContent = content.substring(0, start) + snippet + content.substring(end);
      setContent(newContent);
    } else {
      // For rich text mode, append at the end (the editor handles cursor position internally)
      setContent(content + formattedSnippet);
    }
    
    // Extract field placeholders from snippet and add them as fields
    const placeholderRegex = /\{\{(\w+)\}\}/g;
    let match;
    const newFields: typeof customFields = [];
    while ((match = placeholderRegex.exec(snippet)) !== null) {
      const fieldId = match[1];
      if (!customFields.find(f => f.id === fieldId) && !newFields.find(f => f.id === fieldId)) {
        // Find matching quick field for better type detection
        const quickField = quickFields.find(qf => qf.id === fieldId);
        newFields.push({
          id: fieldId,
          label: quickField?.label || fieldId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
          type: quickField?.type || (fieldId.toLowerCase().includes("date") ? "date" : fieldId.toLowerCase().includes("amount") || fieldId.toLowerCase().includes("rate") || fieldId.toLowerCase().includes("payment") ? "number" : fieldId.toLowerCase().includes("description") || fieldId.toLowerCase().includes("scope") || fieldId.toLowerCase().includes("address") ? "textarea" : "text"),
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
    setShowSnippets(false);
  };

  const loadTemplate = (template: typeof contractTemplates[0]) => {
    setTitle(template.name + " Contract");
    setContent(template.content);
    
    // Extract and add all fields from template
    const placeholderRegex = /\{\{(\w+)\}\}/g;
    let match;
    const newFields: typeof customFields = [];
    while ((match = placeholderRegex.exec(template.content)) !== null) {
      const fieldId = match[1];
      if (!newFields.find(f => f.id === fieldId)) {
        const quickField = quickFields.find(qf => qf.id === fieldId);
        newFields.push({
          id: fieldId,
          label: quickField?.label || fieldId.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
          type: quickField?.type || (fieldId.toLowerCase().includes("date") ? "date" : fieldId.toLowerCase().includes("amount") || fieldId.toLowerCase().includes("rate") || fieldId.toLowerCase().includes("payment") ? "number" : fieldId.toLowerCase().includes("description") || fieldId.toLowerCase().includes("scope") || fieldId.toLowerCase().includes("terms") ? "textarea" : "text"),
          placeholder: `Enter ${fieldId.replace(/_/g, " ")}`,
          required: false,
        });
      }
    }
    setCustomFields(newFields);
    setShowTemplates(false);
    
    toast({
      title: "Template loaded",
      description: `${template.name} template with ${newFields.length} fields ready to customize.`,
    });
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
    customFields.forEach((field) => {
      const value = fieldValues[field.id] || `[${field.label}]`;
      const regex = new RegExp(`\\{\\{${field.id}\\}\\}`, "gi");
      previewContent = previewContent.replace(regex, value);
    });
    return previewContent;
  };

  return (
    <div className="space-y-6">
      {/* Contract Builder Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-purple-400" />
            Contract Builder
          </h2>
          <p className="text-slate-400 mt-1">Build your contract from scratch with custom fields</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowTemplates(!showTemplates); setShowSnippets(false); setShowLegalClauses(false); setShowQuickFields(false); }}
            className={`border-slate-600 ${showTemplates ? "bg-green-600 text-white border-green-500" : "text-slate-300 hover:bg-slate-700"}`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowSnippets(!showSnippets); setShowTemplates(false); setShowLegalClauses(false); setShowQuickFields(false); }}
            className={`border-slate-600 ${showSnippets ? "bg-indigo-600 text-white border-indigo-500" : "text-slate-300 hover:bg-slate-700"}`}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Sections
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowQuickFields(!showQuickFields); setShowTemplates(false); setShowSnippets(false); setShowLegalClauses(false); }}
            className={`border-slate-600 ${showQuickFields ? "bg-cyan-600 text-white border-cyan-500" : "text-slate-300 hover:bg-slate-700"}`}
          >
            <Zap className="h-4 w-4 mr-2" />
            Quick Fields
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowLegalClauses(!showLegalClauses); setShowTemplates(false); setShowSnippets(false); setShowQuickFields(false); }}
            className={`border-slate-600 ${showLegalClauses ? "bg-purple-600 text-white border-purple-500" : "text-slate-300 hover:bg-slate-700"}`}
          >
            <Shield className="h-4 w-4 mr-2" />
            Legal
          </Button>
          <div className="h-6 w-px bg-slate-600 mx-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveDraftToLocalStorage(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-green-500 hover:text-green-400"
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowBranding(!showBranding); setShowPdfPreview(false); }}
            className={`border-slate-600 ${showBranding ? "bg-pink-600 text-white border-pink-500" : "text-slate-300 hover:bg-slate-700"}`}
          >
            <Building className="h-4 w-4 mr-2" />
            Branding
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowPdfPreview(!showPdfPreview); setShowBranding(false); }}
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

      {/* Branding Panel - Enhanced */}
      {showBranding && (
        <Card className="border-2 border-pink-500/30 bg-slate-800/95 animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-pink-400" />
                <span className="text-sm font-semibold text-slate-300">Company Branding</span>
                <span className="text-[10px] text-slate-500 bg-slate-700 px-2 py-0.5 rounded">Customize your contract look</span>
              </div>
              <Button size="sm" onClick={saveBranding} className="bg-pink-600 hover:bg-pink-700 text-white">
                <FileCheck className="h-3.5 w-3.5 mr-1" />
                Save Branding
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Column 1: Logo */}
              <div className="space-y-3 p-3 rounded-lg bg-slate-700/20 border border-slate-700">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <Upload className="h-4 w-4 text-pink-400" />
                  Logo
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full h-20 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-500/5 transition-all"
                >
                  {branding.logo ? (
                    <img src={branding.logo} alt="Logo" className="max-h-16 max-w-full object-contain" style={{ opacity: branding.logoOpacity / 100 }} />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-5 w-5 text-slate-500 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-500">Upload logo</span>
                    </div>
                  )}
                </div>
                
                {branding.logo && (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Position</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {(["header", "watermark", "footer", "corner"] as const).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => setBranding({ ...branding, logoPosition: pos })}
                            className={`py-1 px-2 rounded text-[10px] transition-colors ${
                              branding.logoPosition === pos
                                ? "bg-pink-600 text-white"
                                : "bg-slate-700 text-slate-400 hover:text-white"
                            }`}
                          >
                            {pos.charAt(0).toUpperCase() + pos.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Size</span>
                        <span>{branding.logoSize}</span>
                      </div>
                      <div className="flex gap-1">
                        {(["small", "medium", "large"] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => setBranding({ ...branding, logoSize: size })}
                            className={`flex-1 py-1 rounded text-[10px] transition-colors ${
                              branding.logoSize === size
                                ? "bg-pink-600 text-white"
                                : "bg-slate-700 text-slate-400 hover:text-white"
                            }`}
                          >
                            {size.charAt(0).toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Opacity</span>
                        <span>{branding.logoOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={branding.logoOpacity}
                        onChange={(e) => setBranding({ ...branding, logoOpacity: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setBranding({ ...branding, logo: "" })}
                      className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </>
                )}
                
                <label className="flex items-center gap-2 text-[10px] text-slate-400">
                  <input
                    type="checkbox"
                    checked={branding.showLogo}
                    onChange={(e) => setBranding({ ...branding, showLogo: e.target.checked })}
                    className="rounded border-slate-600 h-3 w-3"
                  />
                  Show logo on contract
                </label>
              </div>

              {/* Column 2: Company & Colors */}
              <div className="space-y-3 p-3 rounded-lg bg-slate-700/20 border border-slate-700">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <Type className="h-4 w-4 text-purple-400" />
                  Company
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-400">Company Name</Label>
                  <Input
                    value={branding.companyName}
                    onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                    placeholder="Your Company"
                    className="bg-slate-700/50 border-slate-600 text-white text-sm h-8"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-400">Show Name In</Label>
                  <div className="flex gap-1">
                    {(["header", "footer", "both"] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setBranding({ ...branding, companyNamePosition: pos })}
                        className={`flex-1 py-1 rounded text-[10px] transition-colors ${
                          branding.companyNamePosition === pos
                            ? "bg-purple-600 text-white"
                            : "bg-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        {pos.charAt(0).toUpperCase() + pos.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Primary</Label>
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer border border-slate-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Secondary</Label>
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer border border-slate-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Accent</Label>
                    <input
                      type="color"
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer border border-slate-600"
                    />
                  </div>
                </div>
                
                <label className="flex items-center gap-2 text-[10px] text-slate-400">
                  <input
                    type="checkbox"
                    checked={branding.showCompanyName}
                    onChange={(e) => setBranding({ ...branding, showCompanyName: e.target.checked })}
                    className="rounded border-slate-600 h-3 w-3"
                  />
                  Show company name
                </label>
              </div>

              {/* Column 3: Typography & Layout */}
              <div className="space-y-3 p-3 rounded-lg bg-slate-700/20 border border-slate-700">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <AlignLeft className="h-4 w-4 text-blue-400" />
                  Layout
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-400">Font</Label>
                  <select
                    value={branding.fontFamily}
                    onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })}
                    className="w-full h-8 rounded-md border border-slate-600 bg-slate-700/50 px-2 text-xs text-white"
                  >
                    <option value="Georgia, serif">Georgia</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="Calibri, sans-serif">Calibri</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Helvetica Neue', sans-serif">Helvetica</option>
                    <option value="'Courier New', monospace">Courier</option>
                    <option value="'Garamond', serif">Garamond</option>
                    <option value="'Palatino', serif">Palatino</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-400">Font Size</Label>
                  <div className="flex gap-1">
                    {(["small", "normal", "large"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setBranding({ ...branding, fontSize: size })}
                        className={`flex-1 py-1 rounded text-[10px] transition-colors ${
                          branding.fontSize === size
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-400">Header Align</Label>
                  <div className="flex gap-1">
                    {(["left", "centered", "right"] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => setBranding({ ...branding, headerStyle: align })}
                        className={`flex-1 py-1 rounded text-[10px] transition-colors ${
                          branding.headerStyle === align
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        {align === "centered" ? "Center" : align.charAt(0).toUpperCase() + align.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-400">Border</Label>
                  <div className="flex gap-1">
                    {(["none", "solid", "double", "dashed"] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setBranding({ ...branding, borderStyle: style, showBorder: style !== "none" })}
                        className={`flex-1 py-1 rounded text-[10px] transition-colors ${
                          branding.borderStyle === style
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        {style.charAt(0).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] text-slate-400">Paper Style</Label>
                  <div className="flex gap-1">
                    {(["clean", "lined", "subtle"] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setBranding({ ...branding, paperStyle: style })}
                        className={`flex-1 py-1 rounded text-[10px] transition-colors ${
                          branding.paperStyle === style
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 4: Watermark & Footer */}
              <div className="space-y-3 p-3 rounded-lg bg-slate-700/20 border border-slate-700">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <Eye className="h-4 w-4 text-green-400" />
                  Extras
                </div>
                
                {/* Watermark */}
                <div className="space-y-1.5 p-2 rounded bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-slate-400">Watermark</Label>
                    <input
                      type="checkbox"
                      checked={branding.showWatermark}
                      onChange={(e) => setBranding({ ...branding, showWatermark: e.target.checked })}
                      className="rounded border-slate-600 h-3 w-3"
                    />
                  </div>
                  {branding.showWatermark && (
                    <>
                      <Input
                        value={branding.watermarkText}
                        onChange={(e) => setBranding({ ...branding, watermarkText: e.target.value })}
                        placeholder="DRAFT, CONFIDENTIAL..."
                        className="bg-slate-700/50 border-slate-600 text-white text-xs h-7"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Opacity</span>
                        <span>{branding.watermarkOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={branding.watermarkOpacity}
                        onChange={(e) => setBranding({ ...branding, watermarkOpacity: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                    </>
                  )}
                </div>
                
                {/* Footer */}
                <div className="space-y-1.5 p-2 rounded bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-slate-400">Footer</Label>
                    <input
                      type="checkbox"
                      checked={branding.showFooter}
                      onChange={(e) => setBranding({ ...branding, showFooter: e.target.checked })}
                      className="rounded border-slate-600 h-3 w-3"
                    />
                  </div>
                  {branding.showFooter && (
                    <>
                      <Input
                        value={branding.footerText}
                        onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                        placeholder="Custom footer text..."
                        className="bg-slate-700/50 border-slate-600 text-white text-xs h-7"
                      />
                      <label className="flex items-center gap-2 text-[10px] text-slate-400">
                        <input
                          type="checkbox"
                          checked={branding.showPageNumbers}
                          onChange={(e) => setBranding({ ...branding, showPageNumbers: e.target.checked })}
                          className="rounded border-slate-600 h-3 w-3"
                        />
                        Show page numbers
                      </label>
                    </>
                  )}
                </div>
                
                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-slate-400">Quick Presets</Label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => setBranding({
                        ...branding,
                        primaryColor: "#1e40af",
                        secondaryColor: "#3b82f6",
                        accentColor: "#60a5fa",
                        fontFamily: "'Times New Roman', serif",
                        paperStyle: "clean",
                      })}
                      className="py-1.5 px-2 rounded text-[10px] bg-blue-900/50 text-blue-300 hover:bg-blue-900 transition-colors border border-blue-800"
                    >
                      🏢 Corporate
                    </button>
                    <button
                      onClick={() => setBranding({
                        ...branding,
                        primaryColor: "#059669",
                        secondaryColor: "#10b981",
                        accentColor: "#34d399",
                        fontFamily: "Calibri, sans-serif",
                        paperStyle: "clean",
                      })}
                      className="py-1.5 px-2 rounded text-[10px] bg-green-900/50 text-green-300 hover:bg-green-900 transition-colors border border-green-800"
                    >
                      🌿 Modern
                    </button>
                    <button
                      onClick={() => setBranding({
                        ...branding,
                        primaryColor: "#7c3aed",
                        secondaryColor: "#8b5cf6",
                        accentColor: "#a78bfa",
                        fontFamily: "'Helvetica Neue', sans-serif",
                        paperStyle: "subtle",
                      })}
                      className="py-1.5 px-2 rounded text-[10px] bg-purple-900/50 text-purple-300 hover:bg-purple-900 transition-colors border border-purple-800"
                    >
                      ✨ Creative
                    </button>
                    <button
                      onClick={() => setBranding({
                        ...branding,
                        primaryColor: "#374151",
                        secondaryColor: "#6b7280",
                        accentColor: "#9ca3af",
                        fontFamily: "Georgia, serif",
                        paperStyle: "lined",
                      })}
                      className="py-1.5 px-2 rounded text-[10px] bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-600"
                    >
                      📜 Classic
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Preview Strip */}
            <div className="mt-4 p-3 rounded-lg border border-slate-700 bg-white/5">
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Live Preview:</span>
                <div 
                  className="flex-1 p-2 rounded"
                  style={{ 
                    backgroundColor: branding.backgroundColor,
                    borderLeft: branding.showBorder ? `4px ${branding.borderStyle} ${branding.primaryColor}` : "none",
                    fontFamily: branding.fontFamily,
                  }}
                >
                  <div className="flex items-center gap-2" style={{ justifyContent: branding.headerStyle === "centered" ? "center" : branding.headerStyle === "right" ? "flex-end" : "flex-start" }}>
                    {branding.logo && branding.showLogo && (
                      <img 
                        src={branding.logo} 
                        alt="Logo" 
                        className="object-contain"
                        style={{ 
                          height: branding.logoSize === "small" ? 20 : branding.logoSize === "large" ? 40 : 30,
                          opacity: branding.logoOpacity / 100 
                        }} 
                      />
                    )}
                    {branding.showCompanyName && branding.companyName && (
                      <span style={{ color: branding.secondaryColor, fontSize: branding.fontSize === "small" ? 10 : branding.fontSize === "large" ? 14 : 12 }}>
                        {branding.companyName}
                      </span>
                    )}
                  </div>
                  <div style={{ color: branding.primaryColor, fontSize: branding.fontSize === "small" ? 12 : branding.fontSize === "large" ? 18 : 14, fontWeight: "bold", textAlign: branding.headerStyle === "centered" ? "center" : branding.headerStyle }}>
                    Contract Title
                  </div>
                  {branding.showWatermark && branding.watermarkText && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span style={{ color: branding.primaryColor, opacity: branding.watermarkOpacity / 100, fontSize: 24, transform: "rotate(-30deg)" }}>
                        {branding.watermarkText}
                      </span>
                    </div>
                  )}
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
                <span className="text-xs text-slate-500">See exactly how your contract will look when exported</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={exportAsPDF} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Printer className="h-4 w-4 mr-2" />
                  Print / Save PDF
                </Button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden" style={{ maxHeight: "600px" }}>
              <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
                <div 
                  className="p-8"
                  style={{ fontFamily: branding.fontFamily }}
                >
                  {/* Header */}
                  <div 
                    className="mb-6 pb-4"
                    style={{ 
                      textAlign: branding.headerStyle === "centered" ? "center" : branding.headerStyle,
                      borderBottom: `3px solid ${branding.primaryColor}`
                    }}
                  >
                    {branding.showLogo && branding.logo && (
                      <img 
                        src={branding.logo} 
                        alt="Logo" 
                        className="mb-2"
                        style={{ 
                          maxHeight: "60px", 
                          maxWidth: "150px",
                          margin: branding.headerStyle === "centered" ? "0 auto" : undefined
                        }} 
                      />
                    )}
                    {branding.showCompanyName && branding.companyName && (
                      <div 
                        className="text-xs font-semibold uppercase tracking-wider mb-4"
                        style={{ color: branding.secondaryColor }}
                      >
                        {branding.companyName}
                      </div>
                    )}
                  </div>
                  
                  {/* Title */}
                  <h1 
                    className="text-2xl font-bold mb-6"
                    style={{ 
                      color: branding.primaryColor,
                      textAlign: branding.headerStyle === "centered" ? "center" : branding.headerStyle
                    }}
                  >
                    {title || "Contract Agreement"}
                  </h1>
                  
                  {/* Content */}
                  <div className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                    {getPreviewContent() || "Start typing to see preview..."}
                  </div>
                  
                  {/* Footer */}
                  {branding.companyName && (
                    <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
                      © {new Date().getFullYear()} {branding.companyName}. All rights reserved.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Draft Status Bar */}
      {(lastSaved || (title.trim() || content.trim())) && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${lastSaved ? "bg-green-500" : "bg-amber-500"} animate-pulse`} />
            <span className="text-sm text-slate-400">
              {lastSaved 
                ? `Draft saved ${lastSaved.toLocaleString()}`
                : "Unsaved changes"
              }
            </span>
            {draftId && (
              <span className="text-xs text-slate-600 font-mono">
                ID: {draftId.slice(-8)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => saveDraftToLocalStorage(false)}
              className="text-slate-400 hover:text-green-400 hover:bg-green-500/10"
            >
              <FileCheck className="h-4 w-4 mr-1" />
              Save Now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDraft}
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Draft
            </Button>
          </div>
        </div>
      )}

      {/* Contract Templates */}
      {showTemplates && (
        <Card className="border-2 border-green-500/30 bg-slate-800/95 animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-green-400" />
              <span className="text-sm font-semibold text-slate-300">Start with a Template</span>
              <span className="text-xs text-slate-500 ml-auto">Click to load template</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {contractTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  className="text-left p-4 rounded-lg border border-slate-700 bg-slate-700/50 hover:border-green-500 hover:bg-green-500/10 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                      <template.icon className="h-5 w-5 text-green-400 group-hover:text-green-300" />
                    </div>
                    <div>
                      <div className="font-semibold text-white group-hover:text-green-100">{template.name}</div>
                      <div className="text-xs text-slate-400">{template.description}</div>
                    </div>
                  </div>
                </button>
              ))}
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
              <span className="text-sm font-semibold text-slate-300">Contract Sections</span>
              <div className="flex gap-1 ml-auto">
                {(["sections", "details", "parties"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveSnippetCategory(cat)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      activeSnippetCategory === cat 
                        ? "bg-indigo-600 text-white" 
                        : "bg-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {contractSnippets[activeSnippetCategory].map((snippet) => (
                <button
                  key={snippet.id}
                  onClick={() => insertSnippet(snippet.snippet)}
                  className="text-left p-3 rounded-lg border border-slate-700 bg-slate-700/50 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <snippet.icon className="h-4 w-4 text-indigo-400 group-hover:text-indigo-300" />
                    <span className="text-sm font-medium text-white group-hover:text-indigo-100">{snippet.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 group-hover:text-slate-400">{snippet.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Fields */}
      {showQuickFields && (
        <Card className="border-2 border-cyan-500/30 bg-slate-800/95 animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-semibold text-slate-300">Quick Insert Fields</span>
              <span className="text-xs text-slate-500 ml-auto">Click to add field and insert placeholder</span>
            </div>
            <div className="space-y-3">
              {/* Group fields by category */}
              {(["parties", "project", "dates", "payment", "terms", "legal"] as const).map((category) => {
                const categoryFields = quickFields.filter(f => f.category === category);
                if (categoryFields.length === 0) return null;
                return (
                  <div key={category}>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                      {category === "parties" ? "👥 Parties" : 
                       category === "project" ? "📋 Project" : 
                       category === "dates" ? "📅 Dates" : 
                       category === "payment" ? "💰 Payment" : 
                       category === "terms" ? "📝 Terms" : "⚖️ Legal"}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categoryFields.map((field) => {
                        const isAdded = customFields.some(f => f.id === field.id);
                        return (
                          <button
                            key={field.id}
                            onClick={() => addQuickField(field)}
                            disabled={isAdded}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                              isAdded 
                                ? "border-green-600/50 bg-green-600/10 text-green-400 cursor-not-allowed" 
                                : "border-slate-700 bg-slate-700/50 text-slate-300 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-white"
                            }`}
                          >
                            <field.icon className="h-3.5 w-3.5" />
                            {field.label}
                            {isAdded && <CheckCircle2 className="h-3 w-3 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {legalClauses.map((clause) => (
                <button
                  key={clause.id}
                  onClick={() => {
                    insertSnippet(clause.text);
                    setShowLegalClauses(false);
                    toast({ title: "Clause added", description: `${clause.name} added to contract.` });
                  }}
                  className="text-left p-3 rounded-lg border border-slate-700 bg-slate-700/50 hover:border-purple-500 hover:bg-purple-500/10 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <clause.icon className="h-4 w-4 text-purple-400 group-hover:text-purple-300" />
                    <span className="text-sm font-medium text-white group-hover:text-purple-100">{clause.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 group-hover:text-slate-400">{clause.description}</p>
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
              <div className="space-y-4">
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
                
                {/* Contract Type Selector */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Contract Type</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setContractType("contract");
                        setData({ ...data, contractType: "contract" });
                      }}
                      className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        contractType === "contract"
                          ? "border-indigo-500 bg-indigo-600/20 text-white"
                          : "border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-semibold text-sm">Standard Contract</div>
                        <div className="text-xs opacity-80">Client pays you</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setContractType("proposal");
                        setData({ ...data, contractType: "proposal" });
                      }}
                      className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        contractType === "proposal"
                          ? "border-indigo-500 bg-indigo-600/20 text-white"
                          : "border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <Handshake className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-semibold text-sm">Proposal</div>
                        <div className="text-xs opacity-80">You offer to pay client</div>
                      </div>
                    </button>
                  </div>
                  {contractType === "proposal" && (
                    <p className="text-xs text-indigo-300 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      This is a proposal where you're offering compensation to the client
                    </p>
                  )}
                </div>
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

                          {/* Editor Mode */}
                          <div className="p-2 rounded-lg bg-slate-700/30 border border-slate-600">
                            <div className="flex items-center gap-2 mb-2">
                              <Code className="h-4 w-4 text-slate-400" />
                              <span className="text-xs font-semibold text-slate-300">Editor</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditorMode(editorMode === "rich" ? "markdown" : "rich");
                                setShowToolsMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-600"
                            >
                              {editorMode === "rich" ? (
                                <>
                                  <Code className="h-3.5 w-3.5" />
                                  <span>Switch to Markdown</span>
                                </>
                              ) : (
                                <>
                                  <Type className="h-3.5 w-3.5" />
                                  <span>Switch to Rich Text</span>
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
                                  setShowQuickFields(false);
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
                                  setShowQuickFields(false);
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
                                  setShowQuickFields(!showQuickFields);
                                  setShowTemplates(false);
                                  setShowSnippets(false);
                                  setShowLegalClauses(false);
                                  setShowToolsMenu(false);
                                }}
                                className={`px-2 py-1.5 rounded-md text-xs transition-colors border ${
                                  showQuickFields
                                    ? "bg-cyan-600/30 border-cyan-500/50 text-cyan-300"
                                    : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                }`}
                              >
                                <Zap className="h-3 w-3 inline mr-1" />
                                Fields
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowLegalClauses(!showLegalClauses);
                                  setShowTemplates(false);
                                  setShowSnippets(false);
                                  setShowQuickFields(false);
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
                    <span className="text-xs text-slate-500">
                      {content.replace(/<[^>]*>/g, '').length} characters
                    </span>
                  </div>
                </div>
                
                {editorMode === "rich" ? (
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Start typing your contract content, or use Quick Insert to add sections..."
                    minHeight="400px"
                    showMarkdownHint={true}
                  />
                ) : (
                  <Textarea
                    ref={contentRef}
                    id="content"
                    className="bg-slate-700/50 border-slate-600 text-white min-h-[400px] font-mono text-sm"
                    value={content.replace(/<[^>]*>/g, '')}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start typing your contract content in Markdown format..."
                    required
                  />
                )}
                <p className="text-xs text-slate-500">
                  Use {"{{fieldName}}"} syntax to insert dynamic fields. Add fields in the sidebar, then copy their placeholder.
                </p>
              </div>
            </CardContent>
          </Card>

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
                  Drag sections or use arrows to reorder your contract
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
                        <Label htmlFor="paymentTermsScratch" className="text-slate-400 text-sm">
                          Payment Terms & Legal Clauses
                        </Label>
                        <Textarea
                          id="paymentTermsScratch"
                          className="bg-slate-700/50 border-slate-600 text-white min-h-[100px]"
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          placeholder="E.g., Net 30 days, payment due upon completion, late fees of 1.5% per month, payment schedule, refund policy, etc."
                        />
                        <p className="text-xs text-slate-500">
                          Specify payment terms, schedules, penalties, late fees, refund policies, and other legal payment-related clauses. These will be included in the contract.
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
              onClick={() => {
                // Save custom fields to data for later use
                const updatedData = { ...data, customFields };
                setData(updatedData);
                onSubmit(fieldValues, {
                  hasCompensation,
                  compensationType,
                  paymentTerms: hasCompensation ? paymentTerms : undefined,
                });
              }}
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
                          value={fieldValues[field.id] || ""}
                          onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                      ) : field.type === "date" ? (
                        <Input
                          type="date"
                          className="bg-slate-700/50 border-slate-600 text-white text-sm focus:border-indigo-500"
                          value={fieldValues[field.id] || ""}
                          onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                        />
                      ) : field.type === "number" ? (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                          <Input
                            type="number"
                            className="bg-slate-700/50 border-slate-600 text-white text-sm pl-7 focus:border-indigo-500"
                            value={fieldValues[field.id] || ""}
                            onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                            placeholder="0.00"
                          />
                        </div>
                      ) : (
                        <Input
                          type="text"
                          className="bg-slate-700/50 border-slate-600 text-white text-sm focus:border-indigo-500"
                          value={fieldValues[field.id] || ""}
                          onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
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
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.doc,.docx,.html,.htm"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border-2 border-dashed border-slate-600 bg-slate-700/30 hover:border-amber-500 hover:bg-amber-500/10 transition-all text-slate-300 hover:text-white"
                      >
                        {importing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileUp className="h-4 w-4 text-amber-400" />
                        )}
                        <span className="text-xs font-medium">
                          {importing ? "Importing..." : "Upload File"}
                        </span>
                      </button>
                      <p className="text-[10px] text-slate-500 text-center">
                        .txt, .doc, .docx, .html
                      </p>
                    </div>

                    {/* Export Section */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                        <Download className="h-3.5 w-3.5" />
                        Export
                      </h4>
                      <div className="grid grid-cols-4 gap-1">
                        <button
                          onClick={exportAsPDF}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-700 bg-slate-700/50 hover:border-red-500 hover:bg-red-500/10 transition-all group"
                        >
                          <Printer className="h-4 w-4 text-red-400 group-hover:text-red-300" />
                          <span className="text-[10px] text-slate-300 group-hover:text-white">PDF</span>
                        </button>
                        <button
                          onClick={exportAsWord}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-700 bg-slate-700/50 hover:border-blue-500 hover:bg-blue-500/10 transition-all group"
                        >
                          <FileType className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />
                          <span className="text-[10px] text-slate-300 group-hover:text-white">Word</span>
                        </button>
                        <button
                          onClick={exportAsText}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-700 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-500/10 transition-all group"
                        >
                          <FileType2 className="h-4 w-4 text-slate-400 group-hover:text-slate-300" />
                          <span className="text-[10px] text-slate-300 group-hover:text-white">Text</span>
                        </button>
                        <button
                          onClick={copyToClipboard}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-700 bg-slate-700/50 hover:border-green-500 hover:bg-green-500/10 transition-all group"
                        >
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
                            <Input
                              id="emailTo"
                              type="email"
                              placeholder="client@example.com"
                              value={emailTo}
                              onChange={(e) => setEmailTo(e.target.value)}
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emailSubject" className="text-slate-300">Subject (optional)</Label>
                            <Input
                              id="emailSubject"
                              type="text"
                              placeholder={`Contract: ${title || "Agreement"}`}
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emailMessage" className="text-slate-300">Message (optional)</Label>
                            <Textarea
                              id="emailMessage"
                              placeholder="Hi, please find the contract attached..."
                              value={emailMessage}
                              onChange={(e) => setEmailMessage(e.target.value)}
                              className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowEmailDialog(false)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={sendEmail}
                            disabled={sendingEmail || !emailTo.trim()}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                          >
                            {sendingEmail ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Send Email
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
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

                {/* Contract Checklist - Click to add missing sections! */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm font-medium text-slate-300">Essential Sections</span>
                    <span className="text-[10px] text-slate-500 ml-auto">Click missing to add</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
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
        </div>
      </div>
    </div>
  );
}

function Step4SetAmounts({
  depositAmount,
  totalAmount,
  contractType = "contract",
  onSubmit,
  onBack,
}: {
  depositAmount: string;
  totalAmount: string;
  contractType?: "contract" | "proposal";
  onSubmit: (deposit: string, total: string) => void;
  onBack: () => void;
}) {
  const [deposit, setDeposit] = useState(depositAmount);
  const [total, setTotal] = useState(totalAmount);
  const isProposal = contractType === "proposal";

  return (
    <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-indigo-400" />
          {isProposal ? "Set Compensation Amounts" : "Set Payment Amounts"}
        </CardTitle>
        <CardDescription className="text-slate-400 mt-1">
          {isProposal 
            ? "Enter the compensation you're offering to the client"
            : "Enter deposit and total contract amounts"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {isProposal && (
          <div className="p-4 bg-indigo-900/20 border border-indigo-700/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Handshake className="h-5 w-5 text-indigo-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">Proposal Contract</p>
                <p className="text-xs text-slate-300">
                  You are offering compensation to the client. This is a proposal where you will pay them, not the other way around.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="deposit" className="text-slate-300">
            {isProposal ? "Initial Payment Amount ($)" : "Deposit Amount ($)"}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <Input
              id="deposit"
              type="number"
              step="0.01"
              min="0"
              className="bg-slate-700/50 border-slate-600 text-white pl-8"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-slate-500">
            {isProposal 
              ? "Optional: Initial payment amount you'll pay upfront"
              : "Optional: Amount required upfront before work begins"}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="total" className="text-slate-300">
            {isProposal ? "Total Compensation Amount ($)" : "Total Amount ($)"} <span className="text-red-400">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <Input
              id="total"
              type="number"
              step="0.01"
              min="0"
              className="bg-slate-700/50 border-slate-600 text-white pl-8"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <p className="text-xs text-slate-500">
            {isProposal 
              ? "Total compensation you're offering to pay"
              : "Total contract value"}
          </p>
        </div>
        {parseFloat(deposit) > 0 && parseFloat(total) > 0 && (
          <div className="p-4 bg-indigo-900/20 border border-indigo-700/50 rounded-lg">
            <p className="text-sm text-slate-300">
              <span className="font-semibold">Remaining after deposit:</span>{" "}
              ${(parseFloat(total) - parseFloat(deposit)).toFixed(2)}
            </p>
          </div>
        )}
        {parseFloat(deposit) > parseFloat(total) && parseFloat(total) > 0 && (
          <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
            <p className="text-sm text-red-300">
              Deposit cannot exceed total amount
            </p>
          </div>
        )}
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
            onClick={() => onSubmit(deposit, total)}
            disabled={!total || parseFloat(total) < 0 || parseFloat(deposit) > parseFloat(total)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            Continue
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Step6Styling({
  data,
  branding,
  setBranding,
  onSubmit,
  onBack,
}: {
  data: ContractData;
  branding: any;
  setBranding: (branding: any) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const [subscriptionTier, setSubscriptionTier] = useState<"free" | "starter" | "pro" | "premium">("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch subscription tier
    fetch("/api/account")
      .then(res => res.json())
      .then(result => {
        if (result.company) {
          setSubscriptionTier(result.company.subscriptionTier || "free");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const hasCustomBranding = subscriptionTier === "pro" || subscriptionTier === "premium";
  const hasBasicStyling = subscriptionTier === "starter" || hasCustomBranding;

  // Complete style presets with all settings - one click applies everything
  const tierPresets = {
    free: [
      { 
        name: "Standard", 
        icon: "🏢",
        colors: { primary: "#1e40af", secondary: "#3b82f6", accent: "#60a5fa" }, 
        font: "Georgia, serif",
        headerStyle: "centered" as const,
        borderStyle: "solid" as const,
      },
    ],
    starter: [
      { 
        name: "Corporate", 
        icon: "🏢",
        colors: { primary: "#1e40af", secondary: "#3b82f6", accent: "#60a5fa" }, 
        font: "'Times New Roman', serif",
        headerStyle: "centered" as const,
        borderStyle: "solid" as const,
      },
      { 
        name: "Modern", 
        icon: "✨",
        colors: { primary: "#059669", secondary: "#10b981", accent: "#34d399" }, 
        font: "Calibri, sans-serif",
        headerStyle: "left" as const,
        borderStyle: "solid" as const,
      },
      { 
        name: "Classic", 
        icon: "📜",
        colors: { primary: "#374151", secondary: "#6b7280", accent: "#9ca3af" }, 
        font: "Georgia, serif",
        headerStyle: "centered" as const,
        borderStyle: "double" as const,
      },
    ],
    pro: [
      { 
        name: "Corporate", 
        icon: "🏢",
        colors: { primary: "#1e40af", secondary: "#3b82f6", accent: "#60a5fa" }, 
        font: "'Times New Roman', serif",
        headerStyle: "centered" as const,
        borderStyle: "solid" as const,
      },
      { 
        name: "Modern", 
        icon: "✨",
        colors: { primary: "#059669", secondary: "#10b981", accent: "#34d399" }, 
        font: "Calibri, sans-serif",
        headerStyle: "left" as const,
        borderStyle: "solid" as const,
      },
      { 
        name: "Creative", 
        icon: "🎨",
        colors: { primary: "#7c3aed", secondary: "#8b5cf6", accent: "#a78bfa" }, 
        font: "'Helvetica Neue', sans-serif",
        headerStyle: "centered" as const,
        borderStyle: "dashed" as const,
      },
      { 
        name: "Classic", 
        icon: "📜",
        colors: { primary: "#374151", secondary: "#6b7280", accent: "#9ca3af" }, 
        font: "Georgia, serif",
        headerStyle: "centered" as const,
        borderStyle: "double" as const,
      },
    ],
    premium: [
      { 
        name: "Corporate", 
        icon: "🏢",
        colors: { primary: "#1e40af", secondary: "#3b82f6", accent: "#60a5fa" }, 
        font: "'Times New Roman', serif",
        headerStyle: "centered" as const,
        borderStyle: "solid" as const,
      },
      { 
        name: "Modern", 
        icon: "✨",
        colors: { primary: "#059669", secondary: "#10b981", accent: "#34d399" }, 
        font: "Calibri, sans-serif",
        headerStyle: "left" as const,
        borderStyle: "solid" as const,
      },
      { 
        name: "Creative", 
        icon: "🎨",
        colors: { primary: "#7c3aed", secondary: "#8b5cf6", accent: "#a78bfa" }, 
        font: "'Helvetica Neue', sans-serif",
        headerStyle: "centered" as const,
        borderStyle: "dashed" as const,
      },
      { 
        name: "Classic", 
        icon: "📜",
        colors: { primary: "#374151", secondary: "#6b7280", accent: "#9ca3af" }, 
        font: "Georgia, serif",
        headerStyle: "centered" as const,
        borderStyle: "double" as const,
      },
      { 
        name: "Luxury", 
        icon: "💎",
        colors: { primary: "#92400e", secondary: "#d97706", accent: "#f59e0b" }, 
        font: "Georgia, serif",
        headerStyle: "centered" as const,
        borderStyle: "double" as const,
      },
    ],
  };

  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const applyPreset = (preset: any, index: number) => {
    setSelectedPreset(index);
    setBranding({
      ...branding,
      primaryColor: preset.colors.primary,
      secondaryColor: preset.colors.secondary,
      accentColor: preset.colors.accent || preset.colors.secondary,
      fontFamily: preset.font,
      headerStyle: preset.headerStyle,
      borderStyle: preset.borderStyle,
      showBorder: preset.borderStyle !== "none",
    });
  };

  if (loading) {
    return (
      <Card className="border-2 border-slate-700">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-indigo-500/30 bg-slate-800/95">
        <CardHeader className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-b border-slate-700">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <FileType className="h-6 w-6 text-indigo-400" />
            Customize Contract Style
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Choose how your contract will look on paper - colors, fonts, and layout
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Tier Info */}
          <div className={`p-4 rounded-lg border ${
            subscriptionTier === "free" 
              ? "bg-slate-700/30 border-slate-600" 
              : subscriptionTier === "starter"
              ? "bg-blue-900/20 border-blue-700/50"
              : "bg-indigo-900/20 border-indigo-700/50"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  Current Plan: <span className="text-indigo-300 capitalize">{subscriptionTier}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {subscriptionTier === "free" 
                    ? "Upgrade to Starter or Pro for more styling options"
                    : subscriptionTier === "starter"
                    ? "Upgrade to Pro for full custom branding (colors, logos, watermarks)"
                    : "You have access to all styling features"}
                </p>
              </div>
              {subscriptionTier !== "premium" && (
                <Link href="/dashboard/subscription">
                  <Button size="sm" variant="outline" className="border-indigo-600 text-indigo-300 hover:bg-indigo-900/30">
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Style Presets - Large Visual Cards */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Choose Your Style (One Click)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tierPresets[subscriptionTier].map((preset, idx) => {
                const isSelected = selectedPreset === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => applyPreset(preset, idx)}
                    className={`relative p-6 rounded-xl border-2 transition-all group text-left ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-900/20 ring-4 ring-indigo-500/30"
                        : "border-slate-700 bg-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-700/50"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="h-6 w-6 text-indigo-400" />
                      </div>
                    )}
                    
                    {/* Preview Card */}
                    <div 
                      className="mb-4 p-4 rounded-lg border-2 bg-white shadow-lg"
                      style={{ 
                        borderColor: preset.colors.primary,
                        borderStyle: preset.borderStyle,
                        fontFamily: preset.font,
                      }}
                    >
                      <div 
                        className="mb-3 pb-2 border-b-2"
                        style={{ 
                          borderColor: preset.colors.primary,
                          textAlign: preset.headerStyle === "centered" ? "center" : preset.headerStyle,
                        }}
                      >
                        <h4 
                          className="text-lg font-bold mb-1"
                          style={{ color: preset.colors.primary }}
                        >
                          {data.title || "Contract Title"}
                        </h4>
                        <p 
                          className="text-xs"
                          style={{ color: preset.colors.secondary }}
                        >
                          Professional Document
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="h-1 bg-slate-200 rounded"></div>
                        <div className="h-1 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-1 bg-slate-200 rounded w-5/6"></div>
                      </div>
                    </div>

                    {/* Style Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{preset.icon}</span>
                          <p className="text-base font-semibold text-white">
                            {preset.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full border border-slate-600" 
                            style={{ backgroundColor: preset.colors.primary }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full border border-slate-600" 
                            style={{ backgroundColor: preset.colors.secondary }}
                          />
                          {preset.colors.accent && (
                            <div 
                              className="w-3 h-3 rounded-full border border-slate-600" 
                              style={{ backgroundColor: preset.colors.accent }}
                            />
                          )}
                          <span className="text-xs text-slate-400 ml-2" style={{ fontFamily: preset.font }}>
                            {preset.font.split(",")[0].replace(/'/g, "")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Options (Pro+ only) - Collapsible */}
          {hasCustomBranding && (
            <details className="pt-4 border-t border-slate-700">
              <summary className="cursor-pointer text-lg font-semibold text-white flex items-center gap-2 hover:text-indigo-300 transition-colors">
                <Zap className="h-5 w-5 text-indigo-400" />
                Advanced Customization (Optional)
              </summary>
              <div className="space-y-4 mt-4 pt-4 border-t border-slate-700">
              
              {/* Colors */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-slate-300 mb-2 block">Primary Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-12 h-10 rounded border border-slate-600 cursor-pointer"
                    />
                    <Input
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="flex-1 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-slate-300 mb-2 block">Secondary Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-12 h-10 rounded border border-slate-600 cursor-pointer"
                    />
                    <Input
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="flex-1 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-slate-300 mb-2 block">Accent Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="w-12 h-10 rounded border border-slate-600 cursor-pointer"
                    />
                    <Input
                      value={branding.accentColor}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="flex-1 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Font */}
              <div>
                <Label className="text-sm text-slate-300 mb-2 block">Font Family</Label>
                <select
                  value={branding.fontFamily}
                  onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })}
                  className="w-full h-10 rounded border border-slate-600 bg-slate-700/50 px-3 text-white"
                >
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="Calibri, sans-serif">Calibri</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Helvetica Neue', sans-serif">Helvetica Neue</option>
                </select>
              </div>

              {/* Layout */}
              <div>
                <Label className="text-sm text-slate-300 mb-2 block">Header Alignment</Label>
                <div className="flex gap-2">
                  {(["left", "centered", "right"] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => setBranding({ ...branding, headerStyle: align })}
                      className={`flex-1 py-2 rounded text-sm ${
                        branding.headerStyle === align
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {align === "centered" ? "Center" : align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              </div>
            </details>
          )}

          {/* Selected Style Preview */}
          {selectedPreset !== null && (
            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold text-white">Selected Style Preview</Label>
                <Badge variant="outline" className="border-indigo-600 text-indigo-300">
                  Active
                </Badge>
              </div>
              <div 
                className="p-8 rounded-xl border-2 shadow-2xl bg-white"
                style={{ 
                  borderColor: branding.primaryColor,
                  borderStyle: branding.borderStyle,
                  fontFamily: branding.fontFamily,
                }}
              >
                <div 
                  className="mb-6 pb-4 border-b-2"
                  style={{ 
                    borderColor: branding.primaryColor,
                    textAlign: branding.headerStyle === "centered" ? "center" : branding.headerStyle,
                  }}
                >
                  <h2 
                    className="text-2xl font-bold mb-2"
                    style={{ color: branding.primaryColor }}
                  >
                    {data.title || "Contract Title"}
                  </h2>
                  <p 
                    className="text-base"
                    style={{ color: branding.secondaryColor }}
                  >
                    Professional Contract Document
                  </p>
                </div>
                <div className="space-y-3 text-slate-700" style={{ fontFamily: branding.fontFamily }}>
                  <p className="leading-relaxed">
                    This is a preview of how your contract will appear when printed or viewed as a PDF. 
                    All styling including colors, fonts, and layout will be applied automatically.
                  </p>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-500">
                      ✓ Colors applied • ✓ Font selected • ✓ Layout configured
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
          onClick={onSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Continue to Review
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function Step5Preview({
  data,
  setData,
  onSubmit,
  onBack,
  isLoading,
}: {
  data: ContractData;
  setData: (data: ContractData | ((prev: ContractData) => ContractData)) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const client = data.client || data.newClient;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-indigo-400" />
            Review Contract
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Review all details before creating the contract
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-white">Contract Title</h3>
            <p className="text-slate-300">{data.title}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-white">Client</h3>
            <p className="text-slate-300">{client?.name}</p>
            <p className="text-sm text-slate-400">{client?.email}</p>
            {client?.phone && (
              <p className="text-sm text-slate-400">{client.phone}</p>
            )}
          </div>
          {Object.keys(data.fieldValues).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Field Values</h3>
              <div className="space-y-1">
                {Object.entries(data.fieldValues).map(([key, value]) => (
                  <div key={key} className="text-sm text-slate-300">
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <h3 className="font-semibold text-white">
              {data.contractType === "proposal" ? "Compensation Offer" : "Compensation"}
            </h3>
            {data.hasCompensation ? (
              <div className="space-y-2 text-slate-300">
                <div className="p-3 bg-indigo-900/20 border border-indigo-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-indigo-400" />
                    <span className="font-medium">
                      {data.contractType === "proposal" ? "Compensation Structure:" : "Compensation Type:"}
                    </span>
                    <span className="text-indigo-300">
                      {data.compensationType === "fixed_amount" 
                        ? (data.contractType === "proposal" ? "Fixed Offer" : "Fixed Amount") :
                       data.compensationType === "hourly" 
                        ? (data.contractType === "proposal" ? "Hourly Rate Offer" : "Hourly Rate") :
                       data.compensationType === "milestone" 
                        ? (data.contractType === "proposal" ? "Milestone-Based Offer" : "Milestone-Based") :
                       data.compensationType === "other" ? "Other" : "No Compensation"}
                    </span>
                  </div>
                  {parseFloat(data.depositAmount || "0") > 0 && (
                    <div className="text-sm">
                      {data.contractType === "proposal" ? "Initial Payment:" : "Deposit:"} 
                      <span className="font-semibold"> ${parseFloat(data.depositAmount).toFixed(2)}</span>
                    </div>
                  )}
                  {parseFloat(data.totalAmount || "0") > 0 && (
                    <div className="text-sm">
                      {data.contractType === "proposal" ? "Total Compensation:" : "Total:"} 
                      <span className="font-semibold"> ${parseFloat(data.totalAmount).toFixed(2)}</span>
                    </div>
                  )}
                  {data.paymentTerms && (
                    <div className="mt-2 pt-2 border-t border-indigo-700/30">
                      <p className="text-xs text-slate-400 mb-1">
                        {data.contractType === "proposal" ? "Compensation Terms:" : "Payment Terms:"}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{data.paymentTerms}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-700/30 border border-slate-600 rounded-lg">
                <p className="text-sm text-slate-400">
                  {data.contractType === "proposal" 
                    ? "No compensation specified for this proposal" 
                    : "No compensation specified for this contract"}
                </p>
              </div>
            )}
          </div>
          
          {/* Password Protection Section */}
          <div className="space-y-4 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-indigo-400" />
                <div>
                  <Label htmlFor="usePassword" className="text-white font-semibold cursor-pointer">
                    Password Protection
                  </Label>
                  <p className="text-xs text-slate-400 mt-1">
                    Require a password to view and sign this contract
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {data.usePassword ? (
                  <ToggleRight
                    className="h-6 w-6 text-indigo-400 cursor-pointer"
                    onClick={() => setData({ ...data, usePassword: false, password: undefined, confirmPassword: undefined })}
                  />
                ) : (
                  <ToggleLeft
                    className="h-6 w-6 text-slate-500 cursor-pointer"
                    onClick={() => setData({ ...data, usePassword: true, password: "", confirmPassword: "" })}
                  />
                )}
              </div>
            </div>
            
            {data.usePassword && (
              <div className="pl-8 space-y-3 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password (min 4 characters)"
                    value={data.password || ""}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={data.confirmPassword || ""}
                    onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-700">
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
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Contract
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contract Preview */}
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Eye className="h-6 w-6 text-indigo-400" />
            Contract Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-white rounded-lg p-6 shadow-inner max-h-[600px] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{data.title}</h2>
            <div className="prose max-w-none whitespace-pre-wrap text-slate-700">
              {data.content}
            </div>
            {data.hasCompensation && (
              <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">
                  {data.contractType === "proposal" ? "Compensation Offer" : "Payment & Compensation"}
                </h3>
                {(parseFloat(data.depositAmount) > 0 || parseFloat(data.totalAmount) > 0) && (
                  <>
                    {parseFloat(data.depositAmount) > 0 && (
                      <p className="text-sm text-slate-700 mb-1">
                        {data.contractType === "proposal" ? "Initial Payment:" : "Deposit:"} ${parseFloat(data.depositAmount).toFixed(2)}
                      </p>
                    )}
                    {parseFloat(data.totalAmount) > 0 && (
                      <p className="text-sm text-slate-700 mb-2">
                        {data.contractType === "proposal" ? "Total Compensation:" : "Total Amount:"} ${parseFloat(data.totalAmount).toFixed(2)}
                      </p>
                    )}
                  </>
                )}
                {data.paymentTerms && (
                  <div className="mt-2 pt-2 border-t border-slate-300">
                    <p className="text-xs font-medium text-slate-600 mb-1">
                      {data.contractType === "proposal" ? "Compensation Terms:" : "Additional Payment Terms:"}
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{data.paymentTerms}</p>
                  </div>
                )}
              </div>
            )}
            {!data.hasCompensation && (
              <div className="mt-6 p-4 bg-slate-100 rounded-lg border border-slate-300">
                <p className="text-sm text-slate-600 italic">
                  {data.contractType === "proposal" 
                    ? "This proposal does not include any compensation terms." 
                    : "This contract does not include any payment or compensation terms."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
