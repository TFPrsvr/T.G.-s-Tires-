import { db } from '@/lib/db/database';
import { SecurityInputValidator } from '@/lib/security/input-validator';
import { MessageRouter } from '@/lib/messaging/message-router';
import type { Invitation, Tab } from '@/types';

export interface InvitationData {
  inviteeEmail: string;
  role: 'ADMIN' | 'USER';
  permissions: string[];
  message?: string;
}

export interface InvitationResponse {
  success: boolean;
  invitation?: Invitation;
  error?: string;
}

class InvitationManager {
  private readonly INVITATION_EXPIRY_HOURS = 72; // 3 days
  private readonly MAX_PENDING_INVITATIONS = 10;

  async createInvitation(
    inviterEmail: string,
    inviteeEmail: string,
    role: 'ADMIN' | 'USER' = 'USER',
    permissions: string[] = []
  ): Promise<InvitationResponse> {
    try {
      // Validate inviter exists
      const inviter = await db.getTabByEmail(inviterEmail);
      if (!inviter) {
        SecurityInputValidator.logSecurityEvent(
          'INVITATION_INVALID_INVITER',
          { inviterEmail, inviteeEmail },
          'MEDIUM'
        );
        return { success: false, error: 'Inviter not found' };
      }

      // Check if inviter has permission to invite
      if (!this.canInvite(inviter, role)) {
        SecurityInputValidator.logSecurityEvent(
          'INVITATION_UNAUTHORIZED',
          { inviterEmail, inviteeEmail, inviterRole: inviter.role, targetRole: role },
          'HIGH'
        );
        return { success: false, error: 'Insufficient permissions to send invitation' };
      }

      // Validate invitee email
      if (!SecurityInputValidator.validateEmail(inviteeEmail)) {
        return { success: false, error: 'Invalid email address' };
      }

      // Check if invitee already exists
      const existingTab = await db.getTabByEmail(inviteeEmail);
      if (existingTab) {
        return { success: false, error: 'User already has an account' };
      }

      // Check for existing pending invitation
      const existingInvitations = await this.getInvitationsByEmail(inviteeEmail);
      const pendingInvitation = existingInvitations.find(inv => inv.status === 'PENDING');
      if (pendingInvitation) {
        return { success: false, error: 'Invitation already sent to this email' };
      }

      // Check invitation limits
      const inviterPendingCount = await this.getPendingInvitationCount(inviterEmail);
      if (inviterPendingCount >= this.MAX_PENDING_INVITATIONS) {
        return { success: false, error: 'Maximum pending invitations reached' };
      }

      // Create invitation
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.INVITATION_EXPIRY_HOURS);

      const invitation = await db.createInvitation({
        inviterEmail,
        inviteeEmail,
        role,
        permissions,
        status: 'PENDING',
        expiresAt,
      });

      // Send invitation email
      await this.sendInvitationEmail(invitation, inviter);

      SecurityInputValidator.logSecurityEvent(
        'INVITATION_CREATED',
        {
          inviterEmail,
          inviteeEmail,
          role,
          invitationId: invitation.id,
        },
        'LOW'
      );

      return { success: true, invitation };
    } catch (error) {
      console.error('Error creating invitation:', error);

      SecurityInputValidator.logSecurityEvent(
        'INVITATION_CREATION_ERROR',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          inviterEmail,
          inviteeEmail,
        },
        'MEDIUM'
      );

      return { success: false, error: 'Failed to create invitation' };
    }
  }

  async acceptInvitation(token: string, acceptorEmail: string): Promise<InvitationResponse> {
    try {
      const invitation = await db.getInvitationByToken(token);
      if (!invitation) {
        SecurityInputValidator.logSecurityEvent(
          'INVITATION_INVALID_TOKEN',
          { token: token.substring(0, 8) + '...', acceptorEmail },
          'MEDIUM'
        );
        return { success: false, error: 'Invalid invitation token' };
      }

      // Verify email matches
      if (invitation.inviteeEmail !== acceptorEmail) {
        SecurityInputValidator.logSecurityEvent(
          'INVITATION_EMAIL_MISMATCH',
          {
            invitationEmail: invitation.inviteeEmail,
            acceptorEmail,
            invitationId: invitation.id,
          },
          'HIGH'
        );
        return { success: false, error: 'Email does not match invitation' };
      }

      // Check if already accepted/expired
      if (invitation.status !== 'PENDING') {
        return { success: false, error: `Invitation already ${invitation.status.toLowerCase()}` };
      }

      // Check expiration
      if (new Date() > invitation.expiresAt) {
        await db.updateInvitation(invitation.id, { status: 'EXPIRED' });
        return { success: false, error: 'Invitation has expired' };
      }

      // Check if user already exists
      const existingTab = await db.getTabByEmail(acceptorEmail);
      if (existingTab) {
        await db.updateInvitation(invitation.id, { status: 'DECLINED' });
        return { success: false, error: 'User already has an account' };
      }

      // Update invitation status
      const updatedInvitation = await db.updateInvitation(invitation.id, {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      });

      SecurityInputValidator.logSecurityEvent(
        'INVITATION_ACCEPTED',
        {
          invitationId: invitation.id,
          inviteeEmail: invitation.inviteeEmail,
          role: invitation.role,
        },
        'LOW'
      );

      return { success: true, invitation: updatedInvitation || invitation };
    } catch (error) {
      console.error('Error accepting invitation:', error);

      SecurityInputValidator.logSecurityEvent(
        'INVITATION_ACCEPT_ERROR',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          acceptorEmail,
        },
        'MEDIUM'
      );

      return { success: false, error: 'Failed to accept invitation' };
    }
  }

  async declineInvitation(token: string): Promise<InvitationResponse> {
    try {
      const invitation = await db.getInvitationByToken(token);
      if (!invitation) {
        return { success: false, error: 'Invalid invitation token' };
      }

      if (invitation.status !== 'PENDING') {
        return { success: false, error: 'Invitation is no longer pending' };
      }

      const updatedInvitation = await db.updateInvitation(invitation.id, {
        status: 'DECLINED',
      });

      SecurityInputValidator.logSecurityEvent(
        'INVITATION_DECLINED',
        {
          invitationId: invitation.id,
          inviteeEmail: invitation.inviteeEmail,
        },
        'LOW'
      );

      return { success: true, invitation: updatedInvitation || invitation };
    } catch (error) {
      console.error('Error declining invitation:', error);
      return { success: false, error: 'Failed to decline invitation' };
    }
  }

  async revokeInvitation(invitationId: string, revokerEmail: string): Promise<InvitationResponse> {
    try {
      const invitation = await db.getInvitationById(invitationId);
      if (!invitation) {
        return { success: false, error: 'Invitation not found' };
      }

      // Check if revoker is the original inviter or has admin privileges
      const revoker = await db.getTabByEmail(revokerEmail);
      if (!revoker) {
        return { success: false, error: 'Revoker not found' };
      }

      if (invitation.inviterEmail !== revokerEmail && !this.isAdmin(revoker)) {
        SecurityInputValidator.logSecurityEvent(
          'INVITATION_UNAUTHORIZED_REVOKE',
          {
            invitationId,
            revokerEmail,
            originalInviter: invitation.inviterEmail,
          },
          'HIGH'
        );
        return { success: false, error: 'Not authorized to revoke this invitation' };
      }

      if (invitation.status !== 'PENDING') {
        return { success: false, error: 'Can only revoke pending invitations' };
      }

      const updatedInvitation = await db.updateInvitation(invitationId, {
        status: 'EXPIRED',
      });

      SecurityInputValidator.logSecurityEvent(
        'INVITATION_REVOKED',
        {
          invitationId,
          revokerEmail,
          inviteeEmail: invitation.inviteeEmail,
        },
        'LOW'
      );

      return { success: true, invitation: updatedInvitation || invitation };
    } catch (error) {
      console.error('Error revoking invitation:', error);
      return { success: false, error: 'Failed to revoke invitation' };
    }
  }

  async cleanupExpiredInvitations(): Promise<number> {
    try {
      // This would typically be run as a scheduled job
      // For now, just return a mock count
      const expiredCount = 0;

      if (expiredCount > 0) {
        SecurityInputValidator.logSecurityEvent(
          'INVITATIONS_CLEANUP',
          { expiredCount },
          'LOW'
        );
      }

      return expiredCount;
    } catch (error) {
      console.error('Error cleaning up expired invitations:', error);
      return 0;
    }
  }

  // Helper methods
  private canInvite(inviter: Tab, targetRole: 'ADMIN' | 'USER'): boolean {
    // Owner can invite anyone
    if (inviter.role === 'OWNER') return true;

    // Admin can invite users but not other admins
    if (inviter.role === 'ADMIN' && targetRole === 'USER') return true;

    return false;
  }

  private isAdmin(tab: Tab): boolean {
    return tab.role === 'OWNER' || tab.role === 'ADMIN';
  }

  private async getInvitationsByEmail(email: string): Promise<Invitation[]> {
    // This would be implemented in the database layer
    return [];
  }

  private async getPendingInvitationCount(inviterEmail: string): Promise<number> {
    // This would be implemented in the database layer
    return 0;
  }

  private async sendInvitationEmail(invitation: Invitation, inviter: Tab): Promise<void> {
    try {
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`;

      const emailContent = this.generateInvitationEmail(invitation, inviter, inviteUrl);

      await MessageRouter.sendEmail({
        to: invitation.inviteeEmail,
        subject: `Invitation to join T.G.'s Tires from ${inviter.firstName} ${inviter.lastName}`,
        html: emailContent,
        businessId: 'tgs-default',
      });

      console.log(`Invitation email sent to ${invitation.inviteeEmail}`);
    } catch (error) {
      console.error('Error sending invitation email:', error);
      throw error;
    }
  }

  private generateInvitationEmail(invitation: Invitation, inviter: Tab, inviteUrl: string): string {
    const roleName = invitation.role === 'ADMIN' ? 'Administrator' : 'Team Member';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">T.G.'s Tires</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">You're Invited!</p>
        </div>

        <div style="padding: 40px 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">
            ${inviter.firstName} ${inviter.lastName} has invited you to join T.G.'s Tires
          </h2>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            You've been invited to join our tire marketplace platform as a <strong>${roleName}</strong>.
            T.G.'s Tires is a professional platform for selling used tires and yard sale items with
            secure payment processing and customer management tools.
          </p>

          <div style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Your Role: ${roleName}</h3>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              ${invitation.role === 'ADMIN'
                ? `
                  <li>Manage tire listings and yard sale items</li>
                  <li>Access customer messages and payment history</li>
                  <li>Invite new team members</li>
                  <li>Configure business settings</li>
                `
                : `
                  <li>Create and manage your own listings</li>
                  <li>Respond to customer inquiries</li>
                  <li>Track your sales and payments</li>
                  <li>Access basic platform features</li>
                `
              }
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}"
               style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: 600;
                      font-size: 16px;
                      display: inline-block;">
              Accept Invitation
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0; text-align: center;">
            This invitation will expire in 3 days. If you don't want to join, you can safely ignore this email.
          </p>

          <p style="color: #6b7280; font-size: 12px; margin: 20px 0 0 0; text-align: center;">
            If the button doesn't work, copy and paste this link: <br>
            <span style="word-break: break-all;">${inviteUrl}</span>
          </p>
        </div>

        <div style="background: #374151; color: #d1d5db; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 T.G.'s Tires - Professional Tire Marketplace</p>
        </div>
      </div>
    `;
  }
}

export const invitationManager = new InvitationManager();