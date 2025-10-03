"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, UserPlus, Mail, MessageSquare, Link as LinkIcon, X } from "lucide-react";
import Link from "next/link";

type InviteMethod = "email" | "sms" | "link";

export function InviteTeamMemberForm() {
  const [inviteMethod, setInviteMethod] = useState<InviteMethod>("email");
  const [role, setRole] = useState("member");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const handleSubmit = () => {
    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const confirmInvite = () => {
    // If using link method, generate a link
    if (inviteMethod === "link") {
      const link = `https://t-g-s-tires.vercel.app/invite/${Math.random().toString(36).substr(2, 9)}`;
      setGeneratedLink(link);
    }

    // Here you would send the invitation
    console.log("Sending invitation:", { inviteMethod, role, email, phone, name, message });

    setShowConfirmation(false);
    // Reset form or show success message
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "text-gray-900";
      case "manager": return "text-purple-700";
      case "member": return "text-green-700";
      case "visitor": return "text-blue-700";
      default: return "text-gray-700";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invitation Details
          </CardTitle>
          <CardDescription>
            Choose how to invite your team member and set their role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invite Method Tabs */}
          <Tabs value={inviteMethod} onValueChange={(value) => setInviteMethod(value as InviteMethod)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="link" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-600">
                  We'll send an invitation email to this address.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="sms" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-600">
                  We'll send an invitation SMS to this number.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="link" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label>Invitation Link</Label>
                {generatedLink ? (
                  <div className="flex gap-2">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      onClick={() => navigator.clipboard.writeText(generatedLink)}
                      variant="outline"
                    >
                      Copy
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md">
                    A unique invitation link will be generated when you send the invitation.
                    You can then share it with your team member.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name (Optional)</Label>
              <Input
                id="name"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={setRole} defaultValue="member">
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">
                    <span className="font-medium text-green-700">Member</span>
                  </SelectItem>
                  <SelectItem value="manager">
                    <span className="font-medium text-purple-700">Manager</span>
                  </SelectItem>
                  <SelectItem value="admin">
                    <span className="font-medium text-gray-900">Admin</span>
                  </SelectItem>
                  <SelectItem value="visitor">
                    <span className="font-medium text-blue-700">Visitor</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600">
                Default is Member. You can change the role later if needed.
              </p>
            </div>

            {/* Optional Message Toggle */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMessage(!showMessage)}
                className="btn-primary"
              >
                {showMessage ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Remove Message
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Add Personal Message
                  </>
                )}
              </Button>
            </div>

            {showMessage && (
              <div className="grid gap-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Hi! I'd like to invite you to join our tire marketplace team. We'd love to have you help us manage our listings and grow our business."
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  Add a personal note to make the invitation more welcoming.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
            <Button asChild className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
              <Link href="/dashboard/team">
                Cancel
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Invitation</DialogTitle>
            <DialogDescription>
              Are you sure you want to invite {name || (inviteMethod === "email" ? email : phone)} as a{" "}
              <span className={`font-bold ${getRoleColor(role)}`}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-sm space-y-2">
              <p><strong>Invite Method:</strong> {inviteMethod.toUpperCase()}</p>
              <p><strong>Contact:</strong> {inviteMethod === "email" ? email : inviteMethod === "sms" ? phone : "Link will be generated"}</p>
              {name && <p><strong>Name:</strong> {name}</p>}
              <p><strong>Role:</strong> <span className={getRoleColor(role)}>{role.charAt(0).toUpperCase() + role.slice(1)}</span></p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmInvite}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
              Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
