import { pgTable, text, serial, integer, decimal, timestamp, boolean, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  type: text("type").notNull(), // 'individual' | 'business'
  address: text("address"),
  lastContact: timestamp("last_contact"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pipelineLeads = pgTable("pipeline_leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  insuranceType: text("insurance_type").notNull(), // 'auto', 'home', 'life', 'business'
  annualPremium: decimal("annual_premium", { precision: 10, scale: 2 }),
  status: text("status").notNull(), // 'leads', 'qualified', 'proposal', 'closed'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const policies = pgTable("policies", {
  id: serial("id").primaryKey(),
  policyNumber: text("policy_number").notNull().unique(),
  contactId: integer("contact_id").references(() => contacts.id),
  type: text("type").notNull(), // 'auto', 'home', 'life', 'business'
  premium: decimal("premium", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // 'active', 'expired', 'cancelled'
  renewalDate: timestamp("renewal_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  claimId: text("claim_id").notNull().unique(),
  policyId: integer("policy_id").references(() => policies.id),
  contactId: integer("contact_id").references(() => contacts.id),
  type: text("type").notNull(), // 'auto', 'home', 'life', 'business'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // 'open', 'in_review', 'approved', 'closed', 'denied'
  description: text("description"),
  dateFiled: timestamp("date_filed").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  category: text("category").notNull(), // 'policies', 'claims', 'contracts', 'forms'
  contactId: integer("contact_id").references(() => contacts.id),
  policyId: integer("policy_id").references(() => policies.id),
  claimId: integer("claim_id").references(() => claims.id),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const brokerProfile = pgTable("broker_profile", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  licenseNumber: text("license_number").notNull(),
  licenseExpiry: timestamp("license_expiry").notNull(),
  specializations: text("specializations").array(),
  experience: text("experience").notNull(),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertPipelineLeadSchema = createInsertSchema(pipelineLeads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPolicySchema = createInsertSchema(policies).omit({
  id: true,
  createdAt: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  dateFiled: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertBrokerProfileSchema = createInsertSchema(brokerProfile).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type PipelineLead = typeof pipelineLeads.$inferSelect;
export type InsertPipelineLead = z.infer<typeof insertPipelineLeadSchema>;

export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;

export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type BrokerProfile = typeof brokerProfile.$inferSelect;
export type InsertBrokerProfile = z.infer<typeof insertBrokerProfileSchema>;

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
