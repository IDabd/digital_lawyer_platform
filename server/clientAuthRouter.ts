import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import * as db from "./db";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";

// ============= CLIENT PORTAL AUTH ROUTER =============
export const clientAuthRouter = router({
  // Client login
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      // Find client by email
      const client = await db.getClientByEmail(input.email);
      if (!client) {
        throw new TRPCError({ 
          code: "UNAUTHORIZED", 
          message: "Invalid email or password" 
        });
      }

      // Get client auth
      const auth = await db.getClientAuthByClientId(client.id);
      if (!auth || !auth.isActive) {
        throw new TRPCError({ 
          code: "UNAUTHORIZED", 
          message: "Account not activated or invalid credentials" 
        });
      }

      // Verify password
      const isValid = await bcrypt.compare(input.password, auth.passwordHash);
      if (!isValid) {
        throw new TRPCError({ 
          code: "UNAUTHORIZED", 
          message: "Invalid email or password" 
        });
      }

      // Update last login
      await db.updateClientLastLogin(client.id);

      return {
        success: true,
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          type: client.type,
        },
      };
    }),

  // Set password using invite token
  setPassword: publicProcedure
    .input(z.object({
      token: z.string(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      // Find auth by token
      const auth = await db.getClientAuthByToken(input.token);
      if (!auth) {
        throw new TRPCError({ 
          code: "NOT_FOUND", 
          message: "Invalid or expired invitation token" 
        });
      }

      // Check token expiry
      if (auth.inviteExpiry && new Date() > auth.inviteExpiry) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Invitation token has expired" 
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Update auth
      await db.updateClientAuth(auth.clientId, {
        passwordHash,
        inviteToken: null,
        inviteExpiry: null,
        isActive: true,
      });

      return { success: true };
    }),

  // Verify invite token
  verifyToken: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ input }) => {
      const auth = await db.getClientAuthByToken(input.token);
      if (!auth) {
        throw new TRPCError({ 
          code: "NOT_FOUND", 
          message: "Invalid invitation token" 
        });
      }

      if (auth.inviteExpiry && new Date() > auth.inviteExpiry) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Invitation token has expired" 
        });
      }

      const client = await db.getClientById(auth.clientId);
      if (!client) {
        throw new TRPCError({ 
          code: "NOT_FOUND", 
          message: "Client not found" 
        });
      }

      return {
        valid: true,
        clientName: client.name,
        clientEmail: client.email,
      };
    }),

  // Get client dashboard data (requires client to be logged in)
  getDashboard: publicProcedure
    .input(z.object({
      clientId: z.number(),
    }))
    .query(async ({ input }) => {
      const client = await db.getClientById(input.clientId);
      if (!client) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      }

      // Get client cases
      const cases = await db.getCasesByClient(input.clientId);

      // Get client invoices
      const invoices = await db.getInvoicesByClient(input.clientId);

      // Get shared documents
      const sharedDocs = await db.getSharedDocumentsByClient(input.clientId);

      // Get unread messages count
      const unreadMessages = await db.getUnreadMessagesCount(input.clientId);

      return {
        client,
        stats: {
          totalCases: cases.length,
          activeCases: cases.filter((c: any) => c.status === 'active').length,
          totalInvoices: invoices.length,
          pendingInvoices: invoices.filter((i: any) => i.status === 'sent' || i.status === 'pending').length,
          sharedDocuments: sharedDocs.length,
          unreadMessages,
        },
        recentCases: cases.slice(0, 5),
        recentInvoices: invoices.slice(0, 5),
        recentDocuments: sharedDocs.slice(0, 5),
      };
    }),

  // Get client cases
  getCases: publicProcedure
    .input(z.object({
      clientId: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.getCasesByClient(input.clientId);
    }),

  // Get client invoices
  getInvoices: publicProcedure
    .input(z.object({
      clientId: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.getInvoicesByClient(input.clientId);
    }),

  // Get client messages
  getMessages: publicProcedure
    .input(z.object({
      clientId: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.getClientMessages(input.clientId);
    }),

  // Send message from client
  sendMessage: publicProcedure
    .input(z.object({
      clientId: z.number(),
      message: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      await db.createClientMessage({
        clientId: input.clientId,
        senderId: input.clientId,
        senderType: 'client',
        message: input.message,
        isRead: false,
      });

      return { success: true };
    }),

  // Mark message as read
  markMessageRead: publicProcedure
    .input(z.object({
      messageId: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db.markMessageAsRead(input.messageId);
      return { success: true };
    }),
});

// ============= ADMIN FUNCTIONS FOR CLIENT PORTAL =============
export const clientPortalAdminRouter = router({
  // Create invite for client (admin only)
  createInvite: publicProcedure
    .input(z.object({
      clientId: z.number(),
      expiryDays: z.number().default(7),
    }))
    .mutation(async ({ input }) => {
      // Check if client exists
      const client = await db.getClientById(input.clientId);
      if (!client) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      }

      // Check if auth already exists
      const existingAuth = await db.getClientAuthByClientId(input.clientId);
      if (existingAuth && existingAuth.isActive) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Client already has active portal access" 
        });
      }

      // Generate invite token
      const inviteToken = randomBytes(32).toString('hex');
      const inviteExpiry = new Date();
      inviteExpiry.setDate(inviteExpiry.getDate() + input.expiryDays);

      if (existingAuth) {
        // Update existing auth
        await db.updateClientAuth(input.clientId, {
          inviteToken,
          inviteExpiry,
        });
      } else {
        // Create new auth with temporary password
        const tempPassword = randomBytes(16).toString('hex');
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        await db.createClientAuth({
          clientId: input.clientId,
          passwordHash,
          inviteToken,
          inviteExpiry,
          isActive: false,
        });
      }

      // Generate invite link
      const inviteLink = `${process.env.VITE_APP_URL || 'http://localhost:3000'}/client-portal/invite/${inviteToken}`;

      return {
        success: true,
        inviteToken,
        inviteLink,
        expiresAt: inviteExpiry,
      };
    }),

  // Send message to client (admin only)
  sendMessageToClient: publicProcedure
    .input(z.object({
      clientId: z.number(),
      senderId: z.number(), // lawyer user id
      message: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      await db.createClientMessage({
        clientId: input.clientId,
        senderId: input.senderId,
        senderType: 'lawyer',
        message: input.message,
        isRead: false,
      });

      return { success: true };
    }),

  // Deactivate client portal access (admin only)
  deactivateAccess: publicProcedure
    .input(z.object({
      clientId: z.number(),
    }))
    .mutation(async ({ input }) => {
      await db.updateClientAuth(input.clientId, {
        isActive: false,
      });

      return { success: true };
    }),
});
