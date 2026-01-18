// This file contains extended routers for invoices, calendar, notifications, and AI features
// Import this in routers.ts

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { nanoid } from "nanoid";
import * as bcrypt from "bcryptjs";

// ============= INVOICE ROUTES =============
export const invoicesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getAllInvoices(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const invoice = await db.getInvoiceById(input.id);
      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }
      return invoice;
    }),

  getByStatus: protectedProcedure
    .input(z.object({ status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]) }))
    .query(async ({ input, ctx }) => {
      return await db.getInvoicesByStatus(input.status, ctx.user.id);
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await db.getAllInvoices(ctx.user.id);
  }),

  create: protectedProcedure
    .input(z.object({
      caseId: z.number(),
      clientId: z.number(),
      description: z.string().optional(),
      amount: z.number(),
      taxAmount: z.number(),
      totalAmount: z.number(),
      status: z.enum(["draft", "pending", "paid", "overdue", "cancelled"]),
      dueDate: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await db.createInvoice({
        invoiceNumber,
        caseId: input.caseId,
        clientId: input.clientId,
        status: input.status,
        subtotal: input.amount.toString(),
        taxRate: "15.00",
        taxAmount: input.taxAmount.toString(),
        discount: "0.00",
        total: input.totalAmount.toString(),
        notes: input.description || null,
        dueDate: input.dueDate || null,
        paidDate: null,
        createdBy: ctx.user.id,
      });

      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
      subtotal: z.string().optional(),
      taxRate: z.string().optional(),
      discount: z.string().optional(),
      notes: z.string().optional(),
      dueDate: z.date().optional(),
      paidDate: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      
      // Recalculate if amounts changed
      if (data.subtotal || data.taxRate || data.discount) {
        const invoice = await db.getInvoiceById(id);
        if (invoice) {
          const subtotal = parseFloat(data.subtotal || invoice.subtotal);
          const taxRate = parseFloat(data.taxRate || invoice.taxRate);
          const discount = parseFloat(data.discount || invoice.discount);
          
          const taxAmount = (subtotal * taxRate / 100).toFixed(2);
          const total = (subtotal + parseFloat(taxAmount) - discount).toFixed(2);
          
          (data as any).taxAmount = taxAmount;
          (data as any).total = total;
        }
      }

      await db.updateInvoice(id, data as any);
      return { success: true };
    }),

  generatePDF: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // This would generate a PDF invoice
      // For now, return success
      return { success: true, pdfUrl: `/api/invoices/${input.id}/pdf` };
    }),
});

// ============= CALENDAR ROUTES =============
export const calendarRouter = router({
  getEvents: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      return await db.getCalendarEvents(ctx.user.id, input.startDate, input.endDate);
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.getCalendarEvents(ctx.user.id);
    }),

  create: protectedProcedure
    .input(z.object({
      caseId: z.number().optional().nullable(),
      title: z.string().min(1),
      description: z.string().optional().nullable(),
      eventType: z.enum(["hearing", "meeting", "deadline", "consultation", "other"]),
      status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
      location: z.string().optional().nullable(),
      startDate: z.date(),
      endDate: z.date(),
      attendees: z.string().optional().nullable(),
      reminderMinutes: z.number().default(30),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.createCalendarEvent({
        caseId: input.caseId || null,
        title: input.title,
        description: input.description || null,
        eventType: input.eventType,
        status: input.status || "scheduled",
        location: input.location || null,
        startDate: input.startDate,
        endDate: input.endDate,
        attendees: input.attendees ? JSON.stringify(input.attendees) : null,
        reminderMinutes: input.reminderMinutes,
        createdBy: ctx.user.id,
      });

      // Note: attendees is now a string, not an array

      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional().nullable(),
      eventType: z.enum(["hearing", "meeting", "deadline", "consultation", "other"]).optional(),
      status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
      location: z.string().optional().nullable(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      attendees: z.string().optional().nullable(),
      reminderMinutes: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCalendarEvent(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteCalendarEvent(input.id);
      return { success: true };
    }),
});

// ============= NOTIFICATION ROUTES =============
export const notificationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserNotifications(ctx.user.id);
  }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUnreadNotificationCount(ctx.user.id);
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.markNotificationAsRead(input.id);
      return { success: true };
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const notifications = await db.getUserNotifications(ctx.user.id);
    for (const notif of notifications) {
      if (!notif.isRead) {
        await db.markNotificationAsRead(notif.id);
      }
    }
    return { success: true };
  }),
});

// ============= AI FEATURES ROUTES =============
export const aiRouter = router({
  // Extract data from document
  extractData: protectedProcedure
    .input(z.object({
      documentId: z.number(),
      extractionType: z.enum(["entities", "dates", "amounts", "parties"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const document = await db.getDocumentById(input.documentId);
      if (!document) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      }

      // Call LLM for extraction
      const prompt = `Extract ${input.extractionType} from the following legal document. Return as JSON.
      
Document: ${document.title}
Type: ${document.category}

Please extract all relevant ${input.extractionType} and return them in a structured JSON format.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a legal document analysis AI. Extract information accurately and return valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "extraction_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                extracted_items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      value: { type: "string" },
                      confidence: { type: "number" }
                    },
                    required: ["type", "value", "confidence"],
                    additionalProperties: false
                  }
                }
              },
              required: ["extracted_items"],
              additionalProperties: false
            }
          }
        }
      });

      const extractedData = typeof response.choices[0]?.message?.content === 'string' 
        ? response.choices[0].message.content 
        : JSON.stringify(response.choices[0]?.message?.content || {});
      
      // Save extraction result
      await db.createAIExtraction({
        documentId: input.documentId,
        extractionType: input.extractionType,
        extractedData,
        confidence: "85.00",
        reviewedBy: null,
        isApproved: false,
      });

      return { success: true, data: JSON.parse(extractedData as string) };
    }),

  // Classify document
  classifyDocument: protectedProcedure
    .input(z.object({
      documentId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const document = await db.getDocumentById(input.documentId);
      if (!document) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      }

      const prompt = `Classify this legal document into one of these categories:
- عقد (Contract)
- حكم (Judgment)
- مذكرة (Memorandum)
- لائحة (Petition)
- دليل (Evidence)
- مراسلات (Correspondence)

Document title: ${document.title}
Current category: ${document.category || "Unknown"}

Return the classification as JSON with category and confidence score.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a legal document classifier. Classify documents accurately." },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "classification_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                category: { type: "string" },
                confidence: { type: "number" }
              },
              required: ["category", "confidence"],
              additionalProperties: false
            }
          }
        }
      });

      const classificationContent = typeof response.choices[0]?.message?.content === 'string'
        ? response.choices[0].message.content
        : JSON.stringify(response.choices[0]?.message?.content || {});
      const classification = JSON.parse(classificationContent);
      
      // Update document category
      await db.updateDocument(input.documentId, {
        category: classification.category
      });

      // Save classification result
      await db.createAIExtraction({
        documentId: input.documentId,
        extractionType: "classification",
        extractedData: JSON.stringify(classification),
        confidence: classification.confidence?.toString() || "0",
        reviewedBy: null,
        isApproved: false,
      });

      return { success: true, classification };
    }),

  // Legal search
  legalSearch: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      context: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `Search for relevant Saudi Arabian laws and regulations related to: ${input.query}

${input.context ? `Context: ${input.context}` : ''}

Provide:
1. Relevant law articles
2. Brief explanation
3. Application to the query

Return as structured JSON.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a Saudi legal research assistant. Provide accurate legal information based on Saudi law." },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "legal_search_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                results: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      law_name: { type: "string" },
                      article_number: { type: "string" },
                      article_text: { type: "string" },
                      relevance: { type: "string" }
                    },
                    required: ["law_name", "article_number", "article_text", "relevance"],
                    additionalProperties: false
                  }
                }
              },
              required: ["results"],
              additionalProperties: false
            }
          }
        }
      });

      const resultsContent = typeof response.choices[0]?.message?.content === 'string'
        ? response.choices[0].message.content
        : JSON.stringify(response.choices[0]?.message?.content || {results: []});
      const results = JSON.parse(resultsContent);
      return { success: true, results: results.results };
    }),

  // Generate document draft
  generateDraft: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      variables: z.record(z.string(), z.string()),
    }))
    .mutation(async ({ input }) => {
      const template = await db.getLegalTemplateById(input.templateId);
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      // Replace variables in template
      let content = template.templateContent || "";
      for (const [key, value] of Object.entries(input.variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }

      // Use AI to enhance the draft
      const prompt = `Review and enhance this legal document draft. Ensure it is professional, legally sound, and complete.

Template: ${template.name}
Category: ${template.category}

Draft:
${content}

Return the enhanced draft.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a legal document drafting assistant. Enhance legal documents professionally." },
          { role: "user", content: prompt }
        ]
      });

      const enhancedDraft = typeof response.choices[0]?.message?.content === 'string'
        ? response.choices[0].message.content
        : content;

      return { success: true, draft: enhancedDraft };
    }),

  // Get AI extractions for document
  getExtractions: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ input }) => {
      return await db.getAIExtractionsByDocument(input.documentId);
    }),

  // Approve AI extraction
  approveExtraction: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.updateAIExtraction(input.id, {
        isApproved: true,
        reviewedBy: ctx.user.id,
      });
      return { success: true };
    }),
});

// ============= SHARED DOCUMENTS ROUTES =============
export const sharedDocsRouter = router({
  create: protectedProcedure
    .input(z.object({
      documentId: z.number(),
      clientId: z.number(),
      password: z.string().optional(),
      permissions: z.enum(["view", "download", "edit"]).default("view"),
      expiresAt: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const shareToken = nanoid(32);
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = input.password ? bcrypt.hashSync(input.password, salt) : null;

      await db.createSharedDocument({
        documentId: input.documentId,
        clientId: input.clientId,
        shareToken,
        password: hashedPassword,
        permissions: input.permissions,
        expiresAt: input.expiresAt || null,
        accessCount: 0,
        lastAccessedAt: null,
        createdBy: ctx.user.id,
      });

      return { success: true, shareToken, shareUrl: `/shared/${shareToken}` };
    }),

  getByToken: protectedProcedure
    .input(z.object({ 
      token: z.string(),
      password: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const shared = await db.getSharedDocumentByToken(input.token);
      if (!shared) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Shared document not found" });
      }

      // Check expiration
      if (shared.expiresAt && new Date(shared.expiresAt) < new Date()) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Share link has expired" });
      }

      // Check password
      if (shared.password) {
        if (!input.password) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Password required" });
        }
        const valid = bcrypt.compareSync(input.password, shared.password);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid password" });
        }
      }

      // Increment access count
      await db.incrementShareAccessCount(shared.id);

      // Log access
      await db.logDocumentAccess({
        documentId: shared.documentId,
        userId: null,
        clientId: shared.clientId,
        action: "view",
        ipAddress: null,
        userAgent: null,
      });

      // Get document
      const document = await db.getDocumentById(shared.documentId);
      
      return { 
        success: true, 
        document,
        permissions: shared.permissions,
      };
    }),

  getAccessLogs: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ input }) => {
      return await db.getDocumentAccessLogs(input.documentId);
    }),
});

// ============= LEGAL TEMPLATES ROUTES =============
export const templatesRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAllLegalTemplates();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const template = await db.getLegalTemplateById(input.id);
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }
      return template;
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional().nullable(),
      category: z.string(),
      content: z.string().min(1),
      variables: z.string().optional().nullable(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.createLegalTemplate({
        name: input.title,
        description: input.description || null,
        category: input.category,
        templateContent: input.content,
        variables: input.variables || null,
        isActive: true,
        createdBy: ctx.user.id,
      });

      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional().nullable(),
      category: z.string().optional(),
      templateContent: z.string().optional(),
      variables: z.string().optional().nullable(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateLegalTemplate(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteLegalTemplate(input.id);
      return { success: true };
    }),
});

// ============= REPORTS ROUTES =============
export const reportsRouter = router({
  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const cases = await db.getAllCases(ctx.user.id);
    const invoices = await db.getAllInvoices(ctx.user.id);
    const tasks = await db.getTasksByUser(ctx.user.id);

    const activeCases = cases.filter(c => c.status === 'active').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
    const unpaidInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

    return {
      activeCases,
      totalCases: cases.length,
      pendingTasks,
      totalTasks: tasks.length,
      unpaidInvoices: unpaidInvoices.length,
      unpaidAmount: unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0),
      totalRevenue,
      paidInvoices: invoices.filter(i => i.status === 'paid').length,
    };
  }),

  caseProfitability: protectedProcedure
    .input(z.object({ caseId: z.number() }))
    .query(async ({ input }) => {
      const timeEntries = await db.getTimeEntriesByCase(input.caseId);
      const expenses = await db.getExpensesByCase(input.caseId);
      
      const totalHours = timeEntries.reduce((sum, entry) => sum + parseFloat(entry.hours || "0"), 0);
      const totalRevenue = timeEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || "0"), 0);
      const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || "0"), 0);
      const profit = totalRevenue - totalExpenses;

      return {
        totalHours,
        totalRevenue,
        totalExpenses,
        profit,
        profitMargin: totalRevenue > 0 ? (profit / totalRevenue * 100).toFixed(2) : 0,
      };
    }),

  teamProductivity: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input, ctx }) => {
      const timeEntries = await db.getTimeEntriesByUser(ctx.user.id, input.startDate, input.endDate);
      const tasks = await db.getTasksByUser(ctx.user.id);
      
      const completedTasks = tasks.filter(t => 
        t.status === 'completed' && 
        t.completedAt && 
        new Date(t.completedAt) >= input.startDate && 
        new Date(t.completedAt) <= input.endDate
      );

      const totalHours = timeEntries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
      const billableHours = timeEntries
        .filter(e => e.isBillable)
        .reduce((sum, entry) => sum + parseFloat(entry.hours), 0);

      return {
        totalHours,
        billableHours,
        nonBillableHours: totalHours - billableHours,
        completedTasks: completedTasks.length,
        billablePercentage: totalHours > 0 ? (billableHours / totalHours * 100).toFixed(2) : 0,
      };
    }),
});
