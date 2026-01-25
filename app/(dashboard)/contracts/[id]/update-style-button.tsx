"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { FileType, Loader2, CheckCircle2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BrandingSettings {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  fontSize?: "small" | "normal" | "large";
  headerStyle?: "centered" | "left" | "right";
  borderStyle?: "solid" | "double" | "dashed" | "none";
  showBorder?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderWidth?: "thin" | "medium" | "thick";
  lineSpacing?: "tight" | "normal" | "loose";
  marginSize?: "small" | "medium" | "large";
  paperStyle?: "clean" | "lined" | "subtle";
  textAlign?: "left" | "center" | "justify";
  // Pro+ features
  logoUrl?: string;
  watermarkText?: string;
  watermarkOpacity?: number;
  footerText?: string;
  pageNumberStyle?: "none" | "bottom-center" | "bottom-right" | "top-right";
  sectionDividerStyle?: "none" | "line" | "double-line" | "ornamental";
  headerBackgroundColor?: string;
  footerBackgroundColor?: string;
  customPageSize?: "letter" | "legal" | "a4" | "custom";
  exportQuality?: "standard" | "high" | "print";
  // Premium only features
  customWatermarkImage?: string;
  advancedTypography?: boolean;
  customCSS?: string;
}

interface UpdateStyleButtonProps {
  contractId: string;
  currentBranding?: BrandingSettings;
  contractTitle: string;
  effectiveTier?: "free" | "starter" | "pro" | "premium";
}

export function UpdateStyleButton({
  contractId,
  currentBranding,
  contractTitle,
  effectiveTier: propEffectiveTier,
}: UpdateStyleButtonProps) {
  const [open, setOpen] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<"free" | "starter" | "pro" | "premium">(propEffectiveTier || "free");
  const [loading, setLoading] = useState(!propEffectiveTier); // Only load if tier not provided
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [branding, setBranding] = useState<BrandingSettings>({
    primaryColor: currentBranding?.primaryColor || "#6366f1",
    secondaryColor: currentBranding?.secondaryColor || "#8b5cf6",
    accentColor: currentBranding?.accentColor || "#10b981",
    fontFamily: currentBranding?.fontFamily || "Georgia, serif",
    fontSize: currentBranding?.fontSize || "normal",
    headerStyle: currentBranding?.headerStyle || "centered",
    borderStyle: currentBranding?.borderStyle || "solid",
    showBorder: currentBranding?.showBorder !== false,
    backgroundColor: currentBranding?.backgroundColor || "#ffffff",
    textColor: currentBranding?.textColor || "#1f2937",
    borderWidth: currentBranding?.borderWidth || "medium",
    lineSpacing: currentBranding?.lineSpacing || "normal",
    marginSize: currentBranding?.marginSize || "medium",
    paperStyle: currentBranding?.paperStyle || "clean",
    textAlign: currentBranding?.textAlign || "left",
  });

  useEffect(() => {
    // Use prop tier if provided, otherwise fetch
    if (propEffectiveTier) {
      setSubscriptionTier(propEffectiveTier);
      setLoading(false);
      return;
    }
    
    // Fetch subscription tier if not provided as prop
    fetch("/api/account")
      .then(res => res.json())
      .then(result => {
        if (result.company) {
          setSubscriptionTier(result.company.subscriptionTier || "free");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [propEffectiveTier]);

  const hasCustomBranding = subscriptionTier === "pro" || subscriptionTier === "premium";
  const hasPremiumFeatures = subscriptionTier === "premium";
  const canUpdateStyle = subscriptionTier === "starter" || hasCustomBranding;

  // Style presets
  const tierPresets = {
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/branding`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branding }),
      });

      if (response.ok) {
        toast({
          title: "Style updated!",
          description: "Contract styling has been updated. The new style will be applied to all future PDF downloads.",
        });
        setOpen(false);
        // Refresh the page to show updated styling
        router.refresh();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update styling",
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
      setSaving(false);
    }
  };

  // Always show button - make it clickable even if user can't update style
  // This way users can see the feature and know they need to upgrade

  const presets = tierPresets[subscriptionTier] || tierPresets.starter;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-indigo-600 text-indigo-300 hover:bg-indigo-900/30 hover:border-indigo-500 cursor-pointer"
        >
          <FileType className="h-4 w-4 mr-2" />
          Customize Style
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileType className="h-6 w-6 text-indigo-400" />
            Update Contract Style
          </DialogTitle>
          <DialogDescription>
            Change how your contract looks on paper - colors, fonts, and layout
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
                    ? "Upgrade to Starter+ to customize contract styles"
                    : subscriptionTier === "starter"
                    ? "Starter: Style presets available. Upgrade to Pro for full customization (colors, fonts, logos, watermarks, advanced options)"
                    : subscriptionTier === "pro"
                    ? "Pro: Full customization access. Upgrade to Premium for advanced features (custom CSS, watermark images, advanced typography)"
                    : "Premium: Access to all styling features including advanced customization"}
                </p>
              </div>
              {subscriptionTier === "free" || subscriptionTier === "starter" ? (
                <Link href="/dashboard/subscription">
                  <Button size="sm" variant="outline" className="border-indigo-600 text-indigo-300 hover:bg-indigo-900/30">
                    Upgrade Plan
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>

          {/* Style Presets */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Choose a Style</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {presets.map((preset, idx) => {
                const isSelected = selectedPreset === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => canUpdateStyle && applyPreset(preset, idx)}
                    disabled={!canUpdateStyle}
                    className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-900/20 ring-4 ring-indigo-500/30"
                        : "border-slate-700 bg-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-700/50"
                    } ${!canUpdateStyle ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                      </div>
                    )}
                    
                    {/* Preview Card */}
                    <div 
                      className="mb-3 p-3 rounded border-2 bg-white shadow"
                      style={{ 
                        borderColor: preset.colors.primary,
                        borderStyle: preset.borderStyle,
                        fontFamily: preset.font,
                      }}
                    >
                      <div 
                        className="mb-2 pb-2 border-b-2"
                        style={{ 
                          borderColor: preset.colors.primary,
                          textAlign: preset.headerStyle === "centered" ? "center" : preset.headerStyle,
                        }}
                      >
                        <h4 
                          className="text-sm font-bold mb-1"
                          style={{ color: preset.colors.primary }}
                        >
                          {contractTitle || "Contract Title"}
                        </h4>
                        <p 
                          className="text-xs"
                          style={{ color: preset.colors.secondary }}
                        >
                          Professional Document
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="h-0.5 bg-slate-200 rounded"></div>
                        <div className="h-0.5 bg-slate-200 rounded w-3/4"></div>
                      </div>
                    </div>

                    {/* Style Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{preset.icon}</span>
                          <p className="text-sm font-semibold text-white">
                            {preset.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-2.5 h-2.5 rounded-full border border-slate-600" 
                            style={{ backgroundColor: preset.colors.primary }}
                          />
                          <div 
                            className="w-2.5 h-2.5 rounded-full border border-slate-600" 
                            style={{ backgroundColor: preset.colors.secondary }}
                          />
                          {preset.colors.accent && (
                            <div 
                              className="w-2.5 h-2.5 rounded-full border border-slate-600" 
                              style={{ backgroundColor: preset.colors.accent }}
                            />
                          )}
                          <span className="text-xs text-slate-400 ml-1" style={{ fontFamily: preset.font }}>
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

          {/* Custom Options - Starter sees presets only, Pro+ sees full customization */}
          {canUpdateStyle && (
            <details className="pt-4 border-t border-slate-700">
              <summary className="cursor-pointer text-lg font-semibold text-white flex items-center gap-2 hover:text-indigo-300 transition-colors">
                <Zap className="h-5 w-5 text-indigo-400" />
                {hasCustomBranding ? "Advanced Customization (Pro+)" : "Style Presets Only (Starter)"}
                {hasCustomBranding && (
                  <Badge variant="outline" className="ml-2 border-indigo-600 text-indigo-300 text-xs">
                    Pro+
                  </Badge>
                )}
              </summary>
              <div className="space-y-4 mt-4 pt-4 border-t border-slate-700">
                {hasCustomBranding ? (
                  <>
                {/* Colors - Pro+ Only */}
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
                <div className="grid grid-cols-2 gap-4">
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
                      <option value="'Courier New', monospace">Courier New</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                      <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                      <option value="'Palatino Linotype', serif">Palatino</option>
                      <option value="'Book Antiqua', serif">Book Antiqua</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-300 mb-2 block">Font Size</Label>
                    <div className="flex gap-2">
                      {(["small", "normal", "large"] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setBranding({ ...branding, fontSize: size })}
                          className={`flex-1 py-2 rounded text-sm ${
                            branding.fontSize === size
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          }`}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Layout Options */}
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <Label className="text-sm text-slate-300 mb-2 block">Text Alignment</Label>
                    <div className="flex gap-2">
                      {(["left", "center", "justify"] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() => setBranding({ ...branding, textAlign: align })}
                          className={`flex-1 py-2 rounded text-sm ${
                            branding.textAlign === align
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          }`}
                        >
                          {align.charAt(0).toUpperCase() + align.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Border Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-slate-300 mb-2 block">Border Style</Label>
                    <div className="flex gap-2">
                      {(["none", "solid", "double", "dashed"] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => setBranding({ ...branding, borderStyle: style, showBorder: style !== "none" })}
                          className={`flex-1 py-2 rounded text-sm ${
                            branding.borderStyle === style
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          }`}
                        >
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-300 mb-2 block">Border Width</Label>
                    <div className="flex gap-2">
                      {(["thin", "medium", "thick"] as const).map((width) => (
                        <button
                          key={width}
                          onClick={() => setBranding({ ...branding, borderWidth: width })}
                          className={`flex-1 py-2 rounded text-sm ${
                            branding.borderWidth === width
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          }`}
                        >
                          {width.charAt(0).toUpperCase() + width.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-slate-300 mb-2 block">Text Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={branding.textColor || "#1f2937"}
                        onChange={(e) => setBranding({ ...branding, textColor: e.target.value })}
                        className="w-12 h-10 rounded border border-slate-600 cursor-pointer"
                      />
                      <Input
                        value={branding.textColor || "#1f2937"}
                        onChange={(e) => setBranding({ ...branding, textColor: e.target.value })}
                        className="flex-1 bg-slate-700/50 border-slate-600 text-white"
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-300 mb-2 block">Background Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={branding.backgroundColor || "#ffffff"}
                        onChange={(e) => setBranding({ ...branding, backgroundColor: e.target.value })}
                        className="w-12 h-10 rounded border border-slate-600 cursor-pointer"
                      />
                      <Input
                        value={branding.backgroundColor || "#ffffff"}
                        onChange={(e) => setBranding({ ...branding, backgroundColor: e.target.value })}
                        className="flex-1 bg-slate-700/50 border-slate-600 text-white"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>

                {/* Spacing & Layout */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-slate-300 mb-2 block">Line Spacing</Label>
                    <select
                      value={branding.lineSpacing || "normal"}
                      onChange={(e) => setBranding({ ...branding, lineSpacing: e.target.value as "tight" | "normal" | "loose" })}
                      className="w-full h-10 rounded border border-slate-600 bg-slate-700/50 px-3 text-white"
                    >
                      <option value="tight">Tight</option>
                      <option value="normal">Normal</option>
                      <option value="loose">Loose</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-300 mb-2 block">Margin Size</Label>
                    <select
                      value={branding.marginSize || "medium"}
                      onChange={(e) => setBranding({ ...branding, marginSize: e.target.value as "small" | "medium" | "large" })}
                      className="w-full h-10 rounded border border-slate-600 bg-slate-700/50 px-3 text-white"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-300 mb-2 block">Paper Style</Label>
                    <select
                      value={branding.paperStyle || "clean"}
                      onChange={(e) => setBranding({ ...branding, paperStyle: e.target.value as "clean" | "lined" | "subtle" })}
                      className="w-full h-10 rounded border border-slate-600 bg-slate-700/50 px-3 text-white"
                    >
                      <option value="clean">Clean</option>
                      <option value="lined">Lined</option>
                      <option value="subtle">Subtle</option>
                    </select>
                  </div>
                </div>

                {/* Pro Features - Branding & Layout */}
                <div className="pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="border-indigo-600 text-indigo-300">Pro Feature</Badge>
                    <Label className="text-base font-semibold text-white">Professional Branding</Label>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Logo Upload */}
                    <div>
                      <Label className="text-sm text-slate-300 mb-2 block">Company Logo URL</Label>
                      <Input
                        value={branding.logoUrl || ""}
                        onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-400 mt-1">Add your company logo to the contract header</p>
                    </div>

                    {/* Watermark */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-slate-300 mb-2 block">Watermark Text</Label>
                        <Input
                          value={branding.watermarkText || ""}
                          onChange={(e) => setBranding({ ...branding, watermarkText: e.target.value })}
                          placeholder="CONFIDENTIAL"
                          className="bg-slate-700/50 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-slate-300 mb-2 block">Watermark Opacity</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={(branding.watermarkOpacity || 20) * 100}
                            onChange={(e) => setBranding({ ...branding, watermarkOpacity: parseFloat(e.target.value) / 100 })}
                            className="flex-1"
                          />
                          <span className="text-xs text-slate-400 w-12 text-right">
                            {Math.round((branding.watermarkOpacity || 0.2) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div>
                      <Label className="text-sm text-slate-300 mb-2 block">Custom Footer Text</Label>
                      <Input
                        value={branding.footerText || ""}
                        onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                        placeholder="© 2024 Your Company. All rights reserved."
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    {/* Page Numbering */}
                    <div>
                      <Label className="text-sm text-slate-300 mb-2 block">Page Number Style</Label>
                      <div className="flex gap-2">
                        {(["none", "bottom-center", "bottom-right", "top-right"] as const).map((style) => (
                          <button
                            key={style}
                            onClick={() => setBranding({ ...branding, pageNumberStyle: style })}
                            className={`flex-1 py-2 rounded text-sm ${
                              (branding.pageNumberStyle || "none") === style
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            }`}
                          >
                            {style === "none" ? "None" : style.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Section Dividers */}
                    <div>
                      <Label className="text-sm text-slate-300 mb-2 block">Section Divider Style</Label>
                      <div className="flex gap-2">
                        {(["none", "line", "double-line", "ornamental"] as const).map((style) => (
                          <button
                            key={style}
                            onClick={() => setBranding({ ...branding, sectionDividerStyle: style })}
                            className={`flex-1 py-2 rounded text-sm ${
                              (branding.sectionDividerStyle || "none") === style
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            }`}
                          >
                            {style === "none" ? "None" : style.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Header/Footer Backgrounds */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-slate-300 mb-2 block">Header Background</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={branding.headerBackgroundColor || branding.primaryColor || "#6366f1"}
                            onChange={(e) => setBranding({ ...branding, headerBackgroundColor: e.target.value })}
                            className="w-12 h-10 rounded border border-slate-600 cursor-pointer"
                          />
                          <Input
                            value={branding.headerBackgroundColor || branding.primaryColor || "#6366f1"}
                            onChange={(e) => setBranding({ ...branding, headerBackgroundColor: e.target.value })}
                            className="flex-1 bg-slate-700/50 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-slate-300 mb-2 block">Footer Background</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={branding.footerBackgroundColor || branding.secondaryColor || "#8b5cf6"}
                            onChange={(e) => setBranding({ ...branding, footerBackgroundColor: e.target.value })}
                            className="w-12 h-10 rounded border border-slate-600 cursor-pointer"
                          />
                          <Input
                            value={branding.footerBackgroundColor || branding.secondaryColor || "#8b5cf6"}
                            onChange={(e) => setBranding({ ...branding, footerBackgroundColor: e.target.value })}
                            className="flex-1 bg-slate-700/50 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Page Size & Export Quality */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-slate-300 mb-2 block">Page Size</Label>
                        <select
                          value={branding.customPageSize || "letter"}
                          onChange={(e) => setBranding({ ...branding, customPageSize: e.target.value as "letter" | "legal" | "a4" | "custom" })}
                          className="w-full h-10 rounded border border-slate-600 bg-slate-700/50 px-3 text-white"
                        >
                          <option value="letter">Letter (8.5" × 11")</option>
                          <option value="legal">Legal (8.5" × 14")</option>
                          <option value="a4">A4 (210 × 297mm)</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm text-slate-300 mb-2 block">Export Quality</Label>
                        <select
                          value={branding.exportQuality || "standard"}
                          onChange={(e) => setBranding({ ...branding, exportQuality: e.target.value as "standard" | "high" | "print" })}
                          className="w-full h-10 rounded border border-slate-600 bg-slate-700/50 px-3 text-white"
                        >
                          <option value="standard">Standard</option>
                          <option value="high">High Quality</option>
                          <option value="print">Print Ready</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium Features */}
                {hasPremiumFeatures && (
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="border-purple-600 text-purple-300">Premium Only</Badge>
                      <Label className="text-base font-semibold text-white">Advanced Customization</Label>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Custom Watermark Image */}
                      <div>
                        <Label className="text-sm text-slate-300 mb-2 block">Custom Watermark Image URL</Label>
                        <Input
                          value={branding.customWatermarkImage || ""}
                          onChange={(e) => setBranding({ ...branding, customWatermarkImage: e.target.value })}
                          placeholder="https://example.com/watermark.png"
                          className="bg-slate-700/50 border-slate-600 text-white"
                        />
                        <p className="text-xs text-slate-400 mt-1">Use a custom image as watermark (overrides text watermark)</p>
                      </div>

                      {/* Advanced Typography */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm text-slate-300">Advanced Typography Controls</Label>
                          <input
                            type="checkbox"
                            checked={branding.advancedTypography || false}
                            onChange={(e) => setBranding({ ...branding, advancedTypography: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-600"
                          />
                        </div>
                        <p className="text-xs text-slate-400">Enable fine-grained typography controls (kerning, tracking, etc.)</p>
                      </div>

                      {/* Custom CSS */}
                      <div>
                        <Label className="text-sm text-slate-300 mb-2 block">Custom CSS (Advanced)</Label>
                        <textarea
                          value={branding.customCSS || ""}
                          onChange={(e) => setBranding({ ...branding, customCSS: e.target.value })}
                          placeholder=".contract-header { /* your custom styles */ }"
                          rows={4}
                          className="w-full rounded border border-slate-600 bg-slate-700/50 px-3 py-2 text-white font-mono text-sm"
                        />
                        <p className="text-xs text-slate-400 mt-1">Add custom CSS for advanced styling (Premium feature)</p>
                      </div>
                    </div>
                  </div>
                )}
                  </>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600">
                    <p className="text-sm text-slate-300 mb-2">
                      <strong>Starter Plan:</strong> You can choose from style presets above.
                    </p>
                    <p className="text-xs text-slate-400 mb-3">
                      Upgrade to <strong>Pro</strong> to unlock:
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside mb-3">
                      <li>Full color customization (primary, secondary, accent, text, background)</li>
                      <li>9+ font families and font size controls</li>
                      <li>Text alignment and header positioning</li>
                      <li>Border styles and widths</li>
                      <li>Line spacing, margins, and paper styles</li>
                      <li>Company logo and watermark text</li>
                      <li>Custom footer text and page numbering</li>
                      <li>Section dividers and header/footer backgrounds</li>
                      <li>Page size options and export quality settings</li>
                    </ul>
                    <p className="text-xs text-slate-400 mb-3">
                      Upgrade to <strong>Premium</strong> for:
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside mb-3">
                      <li>Custom watermark images</li>
                      <li>Advanced typography controls</li>
                      <li>Custom CSS for complete design control</li>
                    </ul>
                    <Link href="/dashboard/subscription">
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Upgrade to Pro
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Preview */}
          {selectedPreset !== null && (
            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold text-white">Selected Style Preview</Label>
                <Badge variant="outline" className="border-indigo-600 text-indigo-300">
                  Active
                </Badge>
              </div>
              <div 
                className="p-6 rounded-xl border-2 shadow-2xl bg-white"
                style={{ 
                  borderColor: branding.primaryColor,
                  borderStyle: branding.borderStyle,
                  fontFamily: branding.fontFamily,
                }}
              >
                <div 
                  className="mb-4 pb-3 border-b-2"
                  style={{ 
                    borderColor: branding.primaryColor,
                    textAlign: branding.headerStyle === "centered" ? "center" : branding.headerStyle,
                  }}
                >
                  <h2 
                    className="text-xl font-bold mb-2"
                    style={{ color: branding.primaryColor }}
                  >
                    {contractTitle || "Contract Title"}
                  </h2>
                  <p 
                    className="text-sm"
                    style={{ color: branding.secondaryColor }}
                  >
                    Professional Contract Document
                  </p>
                </div>
                <p className="text-slate-700 text-sm" style={{ fontFamily: branding.fontFamily }}>
                  This is how your contract will appear when printed or viewed as a PDF. 
                  The new styling will be applied to all future PDF downloads.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || selectedPreset === null || !canUpdateStyle}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Style"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
