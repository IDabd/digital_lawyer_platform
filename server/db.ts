import { eq, desc, and, or, like, sql, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  clients, InsertClient,
  cases, InsertCase,
  documents, InsertDocument,
  caseActivities, InsertCaseActivity,
  tasks, InsertTask,
  timeEntries, InsertTimeEntry,
  expenses, InsertExpense,
  invoices, InsertInvoice,
  sharedDocuments, InsertSharedDocument,
  documentAccessLog, InsertDocumentAccessLog,
  calendarEvents, InsertCalendarEvent,
  notifications, InsertNotification,
  aiExtractions, InsertAIExtraction,
  legalTemplates, InsertLegalTemplate,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER OPERATIONS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "avatar"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllLawyers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users).where(or(eq(users.role, 'lawyer'), eq(users.role, 'admin')));
}

// ============= CLIENT OPERATIONS =============

export async function createClient(client: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(clients).values(client);
  return result;
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllClients(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(clients).where(eq(clients.createdBy, userId)).orderBy(desc(clients.createdAt));
}

export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(clients).set(data).where(eq(clients.id, id));
}

export async function searchClients(query: string, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(clients).where(
    and(
      eq(clients.createdBy, userId),
      or(
        like(clients.name, `%${query}%`),
        like(clients.email, `%${query}%`),
        like(clients.phone, `%${query}%`)
      )
    )
  );
}

// ============= CASE OPERATIONS =============

export async function createCase(caseData: InsertCase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(cases).values(caseData);
  return result;
}

export async function getCaseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(cases).where(eq(cases.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCases(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(cases)
    .where(or(eq(cases.createdBy, userId), eq(cases.assignedTo, userId)))
    .orderBy(desc(cases.createdAt));
}

export async function getCasesByStatus(status: string, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(cases).where(
    and(
      or(eq(cases.createdBy, userId), eq(cases.assignedTo, userId)),
      eq(cases.status, status as any)
    )
  ).orderBy(desc(cases.createdAt));
}

export async function updateCase(id: number, data: Partial<InsertCase>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(cases).set(data).where(eq(cases.id, id));
}

export async function searchCases(query: string, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(cases).where(
    and(
      or(eq(cases.createdBy, userId), eq(cases.assignedTo, userId)),
      or(
        like(cases.caseNumber, `%${query}%`),
        like(cases.title, `%${query}%`),
        like(cases.description, `%${query}%`)
      )
    )
  );
}

// ============= DOCUMENT OPERATIONS =============

export async function createDocument(doc: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(documents).values(doc);
  return result;
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(documents).where(
    and(eq(documents.id, id), eq(documents.isDeleted, false))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllDocuments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(documents).where(eq(documents.uploadedBy, userId)).orderBy(desc(documents.createdAt));
}

export async function getDocumentsByCase(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(documents).where(
    and(eq(documents.caseId, caseId), eq(documents.isDeleted, false))
  ).orderBy(desc(documents.createdAt));
}

export async function updateDocument(id: number, data: Partial<InsertDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(documents).set(data).where(eq(documents.id, id));
}

export async function softDeleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(documents).set({ 
    isDeleted: true, 
    deletedAt: new Date() 
  }).where(eq(documents.id, id));
}

export async function searchDocuments(query: string, caseId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    eq(documents.isDeleted, false),
    or(
      like(documents.title, `%${query}%`),
      like(documents.description, `%${query}%`),
      like(documents.fileName, `%${query}%`)
    )
  ];
  
  if (caseId) {
    conditions.push(eq(documents.caseId, caseId));
  }
  
  return await db.select().from(documents).where(and(...conditions));
}

// ============= CASE ACTIVITY OPERATIONS =============

export async function createCaseActivity(activity: InsertCaseActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(caseActivities).values(activity);
}

export async function getCaseActivities(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(caseActivities)
    .where(eq(caseActivities.caseId, caseId))
    .orderBy(desc(caseActivities.createdAt));
}

// ============= TASK OPERATIONS =============

export async function createTask(task: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tasks).values(task);
  return result;
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTasksByCase(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tasks)
    .where(eq(tasks.caseId, caseId))
    .orderBy(desc(tasks.createdAt));
}

export async function getTasksByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tasks)
    .where(eq(tasks.assignedTo, userId))
    .orderBy(desc(tasks.createdAt));
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(tasks).set(data).where(eq(tasks.id, id));
}

// ============= TIME ENTRY OPERATIONS =============

export async function createTimeEntry(entry: InsertTimeEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(timeEntries).values(entry);
  return result;
}

export async function getTimeEntriesByCase(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(timeEntries)
    .where(eq(timeEntries.caseId, caseId))
    .orderBy(desc(timeEntries.date));
}

export async function getTimeEntriesByUser(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(timeEntries.userId, userId)];
  if (startDate) conditions.push(gte(timeEntries.date, startDate));
  if (endDate) conditions.push(lte(timeEntries.date, endDate));
  
  return await db.select().from(timeEntries)
    .where(and(...conditions))
    .orderBy(desc(timeEntries.date));
}

export async function updateTimeEntry(id: number, data: Partial<InsertTimeEntry>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(timeEntries).set(data).where(eq(timeEntries.id, id));
}

// ============= EXPENSE OPERATIONS =============

export async function createExpense(expense: InsertExpense) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(expenses).values(expense);
  return result;
}

export async function getExpensesByCase(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(expenses)
    .where(eq(expenses.caseId, caseId))
    .orderBy(desc(expenses.date));
}

export async function updateExpense(id: number, data: Partial<InsertExpense>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(expenses).set(data).where(eq(expenses.id, id));
}

// ============= INVOICE OPERATIONS =============

export async function createInvoice(invoice: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(invoices).values(invoice);
  return result;
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllInvoices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(invoices)
    .where(eq(invoices.createdBy, userId))
    .orderBy(desc(invoices.createdAt));
}

export async function getInvoicesByStatus(status: string, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(invoices).where(
    and(
      eq(invoices.createdBy, userId),
      eq(invoices.status, status as any)
    )
  ).orderBy(desc(invoices.createdAt));
}

export async function updateInvoice(id: number, data: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(invoices).set(data).where(eq(invoices.id, id));
}

// ============= CALENDAR EVENT OPERATIONS =============

export async function createCalendarEvent(event: InsertCalendarEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(calendarEvents).values(event);
  return result;
}

export async function getCalendarEvents(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(calendarEvents.createdBy, userId)];
  if (startDate) conditions.push(gte(calendarEvents.startTime, startDate));
  if (endDate) conditions.push(lte(calendarEvents.startTime, endDate));
  
  return await db.select().from(calendarEvents)
    .where(and(...conditions))
    .orderBy(calendarEvents.startTime);
}

export async function updateCalendarEvent(id: number, data: Partial<InsertCalendarEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(calendarEvents).set(data).where(eq(calendarEvents.id, id));
}

// ============= NOTIFICATION OPERATIONS =============

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(notifications).values(notification);
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  
  return result[0]?.count || 0;
}

// ============= SHARED DOCUMENT OPERATIONS =============

export async function createSharedDocument(share: InsertSharedDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(sharedDocuments).values(share);
  return result;
}

export async function getSharedDocumentByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(sharedDocuments)
    .where(eq(sharedDocuments.shareToken, token))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function incrementShareAccessCount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(sharedDocuments).set({
    accessCount: sql`${sharedDocuments.accessCount} + 1`,
    lastAccessedAt: new Date()
  }).where(eq(sharedDocuments.id, id));
}

// ============= DOCUMENT ACCESS LOG OPERATIONS =============

export async function logDocumentAccess(log: InsertDocumentAccessLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(documentAccessLog).values(log);
}

export async function getDocumentAccessLogs(documentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(documentAccessLog)
    .where(eq(documentAccessLog.documentId, documentId))
    .orderBy(desc(documentAccessLog.createdAt))
    .limit(100);
}

// ============= AI EXTRACTION OPERATIONS =============

export async function createAIExtraction(extraction: InsertAIExtraction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(aiExtractions).values(extraction);
  return result;
}

export async function getAIExtractionsByDocument(documentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(aiExtractions)
    .where(eq(aiExtractions.documentId, documentId))
    .orderBy(desc(aiExtractions.createdAt));
}

export async function updateAIExtraction(id: number, data: Partial<InsertAIExtraction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(aiExtractions).set(data).where(eq(aiExtractions.id, id));
}

// ============= LEGAL TEMPLATE OPERATIONS =============

export async function createLegalTemplate(template: InsertLegalTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(legalTemplates).values(template);
  return result;
}

export async function getAllLegalTemplates() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(legalTemplates)
    .where(eq(legalTemplates.isActive, true))
    .orderBy(desc(legalTemplates.createdAt));
}

export async function getLegalTemplateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(legalTemplates)
    .where(and(eq(legalTemplates.id, id), eq(legalTemplates.isActive, true)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateLegalTemplate(id: number, data: Partial<InsertLegalTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(legalTemplates).set(data).where(eq(legalTemplates.id, id));
}
