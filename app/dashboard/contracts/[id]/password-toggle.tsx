"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Lock, LockOpen, Loader2, AlertCircle } from "lucide-react";
import { ToggleLeft, ToggleRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PasswordToggleProps {
  contractId: string;
  hasPassword: boolean;
}

export function PasswordToggle({ contractId, hasPassword: initialHasPassword }: PasswordToggleProps) {
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setHasPassword(initialHasPassword);
  }, [initialHasPassword]);

  const handleToggle = () => {
    if (hasPassword) {
      // Removing password - show confirmation
      setShowDialog(true);
    } else {
      // Adding password - show dialog to set password
      setShowDialog(true);
    }
  };

  const handleSave = async () => {
    // Validate password
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter a password",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 4) {
      toast({
        title: "Error",
        description: "Password must be at least 4 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setHasPassword(true);
      setShowDialog(false);
      setPassword("");
      setConfirmPassword("");
      toast({
        title: "Success",
        description: "Password protection has been enabled for this contract.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/password`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove password");
      }

      setHasPassword(false);
      setShowDialog(false);
      toast({
        title: "Success",
        description: "Password protection has been removed from this contract.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove password",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <div className="w-full pt-2 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {hasPassword ? (
              <Lock className="h-4 w-4 text-indigo-400" />
            ) : (
              <LockOpen className="h-4 w-4 text-slate-400" />
            )}
            <div>
              <Label className="text-sm font-semibold text-white cursor-pointer" onClick={handleToggle}>
                Password Protection
              </Label>
              <p className="text-xs text-slate-400 mt-0.5">
                {hasPassword ? "Contract requires a password to view" : "Require password to view contract"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasPassword ? (
              <ToggleRight
                className="h-6 w-6 text-indigo-400 cursor-pointer"
                onClick={handleToggle}
              />
            ) : (
              <ToggleLeft
                className="h-6 w-6 text-slate-500 cursor-pointer"
                onClick={handleToggle}
              />
            )}
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              {hasPassword ? (
                <>
                  <Lock className="h-6 w-6 text-indigo-400" />
                  Remove Password Protection
                </>
              ) : (
                <>
                  <Lock className="h-6 w-6 text-indigo-400" />
                  Set Contract Password
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {hasPassword
                ? "Are you sure you want to remove password protection from this contract? Anyone with the link will be able to view it."
                : "Set a password that recipients will need to view and sign this contract."}
            </DialogDescription>
          </DialogHeader>

          {hasPassword ? (
            <div className="space-y-4 py-4">
              <p className="text-sm text-slate-300">
                Removing password protection will allow anyone with the contract link to access it without a password.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                  }}
                  disabled={isRemoving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRemove}
                  disabled={isRemoving}
                  variant="destructive"
                >
                  {isRemoving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    "Remove Password"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-slate-400">
                  Client will need this password to access the contract
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> Passwords do not match
                </p>
              )}
              {password && password.length < 4 && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> Password must be at least 4 characters
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !password || password !== confirmPassword || password.length < 4}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Set Password"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
