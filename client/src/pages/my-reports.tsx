import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocationDisplay } from "@/components/ui/location-display";
import { MaintenanceIssue, User, Technician } from "@shared/schema";
import { getCategoryColors } from "@shared/categories";
import { formatDistanceToNow, format } from "date-fns";
import {
  MapPin,
  Calendar,
  User as UserIcon,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  BarChart3,
  FileText,
  Bot,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  PlusCircle,
} from "lucide-react";

export default function MyReportsPage() {
  const { user } = useAuth();

  const {
    data: allIssues,
    isLoading,
    isError,
  } = useQuery<(MaintenanceIssue & { reporter: User })[]>({
    queryKey: ["/api/issues"],
  });

  const myIssues = useMemo(() => {
    const list = allIssues || [];
    return list.filter((i: any) => {
      if (!user?.id) return false;
      if (typeof i.reporterId !== "undefined") return i.reporterId === user.id;
      return i.reporter?.id === user.id;
    });
  }, [allIssues, user?.id]);

  const { data: technicians } = useQuery<Technician[]>({
    queryKey: ["/api/technicians"],
  });

  if (!user) {
    return (
      <div className="min-h-screen pt-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-3">
            Please log in to view your reports.
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen pt-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-600 mt-3">
            Unable to load your reports right now.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Loading skeleton header */}
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48 mb-6" />

          {/* Stats skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>

          {/* Profile card skeleton */}
          <Skeleton className="h-24 w-full rounded-xl mb-8" />

          {/* Report cards skeleton - improved placeholder UI */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-5"
              >
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Severity color helper - uses subtle, meaningful colors
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "major":
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "moderate":
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "minor":
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Severity indicator dot color - for visual quick-scan
  const getSeverityDotColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500";
      case "major":
      case "high":
        return "bg-orange-500";
      case "moderate":
      case "medium":
        return "bg-amber-500";
      case "minor":
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  // Status color and icon mapping
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "resolved":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          label: "Resolved",
          icon: CheckCircle2,
        };
      case "in_progress":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          label: "In Progress",
          icon: Loader2,
        };
      case "assigned":
        return {
          color: "bg-purple-50 text-purple-700 border-purple-200",
          label: "Assigned",
          icon: UserIcon,
        };
      case "open":
        return {
          color: "bg-gray-50 text-gray-600 border-gray-200",
          label: "Submitted",
          icon: AlertCircle,
        };
      default:
        return {
          color: "bg-gray-50 text-gray-600 border-gray-200",
          label: status.replace("_", " "),
          icon: AlertCircle,
        };
    }
  };

  const totalReports = myIssues?.length || 0;
  const resolvedReports =
    myIssues?.filter((issue) => issue.status === "resolved").length || 0;
  const inProgressReports =
    myIssues?.filter((issue) => issue.status === "in_progress").length || 0;
  const avgProgress =
    totalReports > 0
      ? Math.round(
        (myIssues?.reduce((sum, issue) => sum + issue.progress, 0) || 0) /
        totalReports
      )
      : 0;

  const memberSince = user.createdAt
    ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })
    : null;

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory bg-gray-50">
      {/* 
        SECTION A: Stats Frame
        - Full viewport height section
        - Contains title, stats cards, and profile info
        - pt-14 accounts for fixed header height (h-12 = 48px ≈ 3.5rem)
      */}
      <section className="h-screen pt-14 pb-6 px-4 sm:px-6 lg:px-8 flex flex-col snap-start snap-always">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          {/* Header - compact, no excess margin */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="text-gray-700" size={28} />
              <span>My Reports</span>
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Track your maintenance requests and their progress
            </p>
          </div>

          {/* Statistics Cards - compact grid */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium">
                  Total Reports
                </CardTitle>
                <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3 px-4">
                <div className="text-xl font-bold">{totalReports}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium">Resolved</CardTitle>
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3 px-4">
                <div className="text-xl font-bold text-green-600">
                  {resolvedReports}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalReports > 0
                    ? Math.round((resolvedReports / totalReports) * 100)
                    : 0}
                  % done
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium">
                  In Progress
                </CardTitle>
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3 px-4">
                <div className="text-xl font-bold text-blue-600">
                  {inProgressReports}
                </div>
                <p className="text-xs text-muted-foreground">Active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium">
                  Avg Progress
                </CardTitle>
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3 px-4">
                <div className="text-xl font-bold">{avgProgress}%</div>
                <p className="text-xs text-muted-foreground">Completion</p>
              </CardContent>
            </Card>
          </div>

          {/* User Credibility Score - compact */}
          <Card className="mb-4">
            <CardContent className="py-3 px-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center">
                    <UserIcon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Credibility Score</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-emerald-600">
                        {user.credibilityScore}/10
                      </span>
                      <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                        {user.credibilityScore >= 8
                          ? "Excellent"
                          : user.credibilityScore >= 6
                            ? "Good"
                            : user.credibilityScore >= 4
                              ? "Fair"
                              : "Needs Improvement"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="text-sm font-medium">{memberSince ?? "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scroll indicator - hints that reports are below */}
          <div className="text-center text-gray-400 text-xs mt-auto pb-4 animate-bounce">
            <span>↓ Scroll for reports</span>
          </div>
        </div>
      </section>

      {/* 
        SECTION B: Reports Feed
        - Each report is a snap-start section taking full viewport
        - No nested scroll container - snapping is handled by parent
      */}

      {myIssues?.map((issue) => {
        const statusInfo = getStatusInfo(issue.status);
        const StatusIcon = statusInfo.icon;
        const assignedTech = technicians?.find(
          (t) => t.id === issue.assignedTechnicianId
        );

        return (
          <section
            key={issue.id}
            className="h-screen pt-14 pb-4 px-4 sm:px-6 lg:px-8 snap-start snap-always"
          >
            <div className="max-w-4xl mx-auto w-full h-full py-2">
              <Card className="w-full h-full flex flex-col md:flex-row overflow-hidden border-gray-200 shadow-md">
                {/* TOP 50% (Mobile) / LEFT 50% (Desktop): Info Section */}
                <div className="h-1/2 md:h-full md:w-1/2 flex flex-col gap-2 sm:gap-4 px-4 py-3 sm:px-6 sm:py-5 overflow-y-auto md:overflow-y-auto custom-scrollbar">
                  {/* Caption - at the top, larger font, left aligned */}
                  <h3 className="font-bold text-gray-900 text-xl sm:text-2xl leading-tight text-left mb-1 sm:mb-2">
                    {issue.title}
                  </h3>

                  {/* Category */}
                  <div className="bg-gray-50 rounded-full px-3 py-1.5 sm:px-5 sm:py-2.5 w-full">
                    <div className="grid grid-cols-[100px_auto_1fr] gap-2.5 items-center">
                      <span className="text-gray-500 font-medium text-base text-left">
                        Category
                      </span>
                      <span className="text-gray-500 font-medium text-base">
                        :
                      </span>
                      <span
                        className={`text-base font-semibold ${getCategoryColors(issue.category).text
                          }`}
                      >
                        {issue.category}
                      </span>
                    </div>
                  </div>

                  {/* Severity */}
                  <div className="bg-gray-50 rounded-full px-5 py-2.5 w-full">
                    <div className="grid grid-cols-[100px_auto_1fr] gap-2.5 items-center">
                      <span className="text-gray-500 font-medium text-base text-left">
                        Severity
                      </span>
                      <span className="text-gray-500 font-medium text-base">
                        :
                      </span>
                      <span
                        className={`flex items-center gap-2 text-base font-semibold capitalize ${issue.severity === "critical"
                          ? "text-red-600"
                          : issue.severity === "high" ||
                            issue.severity === "major"
                            ? "text-orange-600"
                            : "text-gray-600"
                          }`}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${getSeverityDotColor(
                            issue.severity
                          )}`}
                        />
                        {issue.severity}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  {issue.location && (
                    <div className="bg-gray-50 rounded-full px-3 py-1.5 sm:px-5 sm:py-2.5 w-full">
                      <div className="grid grid-cols-[100px_auto_1fr] gap-2.5 items-center">
                        <span className="text-gray-500 font-medium text-base text-left">
                          Location
                        </span>
                        <span className="text-gray-500 font-medium text-base">
                          :
                        </span>
                        <LocationDisplay
                          location={issue.location}
                          className="text-gray-700 font-medium text-base"
                        />
                      </div>
                    </div>
                  )}

                  {/* Time */}
                  <div className="bg-gray-50 rounded-full px-5 py-2.5 w-full">
                    <div className="grid grid-cols-[100px_auto_1fr] gap-2.5 items-center">
                      <span className="text-gray-500 font-medium text-base text-left">
                        Reported
                      </span>
                      <span className="text-gray-500 font-medium text-base">
                        :
                      </span>
                      <span className="font-medium text-base text-gray-700">
                        {formatDistanceToNow(new Date(issue.createdAt!), {
                          addSuffix: false,
                        }).replace(/^about /, "")}{" "}
                        ago
                      </span>
                    </div>
                  </div>

                  {/* Progress Stage */}
                  <div
                    className={`rounded-full px-3 py-1.5 sm:px-5 sm:py-2.5 w-full ${statusInfo.color}`}
                  >
                    <div className="grid grid-cols-[100px_auto_1fr] gap-2.5 items-center">
                      <span className="font-semibold text-base text-left">
                        Status
                      </span>
                      <span className="font-semibold text-base">:</span>
                      <span className="font-semibold text-base">
                        {issue.status === "open" && "Issue Reported"}
                        {issue.status === "assigned" && "Taskforce Assigned"}
                        {issue.status === "in_progress" &&
                          "Resolution in Progress"}
                        {issue.status === "resolved" && "Issue Resolved"}
                        {![
                          "open",
                          "assigned",
                          "in_progress",
                          "resolved",
                        ].includes(issue.status) && "Routed to Authorities"}
                      </span>
                    </div>
                  </div>

                  {/* Technician Info */}
                  <div className="bg-gray-50 rounded-full px-5 py-2.5 w-full">
                    <div className="grid grid-cols-[100px_auto_1fr] gap-2.5 items-center">
                      <span className="text-gray-500 font-medium text-base flex items-center gap-1.5 text-left">
                        <UserIcon size={16} />
                        Technician
                      </span>
                      <span className="text-gray-500 font-medium text-base">
                        :
                      </span>
                      {assignedTech ? (
                        <span className="text-gray-800 text-base">
                          <span className="font-semibold">
                            {assignedTech.name}
                          </span>
                          {assignedTech.phone && (
                            <span className="text-gray-600 ml-2">
                              <Phone size={14} className="inline mr-1" />
                              <span className="font-medium">
                                {assignedTech.phone}
                              </span>
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-500 font-medium text-base">
                          Not assigned yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOTTOM 50% (Mobile) / RIGHT 50% (Desktop): Image Section */}
                <div className="h-1/2 md:h-full md:w-1/2 px-4 pb-4 md:p-0 flex items-center justify-center bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100">
                  {issue.imageUrls && issue.imageUrls.length > 0 ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
                      <img
                        src={issue.imageUrls[0]}
                        alt="Issue"
                        className="max-w-full max-h-full object-contain"
                      />
                      {issue.imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                          +{issue.imageUrls.length - 1} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">
                        No image attached
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </section>
        );
      })}

      {/* Empty state - friendly message with CTA */}
      {!myIssues?.length && (
        <section className="h-screen pt-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center snap-start snap-always">
          <div className="text-center max-w-sm mx-auto">
            {/* Empty state illustration placeholder */}
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No reports yet
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              You haven't submitted any civic issue reports. Help improve your
              community by reporting issues you encounter.
            </p>
            <Button className="bg-gray-800 hover:bg-gray-900">
              <PlusCircle size={16} className="mr-2" />
              Create your first report
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
