"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, User, Mail, Save } from "lucide-react";

interface AccountSettingsProps {
  initialName: string;
  initialEmail: string;
}

export default function AccountSettings({ initialName, initialEmail }: AccountSettingsProps) {
  const { toast } = useToast();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed = name !== initialName || email !== initialEmail;
    setHasChanges(changed);
  }, [name, email, initialName, initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges) {
      toast({
        title: "No changes",
        description: "No changes to save.",
        variant: "default",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updates: { name?: string; email?: string } = {};
      if (name !== initialName) updates.name = name;
      if (email !== initialEmail) updates.email = email;

      const response = await fetch("/api/account/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update account");
      }

      toast({
        title: "Account updated",
        description: "Your account information has been updated successfully.",
      });

      // Reload page to reflect changes
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="h-6 w-6 text-indigo-400" />
          Account Settings
        </CardTitle>
        <CardDescription className="text-slate-400 mt-1">
          Update your personal information and account details
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300 flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500"
              placeholder="Enter your full name"
              minLength={2}
              maxLength={200}
              required
            />
            <p className="text-xs text-slate-500">
              This is the name displayed on your contracts and profile
            </p>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500"
              placeholder="Enter your email address"
              required
            />
            <p className="text-xs text-slate-500">
              You may need to verify your email if you change it
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isLoading || !hasChanges}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

