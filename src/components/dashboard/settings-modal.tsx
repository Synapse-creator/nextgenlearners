"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, KeyRound, LogOut, User, ShieldCheck } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userData: {
    name?: string;
    email?: string;
    class?: string;
  } | null;
  onLogout: () => void;
}

export default function SettingsModal({
  isOpen,
  onOpenChange,
  userData,
  onLogout,
}: SettingsModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: error.message || "Failed to update password.",
        });
      } else {
        toast({
          title: "Password Updated 🎉",
          description: "Your password has been changed successfully.",
        });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6 bg-white border border-[#A8E6CF]/30 shadow-xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-2xl font-bold font-headline text-[#2D3436] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2c6956]">settings</span>
            Account Settings
          </DialogTitle>
          <DialogDescription className="text-sm text-[#636E72]">
            Manage your account preferences, password, and session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-2">
          {/* User Details Box */}
          <div className="bg-[#f2f4f1] rounded-xl p-4 space-y-2 border border-[#bfc9c3]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFD3B6] flex items-center justify-center font-bold text-[#795836]">
                {userData?.name?.[0]?.toUpperCase() || "S"}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-[#2D3436] text-sm truncate">
                  {userData?.name || "Student"}
                </p>
                <p className="text-xs text-[#636E72] truncate">
                  {userData?.email || "student@nextgen.edu"}
                </p>
              </div>
            </div>
            {userData?.class && (
              <div className="mt-2 pt-2 border-t border-[#bfc9c3]/30 flex justify-between text-xs text-[#404945]">
                <span>Assigned Class:</span>
                <span className="font-semibold text-[#2c6956]">{userData.class}</span>
              </div>
            )}
          </div>

          {/* Reset Password Form */}
          <form onSubmit={handlePasswordReset} className="space-y-3 bg-[#f8faf7] p-4 rounded-xl border border-[#A8E6CF]/30">
            <div className="flex items-center gap-2 font-bold text-sm text-[#2c6956] mb-1">
              <KeyRound className="w-4 h-4" />
              Reset Password
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-[#404945]" htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-white border-[#bfc9c3]/40 rounded-lg text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-[#404945]" htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white border-[#bfc9c3]/40 rounded-lg text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isUpdatingPassword || !newPassword}
              className="w-full bg-[#2c6956] hover:bg-[#1e4b3d] text-white rounded-xl py-2 font-bold squishy-btn mt-2"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 border-t pt-4">
          <Button
            variant="destructive"
            onClick={() => {
              onOpenChange(false);
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold rounded-xl py-2.5 squishy-btn"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
