import { and } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { GetLeaderboardInput } from "./leaderboard.input";
import { ActivityType } from "@/lib/constants";

const REASONING_ASSIGNMENT_SCORE = 10
const LEARN_BY_TEACHING_ASSIGNMENT_SCORE = 10
const CONCEPT_MAPPING_ASSIGNMENT_SCORE = 10
const STEP_SOLVE_ASSIGNMENT_SCORE = 10
const READ_AND_RELAY_ASSIGNMENT_SCORE = 10

export const getLeaderboard = async (ctx: ProtectedTRPCContext, input: GetLeaderboardInput) => {
  const activities = await ctx.db.query.activity.findMany({
    where: (table, { eq }) => and(eq(table.classroomId, input.classroomId), eq(table.isLive, true)),
  });

  const studentScores = new Map<string, {
    scoresByActivity: Map<string, {
      score: number;
      timeSpent: number;
      accuracy: number;
      name: string;
      userEmail: string;
    }>;
  }>();

  const submissions: {
    userId: string | null;
    score: number;
    accuracy: number;
    submittedAt: Date | null;
    createdAt: Date;
    activityId: string;
    name: string;
    userEmail: string;
  }[] = [];

  for (const act of activities) {
    switch (act.typeText) {
      case ActivityType.KnowledgeZap:
        const kza = await ctx.db.query.knowledgeZapAssignmentAttempts.findMany({
          where: (attempts, { eq, and, isNotNull }) => and(
            eq(attempts.activityId, act.id),
            isNotNull(attempts.submittedAt)
          ),
          columns: {
            questionsCompleted: true,
            totalAttempts: true,
            userId: true,
            submittedAt: true,
            createdAt: true,
          },
          with: {
            user: {
              columns: {
                name: true,
                email: true,
              }
            }
          }
        });
        submissions.push(...kza.map(s => ({
          userId: s.userId,
          score: (s.questionsCompleted ?? 0),
          accuracy: s.totalAttempts ? (s.questionsCompleted ?? 0) / (s.totalAttempts ?? 1) : 0,
          submittedAt: s.submittedAt,
          createdAt: s.createdAt,
          activityId: act.id,
          name: s.user?.name ?? "",
          userEmail: s.user?.email ?? "",
        })));
        break; 
      case ActivityType.ReasonTrace:
        const rta = await ctx.db.query.reasoningAssignmentAttempts.findMany({
          where: (attempts, { eq, and, isNotNull }) => and(
            eq(attempts.activityId, act.id),
            isNotNull(attempts.submittedAt)
          ),
          with: {
            reasoningPathwayAttempts: true,
            reasoningAttemptFinalAnswer: true,
            user: {
              columns: {
                name: true,
                email: true,
              }
            }
          },
          columns: {
            score: true,
            userId: true,
            submittedAt: true,
            createdAt: true,
          }
        });
        submissions.push(...rta.map(s => ({
          userId: s.userId,
          score: (s.score ?? 0) * REASONING_ASSIGNMENT_SCORE,
          accuracy: (s.reasoningPathwayAttempts.length + s.reasoningAttemptFinalAnswer.length) > 0
            ? ((s.reasoningPathwayAttempts.filter(p => p.correct).length + s.reasoningAttemptFinalAnswer.filter(a => a.isCorrect).length)) / 
              (s.reasoningPathwayAttempts.length + s.reasoningAttemptFinalAnswer.length)
            : 0,
          submittedAt: s.submittedAt,
          createdAt: s.createdAt,
          activityId: act.id,
          name: s.user?.name ?? "",
          userEmail: s.user?.email ?? "",
        })));
        break;
      case ActivityType.LearnByTeaching:
        const lbt = await ctx.db.query.explainTestAttempts.findMany({
          where: (attempts, { eq, and, isNotNull }) => and(
            eq(attempts.activityId, act.id),
            isNotNull(attempts.submittedAt)
          ),
          with: {
            user: {
              columns: {
                name: true,
                email: true,
              }
            }
          }
        });
        submissions.push(...lbt.map(s => ({
          userId: s.userId,
          score: (s.score2 ?? 0) * LEARN_BY_TEACHING_ASSIGNMENT_SCORE,
          accuracy: s.averageScore ?? 0,
          submittedAt: s.submittedAt,
          createdAt: s.createdAt,
          activityId: act.id,
          name: s.user?.name ?? "",
          userEmail: s.user?.email ?? "",
        })));
        break;
      case ActivityType.ConceptMapping:
        const cm = await ctx.db.query.conceptMappingAttempts.findMany({
          where: (attempts, { eq, and, isNotNull }) => and(
            eq(attempts.activityId, act.id),
            isNotNull(attempts.submittedAt)
          ),
          with: {
            user: {
              columns: {
                name: true,
                email: true,  
              }
            }
          }
        });
        submissions.push(...cm.map(s => ({
          userId: s.userId,
          score: (s.score ?? 0) * CONCEPT_MAPPING_ASSIGNMENT_SCORE,
          accuracy: s.accuracy ?? 0,
          submittedAt: s.submittedAt,
          createdAt: s.createdAt,
          activityId: act.id,
          name: s.user?.name ?? "",
          userEmail: s.user?.email ?? "",
        })));
        break;
      case ActivityType.StepSolve:
        const ss = await ctx.db.query.stepSolveAssignmentAttempts.findMany({
          where: (attempts, { eq, and, isNotNull }) => and(
            eq(attempts.activityId, act.id),
            isNotNull(attempts.submittedAt)
          ),
          with: {
            user: {
              columns: {
                name: true,
                email: true,
              }
            }
          }
        });
        submissions.push(...ss.map(s => ({
          userId: s.userId,
          score: (s.score ?? 0) * STEP_SOLVE_ASSIGNMENT_SCORE,
          accuracy: s.completionRate ?? 0,
          submittedAt: s.submittedAt,
          createdAt: s.createdAt,
          activityId: act.id,
          name: s.user?.name ?? "",
          userEmail: s.user?.email ?? "",
        })));
        break;
      case ActivityType.ReadAndRelay:
        const rr = await ctx.db.query.readAndRelayAttempts.findMany({
          where: (attempts, { eq, and, isNotNull }) => and(
            eq(attempts.activityId, act.id),
            isNotNull(attempts.submittedAt)
          ),
          with: {
            user: {
              columns: {
                name: true,
                email: true,
              }
            }
          }
        });
        submissions.push(...rr.map(s => ({
          userId: s.userId,
          score: (s.score ?? 0) * READ_AND_RELAY_ASSIGNMENT_SCORE,
          accuracy: s.accuracy ?? 0,
          submittedAt: s.submittedAt,
          createdAt: s.createdAt,
          activityId: act.id,
          name: s.user?.name ?? "",
          userEmail: s.user?.email ?? "",
        })));
        break;
    }
  }

  for (const s of submissions) {
    if (!s.userId) continue;

    // Initialize student entry if it doesn't exist
    if (!studentScores.has(s.userId)) {
      studentScores.set(s.userId, {
        scoresByActivity: new Map()
      });
    }

    const student = studentScores.get(s.userId)!;
    const activityId = s.activityId;

    // Update score only if it's higher than existing score or if no score exists
    const existingScore = student.scoresByActivity.get(activityId);
    if (!existingScore || existingScore.score < s.score) {
      const timeSpent = s.submittedAt ? (s.submittedAt.getTime() - s.createdAt.getTime()) / 1000 : 0;
      student.scoresByActivity.set(activityId, {
        score: s.score,
        timeSpent:  timeSpent > 3600 ? 3600 : timeSpent,
        accuracy: s.accuracy,
        name: s.name,
        userEmail: s.userEmail,
      });
    }
  }

  // Convert the Map to an array of student scores
  const leaderboardData = Array.from(studentScores.entries()).map(([userId, data]) => {
    const totalScore = Array.from(data.scoresByActivity.values())
      .reduce((sum, activity) => sum + (Number.isFinite(activity.score) ? activity.score : 0), 0);
    
    const activities = Array.from(data.scoresByActivity.values());
    const validAccuracies = activities.filter(activity => Number.isFinite(activity.accuracy));
    const averageAccuracy = validAccuracies.length > 0
      ? validAccuracies.reduce((sum, activity) => sum + activity.accuracy, 0) / validAccuracies.length
      : 0;

    const totalTimeSpent = Array.from(data.scoresByActivity.values())
      .reduce((sum, activity) => sum + (Number.isFinite(activity.timeSpent) ? activity.timeSpent : 0), 0);

    // Get the user info from the first activity (all activities have same user info)
    const userInfo = Array.from(data.scoresByActivity.values())[0];

    return {
      userId,
      name: userInfo?.name ?? "",
      userEmail: userInfo?.userEmail ?? "",
      totalScore,
      averageAccuracy,
      numberOfActivities: data.scoresByActivity.size,
      totalTimeSpent,
    };
  });

  // Sort by total score in descending order
  leaderboardData.sort((a, b) => b.totalScore - a.totalScore);

  console.log("LEADERBOARD DATA", leaderboardData);

  return leaderboardData;
}