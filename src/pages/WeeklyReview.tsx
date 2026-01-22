import { useState } from "react";
import { 
  Star, ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, 
  ArrowRight, Calendar, CheckCircle2, Target, Flame, 
  Sparkles, Save, X 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useWeeklyReview } from "@/contexts/WeeklyReviewContext";
import { mockWeeklyReviews } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const WeeklyReview = () => {
  const {
    currentWeek,
    weekStartDate,
    weekEndDate,
    weeklyStats,
    savedReviews,
    currentReview,
    updateCurrentReview,
    saveReview,
    isReviewMode,
    setIsReviewMode,
  } = useWeeklyReview();

  // Combine saved reviews with mock data
  const allReviews = [...savedReviews, ...mockWeeklyReviews];

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${new Intl.DateTimeFormat('en-US', options).format(new Date(start))} - ${new Intl.DateTimeFormat('en-US', options).format(new Date(end))}`;
  };

  const handleSaveReview = () => {
    if (currentReview.overallRating === 0) {
      toast.error("Please rate your week before saving");
      return;
    }
    saveReview();
    toast.success("Weekly review saved!", {
      description: `Week ${currentWeek} review completed`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Weekly Review</h1>
          <p className="text-muted-foreground">Reflect on your progress and plan ahead</p>
        </div>
        {!isReviewMode && (
          <Button variant="glow" onClick={() => setIsReviewMode(true)}>
            Start Week {currentWeek} Review
          </Button>
        )}
      </div>

      {/* Review Mode */}
      {isReviewMode ? (
        <div className="space-y-6">
          {/* Week Header */}
          <Card variant="glow" className="overflow-hidden">
            <div className="h-1 gradient-primary" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Week {currentWeek}</span>
                  <span className="text-sm text-muted-foreground">
                    • {formatDateRange(weekStartDate, weekEndDate)}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsReviewMode(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Auto-Generated Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">AI Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">
                {weeklyStats.autoSummary}
              </p>
            </CardContent>
          </Card>

          {/* Weekly Stats Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* MVD Completion */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <CardTitle className="text-sm">MVD Completion</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-foreground">
                    {weeklyStats.mvdCompletedDays}/{weeklyStats.totalDays}
                  </div>
                  <Badge variant={weeklyStats.mvdCompletedDays >= 5 ? "default" : "secondary"}>
                    {Math.round((weeklyStats.mvdCompletedDays / weeklyStats.totalDays) * 100)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">days with MVD complete</p>
              </CardContent>
            </Card>

            {/* Top Goal */}
            {weeklyStats.topGoal && (
              <Card className="border-success/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <CardTitle className="text-sm">Best Progress</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-foreground truncate">
                    {weeklyStats.topGoal.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={weeklyStats.topGoal.progress} className="flex-1" />
                    <Badge variant="outline" className="text-success">
                      +{weeklyStats.topGoal.weeklyGain}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bottom Goal */}
            {weeklyStats.bottomGoal && (
              <Card className="border-warning/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-warning" />
                    <CardTitle className="text-sm">Needs Focus</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-foreground truncate">
                    {weeklyStats.bottomGoal.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={weeklyStats.bottomGoal.progress} className="flex-1" />
                    <Badge variant="outline" className="text-warning">
                      +{weeklyStats.bottomGoal.weeklyGain}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Habit Consistency */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-warning" />
                <CardTitle className="text-base">Habit Consistency</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {weeklyStats.habitConsistency.slice(0, 5).map((habit, index) => {
                const percentage = Math.round((habit.completedDays / habit.totalDays) * 100);
                return (
                  <div key={habit.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">#{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground truncate">
                          {habit.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {habit.completedDays}/{habit.totalDays} days
                        </span>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Reflection Form */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-success">
                  <ThumbsUp className="h-4 w-4" />
                  <CardTitle className="text-sm">What Worked Well?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="What habits, strategies, or mindsets helped you this week?"
                  value={currentReview.whatWorked}
                  onChange={(e) => updateCurrentReview('whatWorked', e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-destructive">
                  <ThumbsDown className="h-4 w-4" />
                  <CardTitle className="text-sm">What Didn't Work?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="What challenges or obstacles did you face?"
                  value={currentReview.whatDidntWork}
                  onChange={(e) => updateCurrentReview('whatDidntWork', e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="h-4 w-4" />
                  <CardTitle className="text-sm">Improvements for Next Week</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="What will you do differently next week?"
                  value={currentReview.improvements}
                  onChange={(e) => updateCurrentReview('improvements', e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <Target className="h-4 w-4" />
                  <CardTitle className="text-sm">Progress Reflection</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="How do you feel about your overall progress toward your goals?"
                  value={currentReview.progressReflection}
                  onChange={(e) => updateCurrentReview('progressReflection', e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </CardContent>
            </Card>
          </div>

          {/* Rating & Save */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Rate Your Week</h3>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => updateCurrentReview('overallRating', rating)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "h-8 w-8 transition-colors",
                            rating <= currentReview.overallRating
                              ? "text-warning fill-warning"
                              : "text-muted-foreground/30 hover:text-warning/50"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsReviewMode(false)}>
                    Cancel
                  </Button>
                  <Button variant="glow" onClick={handleSaveReview}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Current Week Prompt */}
          <Card variant="glow" className="overflow-hidden">
            <div className="h-1 gradient-primary" />
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Week {currentWeek}</span>
                <span className="text-sm text-muted-foreground">
                  • {formatDateRange(weekStartDate, weekEndDate)}
                </span>
              </div>
              <p className="text-muted-foreground mb-4">
                Time to reflect on the past week. What went well? What could be improved?
              </p>
              <Button onClick={() => setIsReviewMode(true)}>
                Start Review <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats Preview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {weeklyStats.mvdCompletedDays}/{weeklyStats.totalDays}
                  </p>
                  <p className="text-sm text-muted-foreground">MVD days</p>
                </div>
              </CardContent>
            </Card>

            {weeklyStats.topGoal && (
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {weeklyStats.topGoal.title}
                    </p>
                    <p className="text-sm text-success">+{weeklyStats.topGoal.weeklyGain}% this week</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {weeklyStats.habitConsistency[0]?.completedDays || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">best habit days</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Past Reviews */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Past Reviews</h2>
            
            {allReviews.map((review) => (
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
                        {review.whatWorked || "No notes"}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-destructive">
                        <ThumbsDown className="h-4 w-4" />
                        <span className="text-sm font-medium">What Didn't Work</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        {review.whatDidntWork || "No notes"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-primary">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Improvements</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {review.improvements || "No notes"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {allReviews.length === 0 && (
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
        </>
      )}
    </div>
  );
};

export default WeeklyReview;
