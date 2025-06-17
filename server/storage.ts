import {
  contacts,
  pipelineLeads,
  policies,
  claims,
  documents,
  brokerProfile,
  type Contact,
  type InsertContact,
  type PipelineLead,
  type InsertPipelineLead,
  type Policy,
  type InsertPolicy,
  type Claim,
  type InsertClaim,
  type Document,
  type InsertDocument,
  type BrokerProfile,
  type InsertBrokerProfile,
} from "@shared/schema";

export interface IStorage {
  // Contacts
  getContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;

  // Pipeline Leads
  getPipelineLeads(): Promise<PipelineLead[]>;
  getPipelineLead(id: number): Promise<PipelineLead | undefined>;
  createPipelineLead(lead: InsertPipelineLead): Promise<PipelineLead>;
  updatePipelineLead(id: number, lead: Partial<InsertPipelineLead>): Promise<PipelineLead | undefined>;
  deletePipelineLead(id: number): Promise<boolean>;

  // Policies
  getPolicies(): Promise<Policy[]>;
  getPolicy(id: number): Promise<Policy | undefined>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  updatePolicy(id: number, policy: Partial<InsertPolicy>): Promise<Policy | undefined>;
  deletePolicy(id: number): Promise<boolean>;

  // Claims
  getClaims(): Promise<Claim[]>;
  getClaim(id: number): Promise<Claim | undefined>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaim(id: number, claim: Partial<InsertClaim>): Promise<Claim | undefined>;
  deleteClaim(id: number): Promise<boolean>;

  // Documents
  getDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;

  // Broker Profile
  getBrokerProfile(): Promise<BrokerProfile | undefined>;
  createOrUpdateBrokerProfile(profile: InsertBrokerProfile): Promise<BrokerProfile>;
}

export class MemStorage implements IStorage {
  private contacts: Map<number, Contact> = new Map();
  private pipelineLeads: Map<number, PipelineLead> = new Map();
  private policies: Map<number, Policy> = new Map();
  private claims: Map<number, Claim> = new Map();
  private documents: Map<number, Document> = new Map();
  private brokerProfile: BrokerProfile | undefined;
  private currentId = 1;

  constructor() {
    // Initialize with default broker profile
    this.brokerProfile = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "(555) 123-4567",
      address: "123 Insurance Street\nCity, State 12345",
      licenseNumber: "INS-2024-001523",
      licenseExpiry: new Date("2025-12-31"),
      specializations: ["Auto Insurance", "Home Insurance"],
      experience: "5-10 years",
      profilePicture: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.currentId++;
    const newContact: Contact = {
      ...contact,
      id,
      createdAt: new Date(),
    };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined> {
    const existing = this.contacts.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...contact };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // Pipeline Leads
  async getPipelineLeads(): Promise<PipelineLead[]> {
    return Array.from(this.pipelineLeads.values());
  }

  async getPipelineLead(id: number): Promise<PipelineLead | undefined> {
    return this.pipelineLeads.get(id);
  }

  async createPipelineLead(lead: InsertPipelineLead): Promise<PipelineLead> {
    const id = this.currentId++;
    const now = new Date();
    const newLead: PipelineLead = {
      ...lead,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.pipelineLeads.set(id, newLead);
    return newLead;
  }

  async updatePipelineLead(id: number, lead: Partial<InsertPipelineLead>): Promise<PipelineLead | undefined> {
    const existing = this.pipelineLeads.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...lead, updatedAt: new Date() };
    this.pipelineLeads.set(id, updated);
    return updated;
  }

  async deletePipelineLead(id: number): Promise<boolean> {
    return this.pipelineLeads.delete(id);
  }

  // Policies
  async getPolicies(): Promise<Policy[]> {
    return Array.from(this.policies.values());
  }

  async getPolicy(id: number): Promise<Policy | undefined> {
    return this.policies.get(id);
  }

  async createPolicy(policy: InsertPolicy): Promise<Policy> {
    const id = this.currentId++;
    const newPolicy: Policy = {
      ...policy,
      id,
      createdAt: new Date(),
    };
    this.policies.set(id, newPolicy);
    return newPolicy;
  }

  async updatePolicy(id: number, policy: Partial<InsertPolicy>): Promise<Policy | undefined> {
    const existing = this.policies.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...policy };
    this.policies.set(id, updated);
    return updated;
  }

  async deletePolicy(id: number): Promise<boolean> {
    return this.policies.delete(id);
  }

  // Claims
  async getClaims(): Promise<Claim[]> {
    return Array.from(this.claims.values());
  }

  async getClaim(id: number): Promise<Claim | undefined> {
    return this.claims.get(id);
  }

  async createClaim(claim: InsertClaim): Promise<Claim> {
    const id = this.currentId++;
    const now = new Date();
    const newClaim: Claim = {
      ...claim,
      id,
      dateFiled: now,
      updatedAt: now,
    };
    this.claims.set(id, newClaim);
    return newClaim;
  }

  async updateClaim(id: number, claim: Partial<InsertClaim>): Promise<Claim | undefined> {
    const existing = this.claims.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...claim, updatedAt: new Date() };
    this.claims.set(id, updated);
    return updated;
  }

  async deleteClaim(id: number): Promise<boolean> {
    return this.claims.delete(id);
  }

  // Documents
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.currentId++;
    const newDocument: Document = {
      ...document,
      id,
      uploadedAt: new Date(),
    };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Broker Profile
  async getBrokerProfile(): Promise<BrokerProfile | undefined> {
    return this.brokerProfile;
  }

  async createOrUpdateBrokerProfile(profile: InsertBrokerProfile): Promise<BrokerProfile> {
    const now = new Date();
    if (this.brokerProfile) {
      this.brokerProfile = {
        ...this.brokerProfile,
        ...profile,
        updatedAt: now,
      };
    } else {
      this.brokerProfile = {
        ...profile,
        id: 1,
        createdAt: now,
        updatedAt: now,
      };
    }
    return this.brokerProfile;
  }
}

export const storage = new MemStorage();
