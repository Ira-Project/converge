import { and } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { GetSubmissionsInput } from "./analytics.input";
import { ActivityType, CONCEPT_MAPPING_ASSIGNMENT_SCORE, KNOWLEDGE_ZAP_ASSIGNMENT_SCORE, LEARN_BY_TEACHING_ASSIGNMENT_SCORE, READ_AND_RELAY_ASSIGNMENT_SCORE, REASONING_ASSIGNMENT_SCORE, Roles, STEP_SOLVE_ASSIGNMENT_SCORE } from "@/lib/constants";


export const getSubmissions = async (ctx: ProtectedTRPCContext, input: GetSubmissionsInput) => {
  const activities = await ctx.db.query.activity.findMany({
    where: (table, { eq }) => and(eq(table.classroomId, input.classroomId), eq(table.isLive, true)),
  });

  const submissions: {
    userId: string | null;
    score: number;
    accuracy: number;
    submittedAt: Date | null;
    createdAt: Date;
    activityId: string;
    activityType: ActivityType;
    topic: string;
    topicId: string;
    name: string;
    userEmail: string;
    userAvatar: string;
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
                avatar: true,
              }
            },
            activity: {
              with: {
                topic: true,
              }
            }
          }
        });
        submissions.push(...kza.map(s => ({
          userId: s.userId,
          score: s.totalAttempts ? 
            ((s.questionsCompleted ?? 0) / (s.totalAttempts ?? 1)) * KNOWLEDGE_ZAP_ASSIGNMENT_SCORE : 
            0,
          accuracy: s.totalAttempts ? (s.questionsCompleted ?? 0) / (s.totalAttempts ?? 1) : 0,
          submittedAt: s.submittedAt,
          createdAt: s.createdAt,
          activityId: act.id,
          activityType: ActivityType.KnowledgeZap,
          topic: s.activity?.topic?.name ?? "",
          topicId: s.activity?.topic?.id ?? "",
          name: s.user?.name ?? "",
          userEmail: s.user?.email ?? "",
          userAvatar: s.user?.avatar ?? "",
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
                avatar: true,
              }
            },
            activity: {
              with: {
                topic: true,
              }
            }
          },
          columns: {
            score: true,
            userId: true,
            submittedAt: true,
            createdAt: true,
          },
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
          activityType: ActivityType.ReasonTrace,
          topic: s.activity?.topic?.name ?? "",
          topicId: s.activity?.topic?.id ?? "",
          name: s.user?.name ?? "",
          userEmail: s.user?.email ?? "",
          userAvatar: s.user?.avatar ?? "",
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
                avatar: true,
              }
            },
            activity: {
              with: {
                topic: true,
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
          activityType: ActivityType.LearnByTeaching,
          topic: s.activity?.topic?.name ?? "",
          topicId: s.activity?.topic?.id ?? "",
          name: s.user?.name ?? "",
          userEmail: s.user?.email ?? "",
          userAvatar: s.user?.avatar ?? "",
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
                avatar: true,
              }
            },
            activity: {
              with: {
                topic: true,
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
          activityType: ActivityType.ConceptMapping,
          topic: s.activity?.topic?.name ?? "",
          topicId: s.activity?.topic?.id ?? "",
          name: s.user?.name ?? "",
          userEmail: s.user?.email ?? "",
          userAvatar: s.user?.avatar ?? "",
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
                avatar: true,
              }
            },
            activity: {
              with: {
                topic: true,
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
          activityType: ActivityType.StepSolve,
          topic: s.activity?.topic?.name ?? "",
          topicId: s.activity?.topic?.id ?? "",
          name: s.user?.name ?? "",
          userEmail: s.user?.email ?? "",
          userAvatar: s.user?.avatar ?? "",
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
                avatar: true,
              }
            },
            activity: {
              with: {
                topic: true,
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
          activityType: ActivityType.ReadAndRelay,
          topic: s.activity?.topic?.name ?? "",
          topicId: s.activity?.topic?.id ?? "",
          name: s.user?.name ?? "",
          userEmail: s.user?.email ?? "",
          userAvatar: s.user?.avatar ?? "",
        })));
        break;
    }
  }

  submissions.sort((a, b) => {
    if (!a.submittedAt || !b.submittedAt) return 0;
    return b.submittedAt.getTime() - a.submittedAt.getTime();
  });

  if(ctx.user?.role === Roles.Student) {
    return submissions.filter(s => s.userId === ctx.user?.id);
  }

  return submissions;
}

export const getConceptTracking = async (ctx: ProtectedTRPCContext, input: GetSubmissionsInput) => {
  const trackedConcepts = await ctx.db.query.conceptTracking.findMany({
    where: (table, { eq }) => eq(table.classroomId, input.classroomId),
  });

  // Get live activities for the classroom
  const activities = await ctx.db.query.activity.findMany({
    where: (table, { eq }) => and(eq(table.classroomId, input.classroomId), eq(table.isLive, true)),
  });

  // Extract unique concepts from live activities based on activity type
  const conceptsSet = new Set<string>();
  const concepts: Array<{
    id: string;
    text: string;
    answerText: string | null;
    conceptsToTopics: Array<{
      id: string;
      conceptId: string | null;
      topicId: string | null;
      createdAt: Date;
      updatedAt: Date | null;
      isDeleted: boolean;
      deletedAt: Date | null;
    }>;
  }> = [];
  
  for (const activity of activities) {
    switch (activity.typeText) {
      case ActivityType.KnowledgeZap:
        // Get assignment with questions
        const kzAssignment = await ctx.db.query.knowledgeZapAssignments.findFirst({
          where: (table, { eq }) => eq(table.id, activity.assignmentId!),
          with: {
            questionToAssignment: {
              columns: {
                questionId: true,
              }
            }
          }
        });
        
        if (kzAssignment?.questionToAssignment?.length) {
          const questionIds = kzAssignment.questionToAssignment.map(qta => qta.questionId);
          
          // Get questions with their concepts
          const questions = await ctx.db.query.knowledgeZapQuestions.findMany({
            where: (question, { inArray }) => inArray(question.id, questionIds),
            with: {
              questionsToConcepts: {
                with: {
                  concept: {
                    with: {
                      conceptsToTopics: true,
                    }
                  }
                }
              }
            }
          });
          
          // Add concepts to collection
          for (const question of questions) {
            for (const qtc of question.questionsToConcepts) {
              if (qtc.concept && !conceptsSet.has(qtc.concept.id)) {
                conceptsSet.add(qtc.concept.id);
                concepts.push(qtc.concept);
              }
            }
          }
        }
        break;

      case ActivityType.StepSolve:
        // Get assignment with questions and steps
        const ssAssignment = await ctx.db.query.stepSolveAssignments.findFirst({
          where: (table, { eq }) => eq(table.id, activity.assignmentId!),
          with: {
            stepSolveQuestions: {
              columns: {
                questionId: true,
              }
            }
          }
        });
        
        if (ssAssignment?.stepSolveQuestions?.length) {
          const questionIds = ssAssignment.stepSolveQuestions.map(q => q.questionId);
          
                     // Get questions with their steps
          const questions = await ctx.db.query.stepSolveQuestions.findMany({
            where: (question, { inArray }) => inArray(question.id, questionIds),
            with: {
              steps: {
                with: {
                  concepts: {
                    with: {
                      concept: {
                        with: {
                          conceptsToTopics: true,
                        }
                      }
                    }
                  }
                }
              }
            }
          });
          
          // Add concepts to collection
          for (const question of questions) {
            for (const step of question.steps) {
              for (const stepConcept of step.concepts) {
                if (stepConcept.concept && !conceptsSet.has(stepConcept.concept.id)) {
                  conceptsSet.add(stepConcept.concept.id);
                  concepts.push(stepConcept.concept);
                }
              }
            }
          }
        }
        break;

      // For other activity types, we'll skip concept extraction for now
      // as they may not have direct concept relationships or need different handling
      default:
        break;
    }
  }

  const edges = await ctx.db.query.conceptEdges.findMany();
  
  // Filter edges to only include those where both conceptId and relatedConceptId 
  // are in the concepts from live activities
  const conceptIds = new Set(concepts.map(concept => concept.id));
  const filteredEdges = edges.filter(edge => 
    conceptIds.has(edge.conceptId!) && conceptIds.has(edge.relatedConceptId!)
  );

  if(ctx.user?.role === Roles.Student) {
    return {
      trackedConcepts: trackedConcepts.filter(t => t.userId === ctx.user?.id),
      concepts,
      edges: filteredEdges,
      numberOfStudents: 1,
    }
  }

  const students = await ctx.db.query.usersToClassrooms.findMany({
    where: (table, { eq, and }) => and(eq(table.classroomId, input.classroomId), eq(table.role, Roles.Student)),
    columns: {
      userId: true,
    }
  });

  return {
    trackedConcepts,
    concepts,
    edges: filteredEdges,
    numberOfStudents: students.length,
  }
}