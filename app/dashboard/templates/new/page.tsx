"use client";

import { useState, useMemo, useRef } from "react";
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
  Copy,
  Check,
  GripVertical,
  AlertCircle,
  Zap,
  Type,
  DollarSign,
  Calendar,
  Shield,
  Users,
  FileCheck,
  Briefcase,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

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

export default function NewTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      fields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  const watchedContent = watch("content");
  const watchedFields = watch("fields");
  const watchedName = watch("name");
  const [copiedFieldId, setCopiedFieldId] = useState<string | null>(null);
  const [showSnippets, setShowSnippets] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [showLegalClauses, setShowLegalClauses] = useState(false);
  const [selectedClauses, setSelectedClauses] = useState<Set<string>>(new Set());
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [quickFieldLabel, setQuickFieldLabel] = useState("");
  const [quickFieldType, setQuickFieldType] = useState<"text" | "number" | "date" | "textarea">("text");
  const [quickFieldRequired, setQuickFieldRequired] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const addField = () => {
    if (!quickFieldLabel.trim()) {
      toast({
        title: "Field name required",
        description: "Please enter a field name",
        variant: "destructive",
      });
      return;
    }
    const newField = {
      id: `field-${Date.now()}`,
      label: quickFieldLabel.trim(),
      type: quickFieldType,
      required: quickFieldRequired,
      placeholder: "",
    };
    append(newField);
    setQuickFieldLabel("");
    setQuickFieldType("text");
    setQuickFieldRequired(false);
    setShowAddField(false);
    setEditingFieldIndex(fields.length); // Edit the newly added field
  };

  const copyFieldId = (fieldId: string) => {
    navigator.clipboard.writeText(`{{${fieldId}}}`);
    setCopiedFieldId(fieldId);
    setTimeout(() => setCopiedFieldId(null), 2000);
    toast({
      title: "Copied!",
      description: "Field placeholder copied to clipboard",
    });
  };

  // Legal clauses that can be added to contracts
  const legalClauses = [
    {
      id: "force-majeure",
      name: "Force Majeure",
      description: "Protection from unforeseeable circumstances",
      text: "FORCE MAJEURE\nNeither party shall be liable for any failure or delay in performance under this Agreement due to circumstances beyond its reasonable control, including but not limited to acts of God, war, terrorism, natural disasters, or government actions.\n\n"
    },
    {
      id: "governing-law",
      name: "Governing Law",
      description: "Specify which state/country laws apply",
      text: "GOVERNING LAW\nThis Agreement shall be governed by and construed in accordance with the laws of {{governingState}}, without regard to its conflict of law provisions. Any disputes arising under this Agreement shall be subject to the exclusive jurisdiction of the courts of {{governingState}}.\n\n"
    },
    {
      id: "dispute-resolution",
      name: "Dispute Resolution",
      description: "How to resolve conflicts",
      text: "DISPUTE RESOLUTION\nAny dispute arising out of or relating to this Agreement shall first be addressed through good faith negotiations between the parties. If the dispute cannot be resolved through negotiation within {{negotiationPeriod}} days, the parties agree to submit the dispute to binding arbitration in accordance with the rules of {{arbitrationOrganization}}.\n\n"
    },
    {
      id: "non-compete",
      name: "Non-Compete",
      description: "Restrict contractor from competing",
      text: "NON-COMPETE\nContractor agrees that during the term of this Agreement and for a period of {{nonCompetePeriod}} months thereafter, Contractor shall not directly or indirectly compete with Client in {{geographicArea}} or engage in any business that competes with the services provided under this Agreement.\n\n"
    },
    {
      id: "non-solicitation",
      name: "Non-Solicitation",
      description: "Prevent poaching clients/employees",
      text: "NON-SOLICITATION\nContractor agrees not to solicit, recruit, or hire any employees, contractors, or clients of Client for a period of {{nonSolicitPeriod}} months following the termination of this Agreement.\n\n"
    },
    {
      id: "indemnification",
      name: "Indemnification",
      description: "Protection from third-party claims",
      text: "INDEMNIFICATION\nContractor agrees to indemnify, defend, and hold harmless Client from and against any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising out of or relating to Contractor's breach of this Agreement or Contractor's negligence or willful misconduct.\n\n"
    },
    {
      id: "severability",
      name: "Severability",
      description: "Keep contract valid if one part is invalid",
      text: "SEVERABILITY\nIf any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect, and the invalid provision shall be modified to the minimum extent necessary to make it enforceable.\n\n"
    },
    {
      id: "entire-agreement",
      name: "Entire Agreement",
      description: "This is the complete agreement",
      text: "ENTIRE AGREEMENT\nThis Agreement constitutes the entire agreement between the parties and supersedes all prior agreements, understandings, and communications, whether written or oral, relating to the subject matter hereof. No modification of this Agreement shall be effective unless in writing and signed by both parties.\n\n"
    },
    {
      id: "assignment",
      name: "Assignment",
      description: "Rules for transferring the contract",
      text: "ASSIGNMENT\nNeither party may assign this Agreement or any rights or obligations hereunder without the prior written consent of the other party, except that Client may assign this Agreement to an affiliate or in connection with a merger or acquisition.\n\n"
    },
    {
      id: "waiver",
      name: "Waiver",
      description: "Rights are not waived unless in writing",
      text: "WAIVER\nNo waiver of any provision of this Agreement shall be effective unless in writing and signed by the party waiving such provision. The failure of either party to enforce any provision of this Agreement shall not constitute a waiver of such provision.\n\n"
    },
    {
      id: "notices",
      name: "Notices",
      description: "How to send official notices",
      text: "NOTICES\nAll notices required under this Agreement shall be in writing and delivered by certified mail, email, or courier to the addresses specified in this Agreement. Notices shall be deemed received upon delivery or {{noticeDeliveryDays}} days after mailing.\n\n"
    },
    {
      id: "independent-contractor",
      name: "Independent Contractor",
      description: "Clarify contractor is not an employee",
      text: "INDEPENDENT CONTRACTOR\nContractor is an independent contractor and not an employee, agent, or partner of Client. Contractor has no authority to bind Client or incur obligations on Client's behalf. Contractor is responsible for all taxes, insurance, and benefits related to Contractor's performance of services.\n\n"
    },
    {
      id: "limitation-liability",
      name: "Limitation of Liability",
      description: "Limit maximum liability amount",
      text: "LIMITATION OF LIABILITY\nIN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY. THE TOTAL LIABILITY OF EITHER PARTY SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY CLIENT TO CONTRACTOR UNDER THIS AGREEMENT.\n\n"
    },
    {
      id: "warranty-disclaimer",
      name: "Warranty Disclaimer",
      description: "Disclaim implied warranties",
      text: "WARRANTY DISCLAIMER\nEXCEPT AS EXPRESSLY SET FORTH IN THIS AGREEMENT, CONTRACTOR MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.\n\n"
    },
    {
      id: "confidentiality",
      name: "Confidentiality",
      description: "Protect sensitive information",
      text: "CONFIDENTIALITY\nBoth parties agree to maintain the confidentiality of all proprietary and confidential information disclosed during the course of this Agreement. This obligation shall survive the termination of this Agreement and continue for a period of {{confidentialityPeriod}} years thereafter.\n\n"
    },
    {
      id: "intellectual-property",
      name: "Intellectual Property Rights",
      description: "Define ownership of work product",
      text: "INTELLECTUAL PROPERTY\nUpon full payment, Contractor hereby assigns to Client all right, title, and interest in and to the work product, including all copyrights, patents, trademarks, and other intellectual property rights. Contractor retains the right to use the work in Contractor's portfolio with attribution.\n\n"
    },
    {
      id: "termination",
      name: "Termination",
      description: "How to end the contract",
      text: "TERMINATION\nEither party may terminate this Agreement: (a) upon {{terminationNoticePeriod}} days written notice to the other party; (b) immediately upon material breach by the other party that remains uncured for {{curePeriod}} days after written notice; or (c) immediately if either party becomes insolvent or files for bankruptcy.\n\n"
    },
    {
      id: "payment-terms",
      name: "Payment Terms",
      description: "Detailed payment conditions",
      text: "PAYMENT TERMS\nPayment is due within {{paymentTerms}} days of invoice date. Late payments shall incur interest at the rate of {{latePaymentInterest}}% per month or the maximum rate allowed by law, whichever is less. Client is responsible for all applicable taxes, except taxes based on Contractor's income.\n\n"
    },
    {
      id: "modifications",
      name: "Modifications",
      description: "How to change the contract",
      text: "MODIFICATIONS\nNo modification, amendment, or waiver of any provision of this Agreement shall be effective unless in writing and signed by both parties. Any attempt to modify this Agreement orally or through course of conduct shall be void.\n\n"
    }
  ];

  const handleClauseToggle = (clauseId: string, clauseText: string) => {
    const currentContent = watchedContent || "";
    const newSelectedClauses = new Set(selectedClauses);
    
    if (selectedClauses.has(clauseId)) {
      // Remove clause
      newSelectedClauses.delete(clauseId);
      // Remove the clause text from content
      const updatedContent = currentContent.replace(clauseText, "");
      setValue("content", updatedContent.trim(), { shouldValidate: true });
    } else {
      // Add clause
      newSelectedClauses.add(clauseId);
      // Append clause to end of content
      const updatedContent = currentContent + (currentContent ? "\n\n" : "") + clauseText;
      setValue("content", updatedContent, { shouldValidate: true });
    }
    
    setSelectedClauses(newSelectedClauses);
  };

  // Contract snippets for quick insertion
  const contractSnippets = [
    {
      name: "Header Section",
      icon: FileText,
      snippet: "CONTRACT AGREEMENT\n\nThis Agreement (\"Agreement\") is entered into on {{contractDate}} (the \"Effective Date\") between {{contractorName}} (\"Contractor\") and {{clientName}} (\"Client\").\n\nWHEREAS, Contractor is engaged in the business of providing services; and\nWHEREAS, Client desires to engage Contractor to provide such services;\n\nNOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:\n\n"
    },
    {
      name: "Services Section",
      icon: Briefcase,
      snippet: "1. SERVICES\n1.1 Contractor agrees to provide the following services (the \"Services\"):\n   - {{serviceDescription}}\n   \n1.2 Contractor will perform the Services in a professional and workmanlike manner, consistent with industry standards.\n\n1.3 The Services shall include the following deliverables:\n   - {{deliverable1}}\n   - {{deliverable2}}\n   - {{deliverable3}}\n\n"
    },
    {
      name: "Compensation Section",
      icon: DollarSign,
      snippet: "2. COMPENSATION\n2.1 Client agrees to pay Contractor the following compensation:\n   - Total Amount: ${{totalAmount}}\n   - Payment Schedule: {{paymentSchedule}}\n   \n2.2 Payment Terms:\n   - Payment is due within {{paymentTerms}} days of invoice date\n   - Late payments will incur interest at {{latePaymentInterest}}% per month\n   - Client is responsible for all applicable taxes\n\n"
    },
    {
      name: "Term & Dates",
      icon: Calendar,
      snippet: "3. TERM AND TERMINATION\n3.1 This Agreement shall commence on {{startDate}} and continue until {{endDate}}, unless earlier terminated.\n\n3.2 Either party may terminate this Agreement:\n   (a) With {{noticePeriod}} days written notice\n   (b) Immediately upon material breach by the other party\n   \n3.3 Upon termination, Contractor shall be paid for all services performed up to the date of termination.\n\n"
    },
    {
      name: "Intellectual Property",
      icon: Shield,
      snippet: "4. INTELLECTUAL PROPERTY\n4.1 Upon full payment, Contractor hereby assigns to Client all right, title, and interest in and to the work product, including all intellectual property rights.\n\n4.2 Contractor retains the right to use the work in Contractor's portfolio with attribution.\n\n4.3 Client receives exclusive license to use the work for {{usageRights}}.\n\n"
    },
    {
      name: "Confidentiality",
      icon: Shield,
      snippet: "5. CONFIDENTIALITY\n5.1 Both parties agree to maintain the confidentiality of all proprietary information disclosed during the course of this Agreement.\n\n5.2 This obligation shall survive the termination of this Agreement.\n\n5.3 Confidential information does not include information that is publicly available or independently developed.\n\n"
    },
    {
      name: "Liability & Warranty",
      icon: Shield,
      snippet: "6. WARRANTIES AND LIMITATION OF LIABILITY\n6.1 Contractor warrants that the Services will be performed in a professional manner.\n\n6.2 EXCEPT AS EXPRESSLY PROVIDED HEREIN, CONTRACTOR MAKES NO WARRANTIES, EXPRESS OR IMPLIED.\n\n6.3 Contractor's total liability shall not exceed the total compensation paid under this Agreement.\n\n"
    },
    {
      name: "Signatures",
      icon: FileCheck,
      snippet: "IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.\n\nCONTRACTOR:\n{{contractorName}}\nBy: _________________________\nName: {{contractorSignatory}}\nTitle: {{contractorTitle}}\nDate: {{contractDate}}\n\nCLIENT:\n{{clientName}}\nBy: _________________________\nName: {{clientSignatory}}\nTitle: {{clientTitle}}\nDate: {{signDate}}\n"
    }
  ];

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      // If textarea not focused, append to end
      const currentContent = watchedContent || "";
      setValue("content", currentContent + "\n\n" + snippet, { shouldValidate: true });
      toast({
        title: "Snippet inserted",
        description: "Contract section has been added to the end of your template",
      });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = watchedContent || "";
    const newContent = 
      currentContent.substring(0, start) + 
      snippet + 
      currentContent.substring(end);
    
    // Update the form value
    setValue("content", newContent, { shouldValidate: true });
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + snippet.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
    
    toast({
      title: "Snippet inserted",
      description: "Contract section has been added to your template",
    });
  };

  const onSubmit = async (data: TemplateForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Template created",
          description: "Template has been created successfully.",
        });
        router.push("/dashboard/templates");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to create template",
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
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5"></div>
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
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600/40 to-purple-600/40 flex items-center justify-center border-2 border-indigo-500/40 shadow-lg shadow-indigo-500/20 animate-pulse">
                  <Sparkles className="h-7 w-7 text-indigo-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Create Template
                  </h1>
                  <p className="text-slate-400 mt-1 flex items-center gap-2">
                    Build a reusable contract template
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
                <p className="text-sm text-slate-400 mt-1">Fill in the template information below</p>
              </div>
              <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300 flex items-center gap-2">
                      Template Name *
                      <div className="group relative">
                        <HelpCircle className="h-4 w-4 text-slate-500 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-slate-900 text-xs text-slate-300 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          Choose a descriptive name for your template (e.g., &quot;Website Development Contract&quot;)
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

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content" className="text-slate-300 flex items-center gap-2">
                        Template Content *
                        <div className="group relative">
                          <HelpCircle className="h-4 w-4 text-slate-500 cursor-help" />
                          <div className="absolute left-0 bottom-full mb-2 w-72 p-2 bg-slate-900 text-xs text-slate-300 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Write your contract content. Use {"{{fieldId}}"} to insert dynamic field values. The fieldId must match a field you create below.
                          </div>
                        </div>
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSnippets(!showSnippets)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all duration-200"
                        >
                          <Type className="h-4 w-4 mr-2" />
                          {showSnippets ? "Hide" : "Show"} Quick Insert
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowLegalClauses(!showLegalClauses)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all duration-200"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          {showLegalClauses ? "Hide" : "Show"} Legal Clauses
                        </Button>
                      </div>
                    </div>

                    {/* Quick Insert Snippets */}
                    {showSnippets && (
                      <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-indigo-400" />
                          <p className="text-sm font-semibold text-slate-300">Quick Insert Contract Sections</p>
                          <span className="text-xs text-slate-500 ml-auto">Click to insert at cursor position</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {contractSnippets.map((snippet, idx) => {
                            const Icon = snippet.icon;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => insertSnippet(snippet.snippet)}
                                className="group flex flex-col items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-indigo-500/50 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10"
                              >
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-500/40 transition-all">
                                  <Icon className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300" />
                                </div>
                                <span className="text-xs text-slate-300 group-hover:text-white text-center font-medium transition-colors">
                                  {snippet.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-slate-500 pt-2 border-t border-slate-700/50">
                          💡 These snippets include placeholder fields (e.g., {"{{contractDate}}"}). Create matching fields below to make them dynamic.
                        </p>
                      </div>
                    )}

                    {/* Legal Clauses Section */}
                    {showLegalClauses && (
                      <div className="p-5 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-2 border-purple-500/30 rounded-xl shadow-lg shadow-purple-500/10 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                            <Shield className="h-4 w-4 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-white">Legal Clauses</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Check boxes to add legal protections to your contract</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                          {legalClauses.map((clause) => (
                            <label
                              key={clause.id}
                              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                selectedClauses.has(clause.id)
                                  ? "bg-purple-500/10 border-purple-500/50 shadow-md shadow-purple-500/10"
                                  : "bg-slate-800/50 border-slate-700/50 hover:border-purple-500/30 hover:bg-slate-800/70"
                              }`}
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                <input
                                  type="checkbox"
                                  checked={selectedClauses.has(clause.id)}
                                  onChange={() => handleClauseToggle(clause.id, clause.text)}
                                  className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-2"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-white">{clause.name}</span>
                                  {selectedClauses.has(clause.id) && (
                                    <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                                      Added
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400">{clause.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Shield className="h-3 w-3 text-purple-400" />
                            <span>{selectedClauses.size} clause{selectedClauses.size !== 1 ? 's' : ''} selected</span>
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // Clear all selections and remove all clauses
                              const currentContent = watchedContent || "";
                              let updatedContent = currentContent;
                              legalClauses.forEach(clause => {
                                if (selectedClauses.has(clause.id)) {
                                  updatedContent = updatedContent.replace(clause.text, "");
                                }
                              });
                              setValue("content", updatedContent.trim(), { shouldValidate: true });
                              setSelectedClauses(new Set());
                            }}
                            disabled={selectedClauses.size === 0}
                            className="text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="relative">
              <Textarea
                id="content"
                {...register("content")}
                        ref={(e) => {
                          const registerRef = register("content").ref;
                          if (typeof registerRef === 'function') {
                            registerRef(e);
                          } else if (registerRef) {
                            registerRef.current = e;
                          }
                          textareaRef.current = e;
                        }}
                        placeholder="Start typing your contract content here, or use Quick Insert above to add common sections..."
                        rows={16}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none leading-relaxed"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <span className="text-xs text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-700/50">
                          {(watchedContent || "").split('\n').length} lines
                        </span>
                      </div>
                    </div>
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
                    <div className="flex items-start gap-2 p-3 bg-indigo-900/10 border border-indigo-700/30 rounded-lg">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Zap className="h-3 w-3 text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-indigo-300 mb-1">Pro Tips:</p>
                        <ul className="text-xs text-slate-400 space-y-1">
                          <li>• Use {"{{fieldId}}"} to insert dynamic field values</li>
                          <li>• Click &quot;Quick Insert&quot; to add common contract sections</li>
                          <li>• Create matching fields below for each placeholder</li>
                          <li>• The preview updates in real-time as you type</li>
                        </ul>
                      </div>
                    </div>
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
                        onClick={() => {
                          if (showAddField) {
                            setShowAddField(false);
                          } else {
                            setShowAddField(true);
                            setEditingFieldIndex(null);
                          }
                        }}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                        {showAddField ? "Cancel" : "Add Field"}
                </Button>
              </div>

                    {/* Quick Add Field Form */}
                    {showAddField && (
                      <div className="p-5 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-indigo-500/30 rounded-xl shadow-lg shadow-indigo-500/10 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <Plus className="h-4 w-4 text-indigo-400" />
                          </div>
                          <h3 className="text-sm font-semibold text-white">Add New Field</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-slate-300 font-medium">Field Name *</Label>
                            <Input
                              value={quickFieldLabel}
                              onChange={(e) => setQuickFieldLabel(e.target.value)}
                              placeholder="e.g., Project Name, Client Email, Contract Date"
                              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all h-11"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addField();
                                }
                              }}
                              autoFocus
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm text-slate-300 font-medium">Field Type</Label>
                              <select
                                value={quickFieldType}
                                onChange={(e) => setQuickFieldType(e.target.value as typeof quickFieldType)}
                                className="flex h-11 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all"
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="textarea">Textarea</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm text-slate-300 font-medium">Options</Label>
                              <label className="flex items-center space-x-2 cursor-pointer h-11 px-4 bg-slate-700/50 border border-slate-600 rounded-md hover:bg-slate-700/70 hover:border-slate-500 transition-all">
                                <input
                                  type="checkbox"
                                  checked={quickFieldRequired}
                                  onChange={(e) => setQuickFieldRequired(e.target.checked)}
                                  className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                                />
                                <span className="text-sm text-slate-300">Required field</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Zap className="h-3 w-3 text-indigo-400" />
                            <span>Click the field after adding to customize placeholder text</span>
                          </p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setShowAddField(false);
                                setQuickFieldLabel("");
                                setQuickFieldType("text");
                                setQuickFieldRequired(false);
                              }}
                              className="text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={addField}
                              disabled={!quickFieldLabel.trim()}
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Field
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fields List - Simple and Clean */}
                    {fields.length === 0 && !showAddField ? (
                      <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg bg-slate-900/20">
                        <p className="text-sm text-slate-400 mb-2">No fields yet</p>
                        <p className="text-xs text-slate-500 mb-4">Click &quot;Add Field&quot; above to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {fields.map((field, index) => (
                          <div
                            key={field.id}
                            className={`group border rounded-lg transition-all duration-200 ${
                              editingFieldIndex === index
                                ? "border-indigo-500 bg-slate-800/70 shadow-lg shadow-indigo-500/10"
                                : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50 hover:bg-slate-800/40"
                            }`}
                          >
                            {editingFieldIndex === index ? (
                              // Edit Mode - Inline Editing
                              <div className="p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs text-slate-400">Field Label *</Label>
                                    <Input
                                      {...register(`fields.${index}.label`)}
                                      placeholder="Field name"
                                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                      autoFocus
                                    />
                                    {errors.fields?.[index]?.label && (
                                      <p className="text-xs text-red-400">{errors.fields[index]?.label?.message}</p>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-slate-400">Type</Label>
                                    <select
                                      {...register(`fields.${index}.type`)}
                                      className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                      <option value="text">Text</option>
                                      <option value="number">Number</option>
                                      <option value="date">Date</option>
                                      <option value="textarea">Textarea</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-slate-400">Placeholder (Optional)</Label>
                                  <Input
                                    {...register(`fields.${index}.placeholder`)}
                                    placeholder="What to show when empty"
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                  />
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                                  <div className="flex items-center gap-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <Controller
                                        name={`fields.${index}.required`}
                                        control={control}
                                        render={({ field }) => (
                                          <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="border-slate-600 data-[state=checked]:bg-indigo-600"
                                          />
                                        )}
                                      />
                                      <span className="text-xs text-slate-300">Required</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-500">Use:</span>
                                      <code className="text-xs font-mono text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded border border-indigo-700/50">
                                        {"{{"}{field.id}{"}}"}
                                      </code>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyFieldId(field.id)}
                                        className="h-6 px-2 text-xs"
                                      >
                                        {copiedFieldId === field.id ? (
                                          <Check className="h-3 w-3 text-green-400" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingFieldIndex(null)}
                                      className="text-slate-400 hover:text-slate-300"
                                    >
                                      Done
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        remove(index);
                                        setEditingFieldIndex(null);
                                      }}
                                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // View Mode - Simple Row
                              <div
                                className="p-3 flex items-center justify-between cursor-pointer"
                                onClick={() => setEditingFieldIndex(index)}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="text-slate-500">
                                    <GripVertical className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-slate-200 truncate">
                                        {field.label || "Unnamed field"}
                                      </span>
                                      {field.required && (
                                        <span className="text-xs bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">
                                          Required
                                        </span>
                                      )}
                                      <span className="text-xs text-slate-500 capitalize">
                                        {field.type}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <code className="text-xs font-mono text-indigo-300 bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-700/50">
                                        {"{{"}{field.id}{"}}"}
                                      </code>
                                      {field.placeholder && (
                                        <span className="text-xs text-slate-500 truncate">
                                          Placeholder: {field.placeholder}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyFieldId(field.id);
                                    }}
                                    className="h-7 px-2 text-xs text-slate-400 hover:text-indigo-300"
                                  >
                                    {copiedFieldId === field.id ? (
                                      <Check className="h-3 w-3 text-green-400" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      remove(index);
                                    }}
                                    className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                  ))}
                </div>
              )}
            </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all duration-200"
              >
                Cancel
              </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Create Template
                        </>
                      )}
              </Button>
            </div>
          </form>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="border-2 border-slate-700/50 shadow-2xl bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:border-slate-600/50 sticky top-8">
              <div className="border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Eye className="h-6 w-6 text-indigo-400" />
                  Live Preview
                  <span className="ml-auto text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/30">
                    Real-time
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">See how your template will look</p>
              </div>
              <div className="p-6">
                <div className="bg-white rounded-lg p-8 min-h-[500px] shadow-inner border-2 border-slate-200">
                  <h3 className="text-3xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">
                    {watchedName || (
                      <span className="text-slate-400 italic">Template Name</span>
                    )}
                  </h3>
                  <div className="prose max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {getPreviewContent() || (
                      <div className="text-center py-20 text-slate-400">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Start typing your template content</p>
                        <p className="text-sm mt-2">The preview will update in real-time as you type</p>
                      </div>
                    )}
                  </div>
                </div>
                {watchedFields && watchedFields.length > 0 && (
                  <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-indigo-400" />
                      Active Field Placeholders:
                    </p>
                    <div className="space-y-2">
                      {watchedFields.map((field, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-700/50 hover:border-slate-600 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded border border-indigo-700/50">
                              {"{{"}{field.id}{"}}"}
                            </code>
                            <span className="text-xs text-slate-400">→</span>
                            <span className="text-xs text-slate-300">
                              {field.label || "Unnamed field"}
                            </span>
                            {field.required && (
                              <span className="text-xs bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">
                                Required
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 capitalize">
                            {field.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {orphanedPlaceholders.length > 0 && (
                  <div className="mt-4 p-4 bg-amber-900/20 rounded-lg border border-amber-700/50">
                    <p className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Missing Field Definitions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {orphanedPlaceholders.map((id) => (
                        <code key={id} className="text-xs font-mono bg-amber-900/30 text-amber-200 px-2 py-1 rounded border border-amber-700/50">
                          {"{{"}{id}{"}}"}
                        </code>
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
