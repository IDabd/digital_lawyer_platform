import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "lawyer", "client"]).default("user").notNull(),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Clients table - represents law firm clients
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  nationalId: varchar("nationalId", { length: 20 }),
  companyName: text("companyName"),
  companyRegistration: varchar("companyRegistration", { length: 50 }),
  type: mysqlEnum("type", ["individual", "company"]).default("individual").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  notes: text("notes"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  phoneIdx: index("phone_idx").on(table.phone),
}));

/**
 * Cases table - represents legal cases
 */
export const cases = mysqlTable("cases", {
  id: int("id").autoincrement().primaryKey(),
  caseNumber: varchar("caseNumber", { length: 50 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  clientId: int("clientId").notNull(),
  caseType: varchar("caseType", { length: 100 }).notNull(), // e.g., "تجاري", "جنائي", "مدني"
  status: mysqlEnum("status", ["active", "pending", "closed", "archived"]).default("active").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  court: text("court"),
  judge: text("judge"),
  opposingParty: text("opposingParty"),
  opposingLawyer: text("opposingLawyer"),
  filingDate: timestamp("filingDate"),
  hearingDate: timestamp("hearingDate"),
  closingDate: timestamp("closingDate"),
  assignedTo: int("assignedTo"), // lawyer user id
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  caseNumberIdx: index("case_number_idx").on(table.caseNumber),
  clientIdx: index("client_idx").on(table.clientId),
  statusIdx: index("status_idx").on(table.status),
}));

/**
 * Documents table - represents case documents
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  fileKey: text("fileKey").notNull(), // S3 key
  fileUrl: text("fileUrl").notNull(), // S3 URL
  fileName: text("fileName").notNull(),
  fileSize: int("fileSize").notNull(), // in bytes
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }), // e.g., "عقد", "حكم", "مذكرة"
  tags: text("tags"), // JSON array of tags
  version: int("version").default(1).notNull(),
  parentDocumentId: int("parentDocumentId"), // for versioning
  uploadedBy: int("uploadedBy").notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  caseIdx: index("case_idx").on(table.caseId),
  categoryIdx: index("category_idx").on(table.category),
}));

/**
 * Case activities table - audit log for case changes
 */
export const caseActivities = mysqlTable("case_activities", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  userId: int("userId").notNull(),
  activityType: varchar("activityType", { length: 50 }).notNull(), // e.g., "created", "updated", "status_changed"
  description: text("description").notNull(),
  metadata: text("metadata"), // JSON for additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  caseIdx: index("case_idx").on(table.caseId),
  userIdx: index("user_idx").on(table.userId),
}));

/**
 * Tasks table - represents tasks within cases
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: int("assignedTo"), // user id
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  caseIdx: index("case_idx").on(table.caseId),
  assignedIdx: index("assigned_idx").on(table.assignedTo),
  statusIdx: index("status_idx").on(table.status),
}));

/**
 * Time entries table - for time tracking
 */
export const timeEntries = mysqlTable("time_entries", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  userId: int("userId").notNull(),
  description: text("description").notNull(),
  hours: decimal("hours", { precision: 5, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }), // hourly rate
  amount: decimal("amount", { precision: 10, scale: 2 }), // calculated amount
  date: timestamp("date").notNull(),
  isBillable: boolean("isBillable").default(true).notNull(),
  invoiceId: int("invoiceId"), // null if not yet invoiced
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  caseIdx: index("case_idx").on(table.caseId),
  userIdx: index("user_idx").on(table.userId),
  invoiceIdx: index("invoice_idx").on(table.invoiceId),
}));

/**
 * Expenses table - for case expenses
 */
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  userId: int("userId").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }), // e.g., "رسوم محكمة", "سفر"
  date: timestamp("date").notNull(),
  receiptUrl: text("receiptUrl"), // S3 URL for receipt
  isBillable: boolean("isBillable").default(true).notNull(),
  invoiceId: int("invoiceId"), // null if not yet invoiced
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  caseIdx: index("case_idx").on(table.caseId),
  userIdx: index("user_idx").on(table.userId),
  invoiceIdx: index("invoice_idx").on(table.invoiceId),
}));

/**
 * Invoices table
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  caseId: int("caseId").notNull(),
  clientId: int("clientId").notNull(),
  status: mysqlEnum("status", ["draft", "pending", "sent", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("taxRate", { precision: 5, scale: 2 }).default("15.00").notNull(), // VAT 15%
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  dueDate: timestamp("dueDate"),
  paidDate: timestamp("paidDate"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  invoiceNumberIdx: index("invoice_number_idx").on(table.invoiceNumber),
  caseIdx: index("case_idx").on(table.caseId),
  clientIdx: index("client_idx").on(table.clientId),
  statusIdx: index("status_idx").on(table.status),
}));

/**
 * Shared documents table - for secure client document sharing
 */
export const sharedDocuments = mysqlTable("shared_documents", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  clientId: int("clientId").notNull(),
  shareToken: varchar("shareToken", { length: 64 }).notNull().unique(),
  password: varchar("password", { length: 255 }), // hashed password
  permissions: mysqlEnum("permissions", ["view", "download", "edit"]).default("view").notNull(),
  expiresAt: timestamp("expiresAt"),
  accessCount: int("accessCount").default(0).notNull(),
  lastAccessedAt: timestamp("lastAccessedAt"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tokenIdx: index("token_idx").on(table.shareToken),
  documentIdx: index("document_idx").on(table.documentId),
}));

/**
 * Document access log - audit trail for document access
 */
export const documentAccessLog = mysqlTable("document_access_log", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  userId: int("userId"),
  clientId: int("clientId"),
  action: varchar("action", { length: 50 }).notNull(), // "view", "download", "share"
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  documentIdx: index("document_idx").on(table.documentId),
}));

/**
 * Calendar events table - for appointments and hearings
 */
export const calendarEvents = mysqlTable("calendar_events", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId"),
  title: text("title").notNull(),
  description: text("description"),
  eventType: mysqlEnum("eventType", ["hearing", "meeting", "deadline", "consultation", "other"]).default("other").notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(),
  location: text("location"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  attendees: text("attendees"),
  reminderMinutes: int("reminderMinutes").default(30),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  caseIdx: index("case_idx").on(table.caseId),
  startIdx: index("start_idx").on(table.startDate),
}));

/**
 * Notifications table
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "case_update", "task_assigned", "invoice_due"
  relatedId: int("relatedId"), // case id, task id, etc.
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  readIdx: index("read_idx").on(table.isRead),
}));

/**
 * AI extraction results table - stores AI-extracted data from documents
 */
export const aiExtractions = mysqlTable("ai_extractions", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  extractionType: varchar("extractionType", { length: 50 }).notNull(), // "entities", "classification", "summary"
  extractedData: text("extractedData").notNull(), // JSON with extracted information
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // 0-100
  reviewedBy: int("reviewedBy"),
  isApproved: boolean("isApproved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  documentIdx: index("document_idx").on(table.documentId),
}));

/**
 * Legal templates table - for document automation
 */
export const legalTemplates = mysqlTable("legal_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // "عقد", "لائحة", "مذكرة"
  templateContent: text("templateContent").notNull(), // Template with placeholders
  variables: text("variables"), // JSON array of variable definitions or simple string
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdCases: many(cases, { relationName: "createdBy" }),
  assignedCases: many(cases, { relationName: "assignedTo" }),
  timeEntries: many(timeEntries),
  expenses: many(expenses),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  cases: many(cases),
  invoices: many(invoices),
}));

export const casesRelations = relations(cases, ({ one, many }) => ({
  client: one(clients, {
    fields: [cases.clientId],
    references: [clients.id],
  }),
  assignedLawyer: one(users, {
    fields: [cases.assignedTo],
    references: [users.id],
    relationName: "assignedTo",
  }),
  creator: one(users, {
    fields: [cases.createdBy],
    references: [users.id],
    relationName: "createdBy",
  }),
  documents: many(documents),
  activities: many(caseActivities),
  tasks: many(tasks),
  timeEntries: many(timeEntries),
  expenses: many(expenses),
  invoices: many(invoices),
  events: many(calendarEvents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  case: one(cases, {
    fields: [documents.caseId],
    references: [cases.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
  parentDocument: one(documents, {
    fields: [documents.parentDocumentId],
    references: [documents.id],
  }),
  versions: many(documents, { relationName: "versions" }),
  sharedLinks: many(sharedDocuments),
  accessLog: many(documentAccessLog),
  aiExtractions: many(aiExtractions),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  case: one(cases, {
    fields: [invoices.caseId],
    references: [cases.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  timeEntries: many(timeEntries),
  expenses: many(expenses),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;
export type Case = typeof cases.$inferSelect;
export type InsertCase = typeof cases.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type CaseActivity = typeof caseActivities.$inferSelect;
export type InsertCaseActivity = typeof caseActivities.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = typeof timeEntries.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type SharedDocument = typeof sharedDocuments.$inferSelect;
export type InsertSharedDocument = typeof sharedDocuments.$inferInsert;
export type DocumentAccessLog = typeof documentAccessLog.$inferSelect;
export type InsertDocumentAccessLog = typeof documentAccessLog.$inferInsert;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type AIExtraction = typeof aiExtractions.$inferSelect;
export type InsertAIExtraction = typeof aiExtractions.$inferInsert;
export type LegalTemplate = typeof legalTemplates.$inferSelect;
export type InsertLegalTemplate = typeof legalTemplates.$inferInsert;
