import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, TrendingUp, ArrowRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { mockWeeklyReviews, mockGoals } from "@/data/mockData";
import { cn } from "@/lib/utils";

const WeeklyReview = () => {
  const reviews = mockWeeklyReviews;
  const currentWeek = 4; // Mock current week

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${new Intl.DateTimeFormat('en-US', options).format(new Date(start))} - ${new Intl.DateTimeFormat('en-US', options).format(new Date(end))}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Weekly Review</h1>
          <p className="text-muted-foreground">Reflect on your progress and plan ahead</p>
        </div>
        <Button variant="glow">
          Start Week {currentWeek} Review
        </Button>
      </div>

      {/* Current Week Prompt */}
      <Card variant="glow" className="overflow-hidden">
        <div className="h-1 gradient-primary" />
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Week {currentWeek}</span>
            <span className="text-sm text-muted-foreground">• Jan 20 - Jan 26, 2026</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Time to reflect on the past week. What went well? What could be improved?
          </p>
          <Button>
            Start Review <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Past Reviews */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Past Reviews</h2>
        
        {reviews.map((review) => (
          <Card key={review.id} variant="interactive">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Week {review.weekNumber}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {formatDateRange(review.weekStartDate, review.weekEndDate)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < review.overallRating 
                          ? "text-warning fill-warning" 
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-success">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-sm font-medium">What Worked</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {review.whatWorked}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <ThumbsDown className="h-4 w-4" />
                    <span className="text-sm font-medium">What Didn't Work</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {review.whatDidntWork}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Improvements</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {review.improvements}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No reviews yet</p>
              <p className="text-xs text-muted-foreground">
                Complete your first weekly review to see it here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WeeklyReview;
