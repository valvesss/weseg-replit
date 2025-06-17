import {
  contacts,
  pipelineLeads,
  policies,
  claims,
  documents,
  brokerProfile,
  users,
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
  type User,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (required for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

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
    this.initializeWithSampleData();
  }

  private initializeWithSampleData() {
    // Initialize with default broker profile
    this.brokerProfile = {
      id: 1,
      firstName: "Sarah",
      lastName: "Mitchell",
      email: "sarah.mitchell@insurepro.com",
      phone: "(555) 123-4567",
      address: "123 Insurance Plaza\nDowntown, CA 90210",
      licenseNumber: "INS-2024-001523",
      licenseExpiry: new Date("2025-12-31"),
      specializations: ["Auto Insurance", "Home Insurance", "Life Insurance"],
      experience: "5-10 years",
      profilePicture: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add sample contacts
    const sampleContacts = [
      {
        firstName: "Michael",
        lastName: "Johnson",
        email: "michael.johnson@email.com",
        phone: "(555) 234-5678",
        type: "individual" as const,
        address: "456 Oak Street, Springfield, IL 62701",
        lastContact: new Date("2024-06-10"),
      },
      {
        firstName: "Emma",
        lastName: "Davis",
        email: "emma.davis@email.com",
        phone: "(555) 345-6789",
        type: "individual" as const,
        address: "789 Pine Avenue, Chicago, IL 60601",
        lastContact: new Date("2024-06-15"),
      },
      {
        firstName: "TechCorp",
        lastName: "Solutions",
        email: "contact@techcorp.com",
        phone: "(555) 456-7890",
        type: "business" as const,
        address: "321 Business Blvd, Los Angeles, CA 90001",
        lastContact: new Date("2024-06-12"),
      },
      {
        firstName: "Robert",
        lastName: "Wilson",
        email: "robert.wilson@email.com",
        phone: "(555) 567-8901",
        type: "individual" as const,
        address: "654 Maple Drive, Phoenix, AZ 85001",
        lastContact: new Date("2024-06-08"),
      },
    ];

    sampleContacts.forEach(contact => {
      const id = this.currentId++;
      const newContact: Contact = {
        ...contact,
        id,
        address: contact.address || null,
        lastContact: contact.lastContact || null,
        createdAt: new Date(),
      };
      this.contacts.set(id, newContact);
    });

    // Add sample pipeline leads
    const sampleLeads = [
      {
        name: "Jennifer Martinez",
        email: "jennifer.martinez@email.com",
        phone: "(555) 678-9012",
        insuranceType: "auto" as const,
        annualPremium: "1200.00",
        status: "leads" as const,
        notes: "Interested in comprehensive auto coverage for new car purchase",
      },
      {
        name: "David Thompson",
        email: "david.thompson@email.com",
        phone: "(555) 789-0123",
        insuranceType: "home" as const,
        annualPremium: "2500.00",
        status: "qualified" as const,
        notes: "First-time homeowner, needs complete home insurance package",
      },
      {
        name: "Lisa Anderson",
        email: "lisa.anderson@email.com",
        phone: "(555) 890-1234",
        insuranceType: "life" as const,
        annualPremium: "1800.00",
        status: "proposal" as const,
        notes: "Looking for term life insurance, family of 4",
      },
      {
        name: "Global Manufacturing Inc",
        email: "insurance@globalmanuf.com",
        phone: "(555) 901-2345",
        insuranceType: "business" as const,
        annualPremium: "15000.00",
        status: "proposal" as const,
        notes: "Large manufacturing company seeking comprehensive business coverage",
      },
      {
        name: "Mark Rodriguez",
        email: "mark.rodriguez@email.com",
        phone: "(555) 012-3456",
        insuranceType: "auto" as const,
        annualPremium: "900.00",
        status: "closed" as const,
        notes: "Successfully closed - excellent driving record discount applied",
      },
    ];

    sampleLeads.forEach(lead => {
      const id = this.currentId++;
      const now = new Date();
      const newLead: PipelineLead = {
        ...lead,
        id,
        phone: lead.phone || null,
        annualPremium: lead.annualPremium || null,
        notes: lead.notes || null,
        createdAt: now,
        updatedAt: now,
      };
      this.pipelineLeads.set(id, newLead);
    });

    // Add sample policies
    const samplePolicies = [
      {
        policyNumber: "POL-2024-001234",
        contactId: 1,
        type: "auto" as const,
        premium: "1150.00",
        status: "active" as const,
        renewalDate: new Date("2025-03-15"),
      },
      {
        policyNumber: "POL-2024-001235",
        contactId: 2,
        type: "home" as const,
        premium: "2400.00",
        status: "active" as const,
        renewalDate: new Date("2025-01-20"),
      },
      {
        policyNumber: "POL-2024-001236",
        contactId: 3,
        type: "business" as const,
        premium: "8500.00",
        status: "active" as const,
        renewalDate: new Date("2024-12-31"),
      },
      {
        policyNumber: "POL-2023-009876",
        contactId: 4,
        type: "auto" as const,
        premium: "980.00",
        status: "expired" as const,
        renewalDate: new Date("2024-05-15"),
      },
    ];

    samplePolicies.forEach(policy => {
      const id = this.currentId++;
      const newPolicy: Policy = {
        ...policy,
        id,
        contactId: policy.contactId || null,
        createdAt: new Date(),
      };
      this.policies.set(id, newPolicy);
    });

    // Add sample claims
    const sampleClaims = [
      {
        claimId: "CLM-2024-5678",
        policyId: 1,
        contactId: 1,
        type: "auto" as const,
        amount: "3500.00",
        status: "open" as const,
        description: "Vehicle collision damage - rear-end accident on highway",
      },
      {
        claimId: "CLM-2024-5679",
        policyId: 2,
        contactId: 2,
        type: "home" as const,
        amount: "8200.00",
        status: "in_review" as const,
        description: "Water damage from burst pipe in basement",
      },
      {
        claimId: "CLM-2024-5680",
        policyId: 3,
        contactId: 3,
        type: "business" as const,
        amount: "25000.00",
        status: "approved" as const,
        description: "Equipment damage from electrical surge",
      },
      {
        claimId: "CLM-2024-5681",
        policyId: 1,
        contactId: 1,
        type: "auto" as const,
        amount: "1200.00",
        status: "closed" as const,
        description: "Windshield replacement due to rock chip",
      },
    ];

    sampleClaims.forEach(claim => {
      const id = this.currentId++;
      const now = new Date();
      const newClaim: Claim = {
        ...claim,
        id,
        contactId: claim.contactId || null,
        policyId: claim.policyId || null,
        description: claim.description || null,
        dateFiled: now,
        updatedAt: now,
      };
      this.claims.set(id, newClaim);
    });

    // Add sample documents
    const sampleDocuments = [
      {
        fileName: "policy-agreement-001234.pdf",
        originalName: "Auto Policy Agreement - Johnson.pdf",
        fileSize: 245760,
        mimeType: "application/pdf",
        category: "policies" as const,
        contactId: 1,
        policyId: 1,
        claimId: null,
      },
      {
        fileName: "claim-photos-5678.pdf",
        originalName: "Accident Photos - Vehicle Damage.pdf",
        fileSize: 1048576,
        mimeType: "application/pdf",
        category: "claims" as const,
        contactId: 1,
        policyId: null,
        claimId: 1,
      },
      {
        fileName: "home-inspection-report.pdf",
        originalName: "Home Inspection Report - Davis Property.pdf",
        fileSize: 512000,
        mimeType: "application/pdf",
        category: "policies" as const,
        contactId: 2,
        policyId: 2,
        claimId: null,
      },
      {
        fileName: "business-contract-2024.docx",
        originalName: "Business Insurance Contract - TechCorp.docx",
        fileSize: 98304,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        category: "contracts" as const,
        contactId: 3,
        policyId: 3,
        claimId: null,
      },
    ];

    sampleDocuments.forEach(document => {
      const id = this.currentId++;
      const newDocument: Document = {
        ...document,
        id,
        contactId: document.contactId || null,
        policyId: document.policyId || null,
        claimId: document.claimId || null,
        uploadedAt: new Date(),
      };
      this.documents.set(id, newDocument);
    });
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

export class DatabaseStorage implements IStorage {
  // User operations (required for authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // For now, keeping the existing MemStorage methods for other operations
  // These would be replaced with database operations in a full implementation
  private memStorage = new MemStorage();

  async getContacts(): Promise<Contact[]> {
    return this.memStorage.getContacts();
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.memStorage.getContact(id);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    return this.memStorage.createContact(contact);
  }

  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined> {
    return this.memStorage.updateContact(id, contact);
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.memStorage.deleteContact(id);
  }

  async getPipelineLeads(): Promise<PipelineLead[]> {
    return this.memStorage.getPipelineLeads();
  }

  async getPipelineLead(id: number): Promise<PipelineLead | undefined> {
    return this.memStorage.getPipelineLead(id);
  }

  async createPipelineLead(lead: InsertPipelineLead): Promise<PipelineLead> {
    return this.memStorage.createPipelineLead(lead);
  }

  async updatePipelineLead(id: number, lead: Partial<InsertPipelineLead>): Promise<PipelineLead | undefined> {
    return this.memStorage.updatePipelineLead(id, lead);
  }

  async deletePipelineLead(id: number): Promise<boolean> {
    return this.memStorage.deletePipelineLead(id);
  }

  async getPolicies(): Promise<Policy[]> {
    return this.memStorage.getPolicies();
  }

  async getPolicy(id: number): Promise<Policy | undefined> {
    return this.memStorage.getPolicy(id);
  }

  async createPolicy(policy: InsertPolicy): Promise<Policy> {
    return this.memStorage.createPolicy(policy);
  }

  async updatePolicy(id: number, policy: Partial<InsertPolicy>): Promise<Policy | undefined> {
    return this.memStorage.updatePolicy(id, policy);
  }

  async deletePolicy(id: number): Promise<boolean> {
    return this.memStorage.deletePolicy(id);
  }

  async getClaims(): Promise<Claim[]> {
    return this.memStorage.getClaims();
  }

  async getClaim(id: number): Promise<Claim | undefined> {
    return this.memStorage.getClaim(id);
  }

  async createClaim(claim: InsertClaim): Promise<Claim> {
    return this.memStorage.createClaim(claim);
  }

  async updateClaim(id: number, claim: Partial<InsertClaim>): Promise<Claim | undefined> {
    return this.memStorage.updateClaim(id, claim);
  }

  async deleteClaim(id: number): Promise<boolean> {
    return this.memStorage.deleteClaim(id);
  }

  async getDocuments(): Promise<Document[]> {
    return this.memStorage.getDocuments();
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.memStorage.getDocument(id);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    return this.memStorage.createDocument(document);
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.memStorage.deleteDocument(id);
  }

  async getBrokerProfile(): Promise<BrokerProfile | undefined> {
    return this.memStorage.getBrokerProfile();
  }

  async createOrUpdateBrokerProfile(profile: InsertBrokerProfile): Promise<BrokerProfile> {
    return this.memStorage.createOrUpdateBrokerProfile(profile);
  }
}

export const storage = new DatabaseStorage();
