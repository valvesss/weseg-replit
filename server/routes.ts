import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword, comparePassword, generateResetToken, sendResetPasswordEmail } from "./auth";
import {
  insertContactSchema,
  insertPipelineLeadSchema,
  insertPolicySchema,
  insertClaimSchema,
  insertDocumentSchema,
  insertBrokerProfileSchema,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@shared/schema";
import multer from "multer";
import path from "path";
import passport from "passport";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Login route
  app.post('/api/auth/login', (req, res, next) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({ message: 'Authentication error' });
        }
        if (!user) {
          return res.status(401).json({ message: info?.message || 'Invalid credentials' });
        }
        
        req.logIn(user, (err) => {
          if (err) {
            return res.status(500).json({ message: 'Login error' });
          }
          return res.json({ user, message: 'Login successful' });
        });
      })(req, res, next);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Register route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        isEmailVerified: false,
      });

      // Remove password from response
      const { password, ...userResponse } = user;
      res.status(201).json({ user: userResponse, message: 'User created successfully' });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: 'Registration failed' });
    }
  });

  // Forgot password route
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        // Don't reveal whether email exists
        return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
      }

      const resetToken = generateResetToken();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      await storage.updateUser(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      });

      try {
        await sendResetPasswordEmail(user.email, resetToken);
        res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        res.status(500).json({ message: 'Failed to send reset email' });
      }
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Reset password route
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(req.body.email);
      if (!user || 
          user.resetPasswordToken !== validatedData.token || 
          !user.resetPasswordExpires || 
          user.resetPasswordExpires < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      res.status(400).json({ message: 'Password reset failed' });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout error' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  // Contacts routes
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact data", error: error });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertContactSchema.partial().parse(req.body);
      const contact = await storage.updateContact(id, validatedData);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact data", error: error });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContact(id);
      if (!deleted) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Pipeline Leads routes
  app.get("/api/pipeline-leads", async (req, res) => {
    try {
      const leads = await storage.getPipelineLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pipeline leads" });
    }
  });

  app.post("/api/pipeline-leads", async (req, res) => {
    try {
      const validatedData = insertPipelineLeadSchema.parse(req.body);
      const lead = await storage.createPipelineLead(validatedData);
      res.status(201).json(lead);
    } catch (error) {
      res.status(400).json({ message: "Invalid pipeline lead data", error: error });
    }
  });

  app.put("/api/pipeline-leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPipelineLeadSchema.partial().parse(req.body);
      const lead = await storage.updatePipelineLead(id, validatedData);
      if (!lead) {
        return res.status(404).json({ message: "Pipeline lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: "Invalid pipeline lead data", error: error });
    }
  });

  app.delete("/api/pipeline-leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePipelineLead(id);
      if (!deleted) {
        return res.status(404).json({ message: "Pipeline lead not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete pipeline lead" });
    }
  });

  // Policies routes
  app.get("/api/policies", async (req, res) => {
    try {
      const policies = await storage.getPolicies();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });

  app.post("/api/policies", async (req, res) => {
    try {
      const validatedData = insertPolicySchema.parse(req.body);
      const policy = await storage.createPolicy(validatedData);
      res.status(201).json(policy);
    } catch (error) {
      res.status(400).json({ message: "Invalid policy data", error: error });
    }
  });

  app.put("/api/policies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPolicySchema.partial().parse(req.body);
      const policy = await storage.updatePolicy(id, validatedData);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }
      res.json(policy);
    } catch (error) {
      res.status(400).json({ message: "Invalid policy data", error: error });
    }
  });

  app.delete("/api/policies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePolicy(id);
      if (!deleted) {
        return res.status(404).json({ message: "Policy not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete policy" });
    }
  });

  // Claims routes
  app.get("/api/claims", async (req, res) => {
    try {
      const claims = await storage.getClaims();
      res.json(claims);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch claims" });
    }
  });

  app.post("/api/claims", async (req, res) => {
    try {
      const validatedData = insertClaimSchema.parse(req.body);
      const claim = await storage.createClaim(validatedData);
      res.status(201).json(claim);
    } catch (error) {
      res.status(400).json({ message: "Invalid claim data", error: error });
    }
  });

  app.put("/api/claims/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertClaimSchema.partial().parse(req.body);
      const claim = await storage.updateClaim(id, validatedData);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      res.json(claim);
    } catch (error) {
      res.status(400).json({ message: "Invalid claim data", error: error });
    }
  });

  app.delete("/api/claims/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClaim(id);
      if (!deleted) {
        return res.status(404).json({ message: "Claim not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete claim" });
    }
  });

  // Documents routes
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const documentData = {
        fileName: `${Date.now()}-${req.file.originalname}`,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        category: req.body.category || 'forms',
        contactId: req.body.contactId ? parseInt(req.body.contactId) : null,
        policyId: req.body.policyId ? parseInt(req.body.policyId) : null,
        claimId: req.body.claimId ? parseInt(req.body.claimId) : null,
      };

      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: "Failed to upload document", error: error });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDocument(id);
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Broker Profile routes
  app.get("/api/broker-profile", async (req, res) => {
    try {
      const profile = await storage.getBrokerProfile();
      if (!profile) {
        return res.status(404).json({ message: "Broker profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch broker profile" });
    }
  });

  app.put("/api/broker-profile", async (req, res) => {
    try {
      const validatedData = insertBrokerProfileSchema.parse(req.body);
      const profile = await storage.createOrUpdateBrokerProfile(validatedData);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid broker profile data", error: error });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      const policies = await storage.getPolicies();
      const claims = await storage.getClaims();
      const leads = await storage.getPipelineLeads();

      const activePolicies = policies.filter(p => p.status === 'active').length;
      const openClaims = claims.filter(c => c.status === 'open' || c.status === 'in_review').length;
      const newLeads = leads.filter(l => l.status === 'leads').length;
      
      // Calculate monthly revenue (sum of active policy premiums)
      const monthlyRevenue = policies
        .filter(p => p.status === 'active')
        .reduce((sum, p) => sum + parseFloat(p.premium.toString()), 0);

      const stats = {
        activePolicies,
        openClaims,
        monthlyRevenue,
        newLeads,
        totalClients: contacts.length,
        pendingClaims: claims.filter(c => c.status === 'in_review').length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
