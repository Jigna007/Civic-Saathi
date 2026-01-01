import { useState, Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LocationDisplay } from "@/components/ui/location-display";
import { MaintenanceIssue, User } from "@shared/schema";
import { getCategoryColors } from "@shared/categories";
import {
  ArrowUp,
  MessageCircle,
  Share,
  MoreHorizontal,
  Bot,
  User as UserIcon,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";

interface FeedPostProps {
  issue: MaintenanceIssue & { reporter: User };
  isMobile?: boolean;
}

export function FeedPost({ issue, isMobile = false }: FeedPostProps) {
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/issues/${issue.id}/upvote`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      setIsUpvoted(!isUpvoted);
    },
  });

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

  const getCategoryColor = (category: string) => {
    const colors = getCategoryColors(category);
    return `${colors.bg} ${colors.text}`;
  };

  // Calculate progress stage based on status and progress
  const getProgressStage = () => {
    if (issue.status === "resolved") return 4;
    if (issue.status === "in_progress") return 3;
    if (issue.status === "assigned") return 2;
    return 1; // open
  };

  const currentStage = getProgressStage();

  const stages = [
    { id: 1, title: "Routed to Authorities" },
    { id: 2, title: "Workforce Assigned" },
    { id: 3, title: "Resolution in Progress" },
    { id: 4, title: "Issue Resolved" },
  ];

  const totalCards = 3;

  const scrollToCard = (index: number) => {
    setCurrentCardIndex(index);
    const container = document.getElementById(`card-container-${issue.id}`);
    if (container) {
      const cardWidth = container.offsetWidth;
      container.scrollTo({ left: cardWidth * index, behavior: "smooth" });
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      scrollToCard(currentCardIndex - 1);
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < totalCards - 1) {
      scrollToCard(currentCardIndex + 1);
    }
  };

  return (
    <div className={`${isMobile ? "w-full h-full" : "max-w-2xl mx-auto mb-6"}`}>
      <div
        className={`bg-white ${
          isMobile
            ? "w-full h-full flex flex-col rounded-2xl shadow-xl border border-gray-200"
            : "rounded-xl border border-gray-200 shadow-sm hover:shadow-md"
        } transition-all duration-300 overflow-hidden`}
      >
        {/* Top Part - User Info */}
        <div
          className={`${
            isMobile ? "p-3 flex-shrink-0" : "p-5"
          } flex-shrink-0 border-b border-gray-100`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div
                className={`${
                  isMobile ? "h-11 w-11" : "h-12 w-12"
                } bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 shadow-md`}
              >
                <UserIcon className="text-white" size={isMobile ? 18 : 20} />
              </div>
              <div className="flex-1 min-w-0">
                {/* User and Rating - First Line */}
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={`${
                      isMobile ? "text-base" : "text-xl"
                    } font-semibold text-gray-900`}
                  >
                    {issue.reporter?.username || "user"}
                  </h3>
                  <span className="text-gray-400">-</span>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium text-xs px-2.5 py-0.5 flex-shrink-0"
                  >
                    ⭐ {issue.reporter?.credibilityScore || 0}
                  </Badge>
                </div>

                {/* Location and Time on Same Line */}
                <div className="flex items-center gap-2 text-xs">
                  {issue.location && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <svg
                        className="w-3 h-3 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <LocationDisplay
                        location={issue.location}
                        className="font-medium truncate max-w-[140px]"
                      />
                    </div>
                  )}
                  <span className="text-gray-400">•</span>
                  <div className="text-gray-500 flex-shrink-0">
                    {formatDistanceToNow(new Date(issue.createdAt!), {
                      addSuffix: true,
                    }).replace("about ", "")}
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0 -mt-1"
            >
              <MoreHorizontal className="text-gray-400" size={18} />
            </Button>
          </div>
        </div>

        {/* Card Container with Navigation - Remaining ~88% */}
        <div
          className={`${
            isMobile
              ? "flex-1 flex flex-col min-h-0 overflow-hidden"
              : "p-5 pt-4"
          }`}
        >
          {/* Card Navigation Area with Arrows */}
          <div className={`${isMobile ? "flex-1 min-h-0" : "mb-4"} relative`}>
            {/* Left Arrow */}
            {currentCardIndex > 0 && (
              <button
                onClick={handlePrevCard}
                className="absolute left-1 z-10 transition-all"
                style={{ top: "calc(50% + 0.5rem)" }}
                aria-label="Previous card"
              >
                <svg
                  className="w-4 h-4 text-gray-700 hover:text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Right Arrow */}
            {currentCardIndex < totalCards - 1 && (
              <button
                onClick={handleNextCard}
                className="absolute right-1 z-10 transition-all"
                style={{ top: "calc(50% + 0.5rem)" }}
                aria-label="Next card"
              >
                <svg
                  className="w-4 h-4 text-gray-700 hover:text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            {/* Cards Container - Only shows ONE card at a time */}
            <div
              id={`card-container-${issue.id}`}
              className={`overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide ${
                isMobile ? "h-full" : "h-64"
              }`}
              onScroll={(e) => {
                const container = e.currentTarget;
                const scrollLeft = container.scrollLeft;
                const cardWidth = container.offsetWidth;
                const newIndex = Math.round(scrollLeft / cardWidth);
                if (newIndex !== currentCardIndex) {
                  setCurrentCardIndex(newIndex);
                }
              }}
            >
              <div className="flex h-full">
                {/* Card 1: Report Overview (Image + Description) */}
                <div className="w-full h-full flex-shrink-0 snap-center">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 h-full overflow-hidden shadow-sm flex flex-col">
                    <div className="pb-3 mb-3 border-b border-gray-200">
                      <h4 className="text-base font-bold text-gray-900">
                        Report Overview
                      </h4>
                    </div>
                    {/* Image Section - Takes ~65% of card */}
                    <div className="flex-[2] flex items-center justify-center overflow-hidden rounded-lg bg-white border border-gray-200 mb-3">
                      {issue.imageUrls && issue.imageUrls.length > 0 ? (
                        <img
                          src={issue.imageUrls[0]}
                          alt="Issue"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <p>No image available</p>
                        </div>
                      )}
                    </div>
                    {/* Description Section - Takes ~35% of card */}
                    <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200 overflow-y-auto">
                      <h5 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2">
                        {issue.title}
                      </h5>
                      <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: AI Report */}
                <div className="w-full h-full flex-shrink-0 snap-center">
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 h-full overflow-hidden shadow-sm flex flex-col">
                    <div className="pb-2.5 mb-2.5 border-b border-purple-200">
                      <h4 className="text-lg font-bold text-purple-900">
                        AI Report
                      </h4>
                    </div>
                    <div className="flex-1 space-y-3 overflow-hidden flex flex-col">
                      {/* Tags - Category on first line (using standardized category) */}
                      <div className="flex flex-wrap gap-2">
                        {issue.category && (
                          <Badge
                            className={`${getCategoryColor(
                              issue.category
                            )} text-xs font-bold px-3 py-1.5`}
                          >
                            {issue.category}
                          </Badge>
                        )}
                      </div>
                      {/* Severity and Confidence on second line */}
                      <div className="flex flex-wrap gap-2">
                        {issue.aiAnalysis?.severity && (
                          <Badge
                            className={`${getSeverityColor(
                              issue.aiAnalysis.severity
                            )} text-xs font-bold px-3 py-1.5 shadow-sm`}
                          >
                            {issue.aiAnalysis.severity.toUpperCase()}
                          </Badge>
                        )}
                        {issue.aiAnalysis?.confidence && (
                          <Badge className="bg-white text-purple-900 text-xs font-bold border-2 border-purple-300 px-3 py-1.5 shadow-sm">
                            {Math.round(issue.aiAnalysis.confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                      {/* Reasoning */}
                      {issue.aiAnalysis?.reasoning && (
                        <div className="flex-1 bg-white rounded-xl p-3.5 border border-purple-200 shadow-sm overflow-y-auto">
                          <p className="text-sm text-gray-800 leading-relaxed break-words">
                            {issue.aiAnalysis.reasoning}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 3: Progress */}
                <div className="w-full h-full flex-shrink-0 snap-center">
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200 h-full flex flex-col justify-center shadow-sm">
                    <div className="space-y-8">
                      {/* Progress Circles */}
                      <div className="flex items-center px-1">
                        {stages.map((stage, index) => (
                          <Fragment key={stage.id}>
                            {/* Stage Circle */}
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                  currentStage >= stage.id
                                    ? "bg-green-600 text-white shadow-lg scale-110"
                                    : "bg-gray-300 text-gray-600"
                                }`}
                              >
                                {currentStage > stage.id ? "✓" : stage.id}
                              </div>
                            </div>
                            {/* Connector Line */}
                            {index < stages.length - 1 && (
                              <div
                                className={`h-2 flex-1 transition-all rounded ${
                                  currentStage > stage.id
                                    ? "bg-green-600"
                                    : "bg-gray-300"
                                }`}
                              />
                            )}
                          </Fragment>
                        ))}
                      </div>

                      {/* Current Stage Title - Below the chain */}
                      <div className="text-center">
                        <p className="text-xl font-bold text-green-700">
                          {stages[currentStage - 1]?.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-around gap-2 max-w-md mx-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => upvoteMutation.mutate()}
                disabled={upvoteMutation.isPending}
                className={`flex items-center gap-1.5 transition-all duration-200 ${
                  isUpvoted
                    ? "text-red-600 bg-red-50 hover:bg-red-100"
                    : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                } px-4 py-2 rounded-lg font-medium`}
              >
                <ArrowUp
                  size={18}
                  className={isUpvoted ? "fill-current" : ""}
                />
                <span className="text-sm font-semibold">
                  {issue.upvotes + (isUpvoted ? 1 : 0)}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all px-4 py-2 rounded-lg font-medium"
              >
                <MessageCircle size={18} />
                <span className="text-sm font-semibold">8</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all px-4 py-2 rounded-lg font-medium"
              >
                <Share size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
