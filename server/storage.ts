import {
  type User,
  type InsertUser,
  type MaintenanceIssue,
  type InsertMaintenanceIssue,
  type Technician,
  type InsertTechnician,
  type Comment,
  type InsertComment,
} from "@shared/schema";
import { CATEGORIES } from "@shared/categories";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Maintenance Issues
  getAllIssues(): Promise<(MaintenanceIssue & { reporter: User })[]>;
  getIssue(id: string): Promise<MaintenanceIssue | undefined>;
  createIssue(issue: InsertMaintenanceIssue): Promise<MaintenanceIssue>;
  updateIssue(
    id: string,
    updates: Partial<MaintenanceIssue>
  ): Promise<MaintenanceIssue | undefined>;
  deleteIssue(id: string): Promise<boolean>;

  // Technicians
  getAllTechnicians(): Promise<Technician[]>;
  getTechnician(id: string): Promise<Technician | undefined>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(
    id: string,
    updates: Partial<Technician>
  ): Promise<Technician | undefined>;

  // Comments
  getCommentsByIssueId(issueId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Upvotes
  toggleUpvote(
    issueId: string,
    userId: string
  ): Promise<{ upvoted: boolean; newCount: number }>;
}

// Helper function to get proper image URL based on environment
function getImageUrl(relativePath: string): string {
  // In production, return the full URL with the Railway domain
  if (process.env.NODE_ENV === "production") {
    const railwayUrl = process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : "https://web-production-14e5.up.railway.app";
    return `${railwayUrl}${relativePath}`;
  }
  return relativePath;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private issues: Map<string, MaintenanceIssue> = new Map();
  private technicians: Map<string, Technician> = new Map();
  private comments: Map<string, Comment> = new Map();
  private upvotes: Map<string, Set<string>> = new Map(); // issueId -> Set of userIds

  constructor() {
    this.seedData();
  }

  // Method to reset data to original sample posts only
  resetToOriginalSampleData() {
    // Clear all current data
    this.issues.clear();
    this.users.clear();
    this.technicians.clear();
    this.comments.clear();
    this.upvotes.clear();

    // Regenerate original sample data
    this.seedData();
  }

  private seedData() {
    // Create demo users
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      email: "admin@maintain.ai",
      role: "admin",
      credibilityScore: 9,
      firebaseUid: "admin-firebase-uid",
      createdAt: new Date(),
    };

    const regularUser: User = {
      id: randomUUID(),
      username: "user",
      email: "user@maintain.ai",
      role: "user",
      credibilityScore: 7,
      firebaseUid: "user-firebase-uid",
      createdAt: new Date(),
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(regularUser.id, regularUser);

    // Create demo technicians
    const technicians: Technician[] = [
      {
        id: randomUUID(),
        name: "John Smith",
        specialty: "Plumbing",
        status: "available",
        phone: "+1-555-0101",
        email: "john@maintain.ai",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Lisa Garcia",
        specialty: "Electrical",
        status: "busy",
        phone: "+1-555-0102",
        email: "lisa@maintain.ai",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Tom Wilson",
        specialty: "General",
        status: "available",
        phone: "+1-555-0103",
        email: "tom@maintain.ai",
        createdAt: new Date(),
      },
    ];

    technicians.forEach((tech) => this.technicians.set(tech.id, tech));

    // Create demo issues with pre-geocoded coordinates for Nizampet/Bachupally area
    // Format: "lat, lng" which the map can parse directly without geocoding
    const demoIssues: MaintenanceIssue[] = [
      {
        id: randomUUID(),
        title: "Dangerous pothole causing vehicle damage on MG Road",
        description:
          "Large pothole near City Center junction causing multiple two-wheelers to suffer tire damage. Vehicles are swerving dangerously to avoid it, creating risk of accidents. The damaged road surface is deteriorating rapidly.",
        category: CATEGORIES.ROADS_TRANSPORT,
        severity: "critical",
        status: "in_progress",
        progress: 72,
        location: "Nizampet Main Road", // Nizampet Main Road coordinates
        imageUrls: [getImageUrl("/sample-images/pothole on road.webp")],
        reporterId: regularUser.id,
        assignedTechnicianId: technicians[2].id,
        aiAnalysis: {
          domain: "Infrastructure & Road Safety",
          severity: "critical",
          confidence: 0.97,
          reasoning:
            "Image shows a large, deep pothole on a heavily trafficked arterial road. The depression appears to be approximately 3 feet in diameter with visible depth of 6-8 inches. Surface deterioration extends beyond the primary crater, indicating progressive asphalt failure. Location on high-traffic route creates immediate collision risk as vehicles must swerve into adjacent lanes. Dark water accumulation suggests drainage issues contributing to structural degradation.",
        },
        upvotes: 156,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Malfunctioning streetlights creating safety hazards",
        description:
          "Multiple streetlights flickering and non-functional along pedestrian pathway. Area becomes dangerously dark after sunset, forcing residents to avoid this route. Women and senior citizens feel unsafe using this path in evenings.",
        category: CATEGORIES.ELECTRICITY_LIGHTING,
        severity: "major",
        status: "assigned",
        progress: 35,
        location: "Bachupally Crossroads", // Bachupally Cross Roads coordinates
        imageUrls: [getImageUrl("/sample-images/flcikering streetlights.webp")],
        reporterId: adminUser.id,
        assignedTechnicianId: technicians[1].id,
        aiAnalysis: {
          domain: "Public Utilities & Safety",
          severity: "major",
          confidence: 0.94,
          reasoning:
            "Image captures flickering streetlight with visible electrical malfunction. The light fixture shows intermittent illumination patterns characteristic of ballast or wiring failure. Multiple non-functional units visible along the pathway create extended dark zones. The residential area location and pedestrian pathway context indicate this affects daily commuter safety and security, particularly during evening hours when lighting is critical for crime prevention and accident avoidance.",
        },
        upvotes: 89,
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Damaged traffic sign at school zone crossing",
        description:
          "Stop sign bent and barely visible at school pedestrian crossing. Hundreds of children use this crossing daily. Damaged signage fails to warn drivers properly, creating extreme danger for students crossing the road.",
        category: CATEGORIES.PUBLIC_SAFETY,
        severity: "critical",
        status: "open",
        progress: 8,
        location: "Nizampet X Roads", // Nizampet X Roads coordinates
        imageUrls: [getImageUrl("/sample-images/broken traffic sign.webp")],
        reporterId: regularUser.id,
        assignedTechnicianId: null,
        aiAnalysis: {
          domain: "Traffic Management & Child Safety",
          severity: "critical",
          confidence: 0.96,
          reasoning:
            "Image shows severely damaged stop sign with post bent at approximately 45-degree angle from vehicular impact. Sign face exhibits significant physical distortion and reduced reflectivity, compromising visibility from approaching vehicle distance. School zone location amplifies urgency as children depend on driver awareness of controlled crossing. The structural failure of mandatory traffic control device creates immediate liability and represents unacceptable pedestrian safety risk requiring emergency replacement.",
        },
        upvotes: 203,
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Overflowing trash bins attracting pests in park",
        description:
          "Park waste bins overflowing with garbage around children's play area. Attracting stray animals and insects, creating unhygienic conditions. Foul smell is unbearable during afternoons, discouraging families from using the park.",
        category: CATEGORIES.SANITATION_WASTE,
        severity: "moderate",
        status: "open",
        progress: 5,
        location: "JNTU Road, Bachupally", // Bachupally Road near JNTU coordinates
        imageUrls: [getImageUrl("/sample-images/trash in park.webp")],
        reporterId: adminUser.id,
        assignedTechnicianId: null,
        aiAnalysis: {
          domain: "Waste Management & Public Health",
          severity: "moderate",
          confidence: 0.88,
          reasoning:
            "Image reveals multiple overflowing waste receptacles with visible garbage accumulation exceeding container capacity. Scattered litter around bin perimeter indicates inadequate collection frequency and possible wildlife/pest activity. The park setting with visible recreational facilities suggests high public usage area where waste management failure impacts community health and aesthetics. While not immediately life-threatening, accumulated organic waste creates disease vector breeding grounds and degrades public space quality.",
        },
        upvotes: 42,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        updatedAt: new Date(),
      },
    ];

    demoIssues.forEach((issue) => this.issues.set(issue.id, issue));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "user",
      credibilityScore: insertUser.credibilityScore || 7,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Issue methods
  async getAllIssues(): Promise<(MaintenanceIssue & { reporter: User })[]> {
    const issues = Array.from(this.issues.values());
    const issuesWithReporter = await Promise.all(
      issues.map(async (issue) => {
        const reporter = await this.getUser(issue.reporterId);
        if (!reporter) {
          // Create a placeholder user for missing reporters
          return {
            ...issue,
            reporter: {
              id: issue.reporterId,
              username: "Unknown User",
              email: "unknown@maintain.ai",
              role: "user" as const,
              credibilityScore: 0,
              firebaseUid: "unknown",
              createdAt: new Date(),
            },
          };
        }
        return {
          ...issue,
          reporter,
        };
      })
    );
    return issuesWithReporter.sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getIssue(id: string): Promise<MaintenanceIssue | undefined> {
    return this.issues.get(id);
  }

  async createIssue(
    insertIssue: InsertMaintenanceIssue
  ): Promise<MaintenanceIssue> {
    const id = randomUUID();
    const issue: MaintenanceIssue = {
      ...insertIssue,
      id,
      status: "open",
      progress: 0,
      upvotes: 0,
      location: insertIssue.location || null,
      imageUrls: insertIssue.imageUrls || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.issues.set(id, issue);
    return issue;
  }

  async updateIssue(
    id: string,
    updates: Partial<MaintenanceIssue>
  ): Promise<MaintenanceIssue | undefined> {
    const issue = this.issues.get(id);
    if (!issue) return undefined;

    const updatedIssue = {
      ...issue,
      ...updates,
      updatedAt: new Date(),
    };
    this.issues.set(id, updatedIssue);
    return updatedIssue;
  }

  async deleteIssue(id: string): Promise<boolean> {
    return this.issues.delete(id);
  }

  async getUserIssues(
    userId: string
  ): Promise<(MaintenanceIssue & { reporter: User })[]> {
    const issues = Array.from(this.issues.values()).filter(
      (issue) => issue.reporterId === userId
    );
    return issues
      .map((issue) => ({
        ...issue,
        reporter: this.users.get(issue.reporterId)!,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      );
  }

  // Technician methods
  async getAllTechnicians(): Promise<Technician[]> {
    return Array.from(this.technicians.values());
  }

  async getTechnician(id: string): Promise<Technician | undefined> {
    return this.technicians.get(id);
  }

  async createTechnician(
    insertTechnician: InsertTechnician
  ): Promise<Technician> {
    const id = randomUUID();
    const technician: Technician = {
      ...insertTechnician,
      id,
      status: insertTechnician.status || "available",
      email: insertTechnician.email || null,
      phone: insertTechnician.phone || null,
      createdAt: new Date(),
    };
    this.technicians.set(id, technician);
    return technician;
  }

  async updateTechnician(
    id: string,
    updates: Partial<Technician>
  ): Promise<Technician | undefined> {
    const technician = this.technicians.get(id);
    if (!technician) return undefined;

    const updatedTechnician = { ...technician, ...updates };
    this.technicians.set(id, updatedTechnician);
    return updatedTechnician;
  }

  // Comment methods
  async getCommentsByIssueId(issueId: string): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.issueId === issueId
    );
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  // Upvote methods
  async toggleUpvote(
    issueId: string,
    userId: string
  ): Promise<{ upvoted: boolean; newCount: number }> {
    if (!this.upvotes.has(issueId)) {
      this.upvotes.set(issueId, new Set());
    }

    const userUpvotes = this.upvotes.get(issueId)!;
    const wasUpvoted = userUpvotes.has(userId);

    if (wasUpvoted) {
      userUpvotes.delete(userId);
    } else {
      userUpvotes.add(userId);
    }

    const issue = this.issues.get(issueId);
    if (issue) {
      issue.upvotes = userUpvotes.size;
      this.issues.set(issueId, issue);
    }

    return {
      upvoted: !wasUpvoted,
      newCount: userUpvotes.size,
    };
  }
}

export const storage = new MemStorage();
