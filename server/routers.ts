import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { nanoid } from "nanoid";
import * as bcrypt from "bcryptjs";

// Import extended routers
import { 
  invoicesRouter,
  calendarRouter,
  notificationsRouter,
  aiRouter,
  sharedDocsRouter,
  templatesRouter,
  reportsRouter,
} from "./routers_extended";
import { clientAuthRouter, clientPortalAdminRouter } from "./clientAuthRouter";

// Helper to create case activity
async function logCaseActivity(caseId: number, userId: number, activityType: string, description: string, metadata?: any) {
  await db.createCaseActivity({
    caseId,
    userId,
    activityType,
    description,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

// Helper to create notification
async function notifyUser(userId: number, title: string, message: string, type: string, relatedId?: number) {
  await db.createNotification({
    userId,
    title,
    message,
    type,
    relatedId: relatedId || null,
    isRead: false,
  });
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: protectedProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============= CLIENT ROUTES =============
  clients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAllClients(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const client = await db.getClientById(input.id);
        if (!client) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
        }
        return client;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        nationalId: z.string().optional().nullable(),
        companyName: z.string().optional().nullable(),
        companyRegistration: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        status: z.enum(["active", "inactive"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createClient({
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          address: input.address || null,
          nationalId: input.nationalId || null,
          companyName: input.companyName || null,
          companyRegistration: input.companyRegistration || null,
          type: input.companyName ? "company" : "individual",
          status: input.status || "active",
          notes: input.notes || null,
          createdBy: ctx.user.id,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        nationalId: z.string().optional().nullable(),
        companyName: z.string().optional().nullable(),
        companyRegistration: z.string().optional().nullable(),
        type: z.enum(["individual", "company"]).optional(),
        notes: z.string().optional().nullable(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateClient(id, data);
        return { success: true };
      }),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input, ctx }) => {
        return await db.searchClients(input.query, ctx.user.id);
      }),
  }),

  // ============= CASE ROUTES =============
  cases: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAllCases(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const caseData = await db.getCaseById(input.id);
        if (!caseData) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Case not found" });
        }
        return caseData;
      }),

    getByStatus: protectedProcedure
      .input(z.object({ status: z.enum(["active", "pending", "closed", "archived"]) }))
      .query(async ({ input, ctx }) => {
        return await db.getCasesByStatus(input.status, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        caseNumber: z.string().min(1),
        title: z.string().min(1),
        description: z.string().optional(),
        clientId: z.number(),
        caseType: z.string(),
        status: z.enum(["active", "pending", "closed", "archived"]).default("active"),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        court: z.string().optional(),
        judge: z.string().optional(),
        opposingParty: z.string().optional(),
        opposingLawyer: z.string().optional(),
        filingDate: z.date().optional(),
        hearingDate: z.date().optional(),
        assignedTo: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createCase({
          ...input,
          createdBy: ctx.user.id,
        });

        const cases = await db.getAllCases(ctx.user.id);
        const caseId = cases[0]?.id;
        
        if (caseId) {
          await logCaseActivity(caseId, ctx.user.id, "created", `Case created: ${input.title}`);
          
          if (input.assignedTo && input.assignedTo !== ctx.user.id) {
            await notifyUser(
              input.assignedTo,
              "New Case Assigned",
              `You have been assigned to case: ${input.title}`,
              "case_update",
              caseId
            );
          }
        }

        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        caseType: z.string().optional(),
        status: z.enum(["active", "pending", "closed", "archived"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        court: z.string().optional(),
        judge: z.string().optional(),
        opposingParty: z.string().optional(),
        opposingLawyer: z.string().optional(),
        filingDate: z.date().optional(),
        hearingDate: z.date().optional(),
        closingDate: z.date().optional(),
        assignedTo: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const oldCase = await db.getCaseById(id);
        
        await db.updateCase(id, data);

        if (data.status && oldCase?.status !== data.status) {
          await logCaseActivity(id, ctx.user.id, "status_changed", `Status changed from ${oldCase?.status} to ${data.status}`);
        }
        if (data.assignedTo && oldCase?.assignedTo !== data.assignedTo) {
          await logCaseActivity(id, ctx.user.id, "assigned", `Case assigned to user ${data.assignedTo}`);
          await notifyUser(data.assignedTo, "Case Assigned", `You have been assigned to a case`, "case_update", id);
        }

        return { success: true };
      }),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input, ctx }) => {
        return await db.searchCases(input.query, ctx.user.id);
      }),

    getActivities: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCaseActivities(input.caseId);
      }),
  }),

  // ============= DOCUMENT ROUTES =============
  documents: router({
    getAll: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getAllDocuments(ctx.user.id);
      }),

    getByCase: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDocumentsByCase(input.caseId);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const doc = await db.getDocumentById(input.id);
        if (!doc) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
        }
        return doc;
      }),

    upload: protectedProcedure
      .input(z.object({
        caseId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        fileName: z.string(),
        fileData: z.string(),
        mimeType: z.string(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `documents/${ctx.user.id}/${Date.now()}-${nanoid(8)}-${input.fileName}`;
        const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);

        await db.createDocument({
          caseId: input.caseId,
          title: input.title,
          description: input.description || null,
          fileKey,
          fileUrl: url,
          fileName: input.fileName,
          fileSize: fileBuffer.length,
          mimeType: input.mimeType,
          category: input.category || null,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          uploadedBy: ctx.user.id,
        });

        await logCaseActivity(input.caseId, ctx.user.id, "document_uploaded", `Document uploaded: ${input.title}`);

        return { success: true, url };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = { ...data };
        if (data.tags) {
          updateData.tags = JSON.stringify(data.tags);
        }
        await db.updateDocument(id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const doc = await db.getDocumentById(input.id);
        if (doc) {
          await db.softDeleteDocument(input.id);
          await logCaseActivity(doc.caseId, ctx.user.id, "document_deleted", `Document deleted: ${doc.title}`);
        }
        return { success: true };
      }),

    search: protectedProcedure
      .input(z.object({ 
        query: z.string(),
        caseId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.searchDocuments(input.query, input.caseId);
      }),
  }),

  // ============= TASK ROUTES =============
  tasks: router({
    getByCase: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTasksByCase(input.caseId);
      }),

    getByUser: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTasksByUser(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        caseId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        assignedTo: z.number().optional(),
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createTask({
          ...input,
          createdBy: ctx.user.id,
        });

        if (input.assignedTo && input.assignedTo !== ctx.user.id) {
          await notifyUser(
            input.assignedTo,
            "New Task Assigned",
            `You have been assigned a new task: ${input.title}`,
            "task_assigned"
          );
        }

        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        dueDate: z.date().optional(),
        completedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateTask(id, data);
        return { success: true };
      }),
  }),

  // ============= TIME ENTRY ROUTES =============
  timeEntries: router({
    getByCase: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTimeEntriesByCase(input.caseId);
      }),

    getByUser: protectedProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input, ctx }) => {
        return await db.getTimeEntriesByUser(ctx.user.id, input.startDate, input.endDate);
      }),

    create: protectedProcedure
      .input(z.object({
        caseId: z.number(),
        description: z.string().min(1),
        hours: z.string(),
        rate: z.string().optional(),
        date: z.date(),
        isBillable: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        const hours = input.hours;
        const rate = input.rate || "0";
        const amount = (parseFloat(hours) * parseFloat(rate)).toFixed(2);

        await db.createTimeEntry({
          caseId: input.caseId,
          userId: ctx.user.id,
          description: input.description,
          hours,
          rate,
          amount,
          date: input.date,
          isBillable: input.isBillable,
          invoiceId: null,
        });

        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        hours: z.string().optional(),
        rate: z.string().optional(),
        isBillable: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        
        if (data.hours || data.rate) {
          const hours = data.hours || "0";
          const rate = data.rate || "0";
          (data as any).amount = (parseFloat(hours) * parseFloat(rate)).toFixed(2);
        }

        await db.updateTimeEntry(id, data as any);
        return { success: true };
      }),
  }),

  // ============= EXPENSE ROUTES =============
  expenses: router({
    getByCase: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        return await db.getExpensesByCase(input.caseId);
      }),

    create: protectedProcedure
      .input(z.object({
        caseId: z.number(),
        description: z.string().min(1),
        amount: z.string(),
        category: z.string().optional(),
        date: z.date(),
        receiptData: z.string().optional(),
        isBillable: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        let receiptUrl: string | null = null;

        if (input.receiptData) {
          const fileBuffer = Buffer.from(input.receiptData, 'base64');
          const fileKey = `receipts/${ctx.user.id}/${Date.now()}-${nanoid(8)}.jpg`;
          const { url } = await storagePut(fileKey, fileBuffer, 'image/jpeg');
          receiptUrl = url;
        }

        await db.createExpense({
          caseId: input.caseId,
          userId: ctx.user.id,
          description: input.description,
          amount: input.amount,
          category: input.category || null,
          date: input.date,
          receiptUrl,
          isBillable: input.isBillable,
          invoiceId: null,
        });

        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        amount: z.string().optional(),
        category: z.string().optional(),
        isBillable: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateExpense(id, data as any);
        return { success: true };
      }),
  }),

  // Extended routers
  invoices: invoicesRouter,
  calendar: calendarRouter,
  notifications: notificationsRouter,
  ai: aiRouter,
  sharedDocs: sharedDocsRouter,
  templates: templatesRouter,
  reports: reportsRouter,
  
  // Client portal routers
  clientAuth: clientAuthRouter,
  clientPortalAdmin: clientPortalAdminRouter,
});

export type AppRouter = typeof appRouter;
