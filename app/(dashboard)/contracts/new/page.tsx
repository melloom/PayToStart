"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ChevronRight, ChevronLeft, FileText, UserPlus } from "lucide-react";
import Link from "next/link";
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
}

export default function NewContractPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [useNewClient, setUseNewClient] = useState(false);

  const [data, setData] = useState<ContractData>({
    fieldValues: {},
    depositAmount: "0",
    totalAmount: "0",
    title: "",
    content: "",
  });

  useEffect(() => {
    fetchTemplates();
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

  const handleFieldsSubmit = (fieldValues: Record<string, string>) => {
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

    setData({
      ...data,
      fieldValues,
      content,
    });
    setStep(4);
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
          loading={loadingTemplates}
          onSelect={handleTemplateSelect}
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

      {step === 3 && data.template && data.template.fields.length > 0 && (
        <Step3FillFields
          template={data.template}
          fieldValues={data.fieldValues}
          onSubmit={handleFieldsSubmit}
          onBack={() => setStep(2)}
        />
      )}

      {step === 3 && (!data.template || data.template.fields.length === 0) && (
        <Step3SkipFields onNext={() => setStep(4)} onBack={() => setStep(2)} />
      )}

      {step === 4 && (
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
          onBack={() => setStep(4)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

function Step1ChooseTemplate({
  templates,
  loading,
  onSelect,
  onBack,
}: {
  templates: ContractTemplate[];
  loading: boolean;
  onSelect: (template: ContractTemplate | null) => void;
  onBack: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Template</CardTitle>
        <CardDescription>Select a template or start from scratch</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Loading templates...</p>
        ) : (
          <>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onSelect(null)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Start from Scratch
            </Button>
            <div className="space-y-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onSelect(template)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {template.name}
                </Button>
              ))}
            </div>
            {templates.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No templates available.</p>
                <Link href="/dashboard/templates/new">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
        <div className="flex justify-end pt-4">
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

function Step3FillFields({
  template,
  fieldValues,
  onSubmit,
  onBack,
}: {
  template: ContractTemplate;
  fieldValues: Record<string, string>;
  onSubmit: (values: Record<string, string>) => void;
  onBack: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(fieldValues);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fill Template Fields</CardTitle>
        <CardDescription>Enter values for the template fields</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {template.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={values[field.id] || ""}
                onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                placeholder={field.placeholder}
                required={field.required}
              />
            ) : (
              <input
                type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={values[field.id] || ""}
                onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
          </div>
        ))}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => onSubmit(values)}
            disabled={
              template.fields
                .filter((f) => f.required)
                .some((f) => !values[f.id] || values[f.id].trim() === "")
            }
          >
            Continue
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Step3SkipFields({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Fields</CardTitle>
        <CardDescription>This template has no fields to fill</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onNext}>
            Continue
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
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
          <h3 className="font-semibold">Amounts</h3>
          <div className="space-y-1 text-sm">
            <div>Deposit: ${parseFloat(data.depositAmount || "0").toFixed(2)}</div>
            <div>Total: ${parseFloat(data.totalAmount || "0").toFixed(2)}</div>
          </div>
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
