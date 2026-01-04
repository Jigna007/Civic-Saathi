import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaintenanceIssue, User, Technician } from "@shared/schema";
import { CATEGORIES, getCategoryColors } from "@shared/categories";
import { formatDistanceToNow } from "date-fns";
import {
  Building2,
  Users,
  UserCheck,
  Star,
  TrendingUp,
  FileText,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [showDomainDetails, setShowDomainDetails] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<MaintenanceIssue | null>(
    null
  );

  const { data: issues } = useQuery<(MaintenanceIssue & { reporter: User })[]>({
    queryKey: ["/api/issues"],
  });

  const { data: technicians = [] } = useQuery<Technician[]>({
    queryKey: ["/api/technicians"],
  });

  // Mock domains for demonstration
  const domains = [
    {
      id: "1",
      name: "North Campus",
      buildings: 8,
      totalIssues: 23,
      activeIssues: 12,
      resolvedIssues: 11,
      avgResolutionTime: "2.3 days",
    },
    {
      id: "2",
      name: "South Campus",
      buildings: 6,
      totalIssues: 18,
      activeIssues: 7,
      resolvedIssues: 11,
      avgResolutionTime: "1.8 days",
    },
    {
      id: "3",
      name: "Residential Complex",
      buildings: 12,
      totalIssues: 34,
      activeIssues: 15,
      resolvedIssues: 19,
      avgResolutionTime: "3.1 days",
    },
  ];

  const stats = {
    total: issues?.length || 0,
    critical: issues?.filter((i: MaintenanceIssue) => i.severity === "critical").length || 0,
    high: issues?.filter((i: MaintenanceIssue) => i.severity === "high").length || 0,
    inProgress: issues?.filter((i: MaintenanceIssue) => i.status === "in_progress").length || 0,
    completed: issues?.filter((i: MaintenanceIssue) => i.status === "resolved").length || 0,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-600 text-white";
      case "major":
        return "bg-red-400 text-white";
      case "moderate":
        return "bg-orange-500 text-white";
      case "minor":
        return "bg-yellow-400 text-gray-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-purple-100 text-purple-800";
      case "open":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTechnicianEffectiveness = (techId: string) => {
    const techIssues =
      issues?.filter((i: MaintenanceIssue) => i.assignedTechnicianId === techId) || [];
    const resolved = techIssues.filter((i: MaintenanceIssue) => i.status === "resolved").length;
    const total = techIssues.length;
    return total > 0 ? Math.round((resolved / total) * 100) : 0;
  };

  const handleIssueAction = (action: string, issue: MaintenanceIssue) => {
    console.log(`${action} action on issue:`, issue.id);
    // Implementation for edit, view, delete actions
  };

  const selectedDomainData = domains.find((d) => d.id === selectedDomain);
  const domainTechnicians = selectedDomain
    ? technicians.filter((t: Technician) =>
      // Mock filter - in real app, technicians would be assigned to domains
      t.specialty
        .toLowerCase()
        .includes(selectedDomainData?.name.toLowerCase().split(" ")[0] || "")
    )
    : [];

  return (
    <div className="container-centered section-spacing animate-fade-in">
      {/* Hero Header with Gradient */}
      <div className="mb-8 rounded-2xl bg-admin-gradient p-6 sm:p-8 text-gray-900 shadow-sm hover-glow">
        <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
          <div>
            <h1 className="heading-primary flex items-center space-x-3 text-admin-dark">
              <ClipboardList className="text-admin-mid" size={32} />
              <span>Admin Dashboard</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-700">
              Comprehensive maintenance management and oversight
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card className="admin-card hover-lift animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <FileText className="h-4 w-4 text-admin-mid" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-admin-dark">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground">All time reports</p>
          </CardContent>
        </Card>

        <Card className="admin-card hover-lift animate-slide-up [animation-delay:60ms]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.critical}
            </div>
            <p className="text-xs text-muted-foreground">
              Urgent attention needed
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card hover-lift animate-slide-up [animation-delay:120ms]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.high}
            </div>
            <p className="text-xs text-muted-foreground">
              High priority issues
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card hover-lift animate-slide-up [animation-delay:180ms]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.inProgress}
            </div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>

        <Card className="admin-card hover-lift animate-slide-up [animation-delay:240ms]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0}
              % completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="issues" className="space-y-6 animate-fade-in">
        <TabsList className="w-full flex flex-col h-auto sm:grid sm:grid-cols-3 gap-2 sm:gap-0">
          <TabsTrigger value="issues" className="w-full">All Issues</TabsTrigger>
          <TabsTrigger value="departments" className="w-full">Departments</TabsTrigger>
          <TabsTrigger value="technicians" className="w-full">Technicians</TabsTrigger>
        </TabsList>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-6">
          <Card className="admin-card hover-glow">
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues?.slice(0, 10).map((issue: MaintenanceIssue & { reporter?: User }) => (
                  <div
                    key={issue.id}
                    className="p-4 border border-gray-200 rounded-lg transition-colors hover:bg-gray-50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-medium truncate pr-2">
                            {issue.title}
                          </h4>
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            <span>
                              {issue.reporter?.username ?? "Unknown Reporter"}
                            </span>
                          </span>

                          {issue.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span className="truncate">{issue.location}</span>
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>
                              {formatDistanceToNow(new Date(issue.createdAt!), {
                                addSuffix: true,
                              })}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center sm:items-end gap-2 sm:gap-3">
                        <div className="text-right mr-1 sm:mr-2">
                          <div className="text-xs text-gray-600">Progress</div>
                          <div className="text-base font-bold">
                            {issue.progress}%
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="hover-lift"
                          onClick={() => handleIssueAction("view", issue)}
                        >
                          <Eye size={14} />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="hover-lift"
                          onClick={() => handleIssueAction("edit", issue)}
                        >
                          <Edit size={14} />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIssueAction("delete", issue)}
                          className="text-red-600 hover:text-red-700 hover-lift"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6 animate-fade-in">
          {(() => {
            try {
              // Define departments and matching keywords
              // 8 standard categories matching shared/categories.ts
              const departments = [
                {
                  key: CATEGORIES.ROADS_TRANSPORT,
                  name: CATEGORIES.ROADS_TRANSPORT,
                  desc: "Handles potholes, traffic signals, road damage, highways, streets, and transport-related infrastructure.",
                },
                {
                  key: CATEGORIES.WATER_DRAINAGE,
                  name: CATEGORIES.WATER_DRAINAGE,
                  desc: "Responsible for water pipelines, drainage systems, sewage, leaks, and flood prevention.",
                },
                {
                  key: CATEGORIES.SANITATION_WASTE,
                  name: CATEGORIES.SANITATION_WASTE,
                  desc: "Manages garbage collection, trash bins, waste disposal, and urban cleanliness.",
                },
                {
                  key: CATEGORIES.ELECTRICITY_LIGHTING,
                  name: CATEGORIES.ELECTRICITY_LIGHTING,
                  desc: "Oversees streetlights, power outages, electrical wiring, and lighting infrastructure.",
                },
                {
                  key: CATEGORIES.PUBLIC_SAFETY,
                  name: CATEGORIES.PUBLIC_SAFETY,
                  desc: "Addresses safety hazards, damaged signs, dangerous conditions, and emergency situations.",
                },
                {
                  key: CATEGORIES.BUILDINGS_INFRASTRUCTURE,
                  name: CATEGORIES.BUILDINGS_INFRASTRUCTURE,
                  desc: "Handles public buildings, bridges, facilities, and structural maintenance issues.",
                },
                {
                  key: CATEGORIES.ENVIRONMENT_POLLUTION,
                  name: CATEGORIES.ENVIRONMENT_POLLUTION,
                  desc: "Manages parks, trees, air quality, noise pollution, and environmental concerns.",
                },
                {
                  key: CATEGORIES.MISCELLANEOUS,
                  name: CATEGORIES.MISCELLANEOUS,
                  desc: "Other civic issues that don't fit into specific categories.",
                },
              ] as const;

              return (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {departments.map((dept) => {
                    // Filter issues by exact category match
                    const deptIssues = (issues || []).filter(
                      (i: MaintenanceIssue) => i.category === dept.key
                    );
                    const colors = getCategoryColors(dept.key);
                    return (
                      <Card key={dept.key} className="admin-card hover-lift">
                        <CardHeader>
                          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            <span
                              className={`w-3 h-3 rounded-full ${colors.bg}`}
                            />
                            {dept.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {dept.desc}
                          </p>
                        </CardHeader>
                        <CardContent>
                          {deptIssues.length === 0 ? (
                            <p className="text-sm text-gray-500">
                              No issues reported yet.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {deptIssues.map((issue: MaintenanceIssue) => (
                                <div
                                  key={issue.id}
                                  className="border rounded-lg p-3 hover:bg-gray-50 transition"
                                >
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900 truncate pr-3">
                                      {issue.title}
                                    </h4>
                                    <Badge
                                      className={getSeverityColor(
                                        issue.severity
                                      )}
                                    >
                                      {issue.severity.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                    {issue.description}
                                  </p>
                                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-3">
                                    {issue.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin size={12} />
                                        {issue.location}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Calendar size={12} />
                                      {formatDistanceToNow(
                                        new Date(issue.createdAt!),
                                        { addSuffix: true }
                                      )}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              );
            } catch (e) {
              console.error("Departments render error", e);
              return (
                <p className="text-sm text-red-600">
                  Unable to load departments.
                </p>
              );
            }
          })()}
        </TabsContent>

        {/* Technicians Tab (department grouped by 8 categories) */}
        <TabsContent value="technicians" className="space-y-6 animate-fade-in">
          {(() => {
            // Fallback technicians for each of the 8 categories
            const fallbackTechs: Record<
              string,
              {
                name: string;
                phone: string;
                designation: string;
                email: string;
              }[]
            > = {
              [CATEGORIES.ROADS_TRANSPORT]: [
                {
                  name: "Rajiv Kumar",
                  phone: "+91-98123-45678",
                  designation: "Junior Engineer",
                  email: "rajiv.kumar@municipal.gov.in",
                },
                {
                  name: "Anita Sharma",
                  phone: "+91-98765-01234",
                  designation: "Supervisor",
                  email: "anita.sharma@municipal.gov.in",
                },
              ],
              [CATEGORIES.WATER_DRAINAGE]: [
                {
                  name: "Vikram Singh",
                  phone: "+91-98900-11223",
                  designation: "Field Technician",
                  email: "vikram.singh@municipal.gov.in",
                },
                {
                  name: "Pooja Mishra",
                  phone: "+91-98987-65432",
                  designation: "Junior Engineer",
                  email: "pooja.mishra@municipal.gov.in",
                },
              ],
              [CATEGORIES.SANITATION_WASTE]: [
                {
                  name: "Amit Chauhan",
                  phone: "+91-98111-12233",
                  designation: "Supervisor",
                  email: "amit.chauhan@municipal.gov.in",
                },
                {
                  name: "Sunita Arora",
                  phone: "+91-98760-77889",
                  designation: "Sanitation Officer",
                  email: "sunita.arora@municipal.gov.in",
                },
              ],
              [CATEGORIES.ELECTRICITY_LIGHTING]: [
                {
                  name: "Neha Verma",
                  phone: "+91-98223-34455",
                  designation: "Senior Officer",
                  email: "neha.verma@municipal.gov.in",
                },
                {
                  name: "Sandeep Yadav",
                  phone: "+91-98765-43210",
                  designation: "Field Technician",
                  email: "sandeep.yadav@municipal.gov.in",
                },
              ],
              [CATEGORIES.PUBLIC_SAFETY]: [
                {
                  name: "Rohit Khanna",
                  phone: "+91-98990-22334",
                  designation: "Safety Officer",
                  email: "rohit.khanna@municipal.gov.in",
                },
                {
                  name: "Priya Mehta",
                  phone: "+91-98122-55667",
                  designation: "Field Inspector",
                  email: "priya.mehta@municipal.gov.in",
                },
              ],
              [CATEGORIES.BUILDINGS_INFRASTRUCTURE]: [
                {
                  name: "Deepak Gupta",
                  phone: "+91-98970-11223",
                  designation: "Civil Engineer",
                  email: "deepak.gupta@municipal.gov.in",
                },
                {
                  name: "Harish Tiwari",
                  phone: "+91-98100-66778",
                  designation: "Supervisor",
                  email: "harish.tiwari@municipal.gov.in",
                },
              ],
              [CATEGORIES.ENVIRONMENT_POLLUTION]: [
                {
                  name: "Rachna Pandey",
                  phone: "+91-98110-33445",
                  designation: "Environment Officer",
                  email: "rachna.pandey@municipal.gov.in",
                },
                {
                  name: "Manish Bhatia",
                  phone: "+91-98122-55667",
                  designation: "Horticulture Supervisor",
                  email: "manish.bhatia@municipal.gov.in",
                },
              ],
              [CATEGORIES.MISCELLANEOUS]: [
                {
                  name: "Arun Patel",
                  phone: "+91-98333-44556",
                  designation: "General Technician",
                  email: "arun.patel@municipal.gov.in",
                },
              ],
            };

            // Create groups for each of the 8 categories
            const categoryList = Object.values(CATEGORIES);

            return (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categoryList.map((categoryName) => {
                  const list = fallbackTechs[categoryName] ?? [];
                  const colors = getCategoryColors(categoryName);
                  return (
                    <Card key={categoryName} className="admin-card hover-lift">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <span
                            className={`w-3 h-3 rounded-full ${colors.bg}`}
                          />
                          {categoryName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {!Array.isArray(list) || list.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No technicians assigned yet.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {list.map((t: any, idx: number) => (
                              <div
                                key={(t && t.id) || idx}
                                className="border rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-gray-900">
                                    {t.name}
                                  </h4>
                                  <Badge className="capitalize bg-blue-100 text-blue-800 text-xs">
                                    {t.designation || "Technician"}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-700 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Phone size={14} />
                                    <span>{t.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Mail size={14} />
                                    <span className="text-blue-600 text-xs">
                                      {t.email}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>

      {/* Domain Details Modal */}
      <Dialog open={showDomainDetails} onOpenChange={setShowDomainDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Building2 size={20} />
              <span>{selectedDomainData?.name} Details</span>
            </DialogTitle>
            <DialogDescription>
              View statistics and assigned technicians for this domain
            </DialogDescription>
          </DialogHeader>

          {selectedDomainData && (
            <div className="space-y-6">
              {/* Domain Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {selectedDomainData.buildings}
                  </div>
                  <div className="text-sm text-gray-600">Buildings</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedDomainData.activeIssues}
                  </div>
                  <div className="text-sm text-gray-600">Active Issues</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedDomainData.resolvedIssues}
                  </div>
                  <div className="text-sm text-gray-600">Resolved</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedDomainData.avgResolutionTime}
                  </div>
                  <div className="text-sm text-gray-600">Avg Resolution</div>
                </div>
              </div>

              {/* Domain Technicians */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Assigned Technicians
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {domainTechnicians.length > 0 ? (
                    domainTechnicians.map((tech: Technician) => (
                      <div key={tech.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{tech.name}</h4>
                          <div
                            className={`w-3 h-3 rounded-full ${tech.status === "available"
                              ? "bg-green-500"
                              : tech.status === "busy"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                              }`}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {tech.specialty}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center space-x-1">
                            <Phone size={12} />
                            <span>{tech.phone}</span>
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star size={12} className="text-yellow-500" />
                            <span>{getTechnicianEffectiveness(tech.id)}%</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-2 text-center py-8">
                      No technicians assigned to this domain
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
