import type { ProtectedTRPCContext } from "../../../trpc";
import { generateId } from "lucia";
import type { CheckMatchingAnswerInput, CheckMultipleChoiceAnswerInput, CheckOrderingAnswerInput, FlagQuestionInput } from "./knowledgeQuestions.input";
import { eq } from "drizzle-orm";
import { knowledgeZapQuestionAttempts, knowledgeZapQuestionReport } from "@/server/db/schema/knowledgeZap/knowledgeZapQuestions";
import { matchingAttempt, matchingAttemptSelection, matchingQuestions } from "@/server/db/schema/knowledgeZap/matchingQuestions";
import { multipleChoiceAttempt, multipleChoiceQuestions } from "@/server/db/schema/knowledgeZap/multipleChoiceQuestions";
import { orderingAttempt, orderingAttemptSelection, orderingQuestions } from "@/server/db/schema/knowledgeZap/orderingQuestions";
import { conceptTracking } from "@/server/db/schema/concept";
import { ActivityType, Roles } from "@/lib/constants";
import { knowledgeZapAssignmentAttempts } from "@/server/db/schema/knowledgeZap/knowledgeZapAssignment";
import { sendMail, EmailTemplate } from "@/lib/email";

export const checkMatchingAnswer = async (ctx: ProtectedTRPCContext, input: CheckMatchingAnswerInput) => {
  const { assignmentAttemptId, matchingQuestionId, questionId, answer } = input;

  const assignmentAttempt = await ctx.db.query.knowledgeZapAssignmentAttempts.findFirst({
    where: eq(knowledgeZapAssignmentAttempts.id, assignmentAttemptId),
    with: {
      activity: true
    }
  });

  if (!assignmentAttempt?.activity?.classroomId) {
    throw new Error("Classroom ID not found for this activity");
  }

  const matchingQuestion = await ctx.db.query.matchingQuestions.findFirst({
    where: eq(matchingQuestions.id, matchingQuestionId),
    with: {
      options: true,
      question: {
        with: {
          questionsToConcepts: true,
        }
      }
    }
  });

  const matchingQuestionOptions = matchingQuestion?.options.map((option) => ({
    id: option.id,
    optionA: option.optionA,
    optionB: option.optionB,
  }));

  const correct = matchingQuestionOptions?.every((correctPair) => 
    answer.some((answerPair) => 
      answerPair.optionA === correctPair.optionA && 
      answerPair.optionB === correctPair.optionB
    )
  );

  const questionAttemptId = generateId(21);
  await ctx.db.insert(knowledgeZapQuestionAttempts).values({
    id: questionAttemptId,
    attemptId: assignmentAttemptId,
    questionId,
    isCorrect: correct ?? false,
  });

  const matchingAttemptId = generateId(21);
  await ctx.db.insert(matchingAttempt).values({
    id: matchingAttemptId, 
    questionAttemptId: questionAttemptId,
    questionId: matchingQuestionId,
    isCorrect: correct ?? false,
  });

  await Promise.all(
    answer.map(async (answerPair) => {
      const option1Id = matchingQuestionOptions?.find((option) => option.optionA === answerPair.optionA)?.id;
      const option2Id = matchingQuestionOptions?.find((option) => option.optionB === answerPair.optionB)?.id;
      if (!option1Id || !option2Id) return;
      
      return ctx.db.insert(matchingAttemptSelection).values({
        id: generateId(21),
        attemptId: matchingAttemptId,
        option1Id: option1Id,
        option2Id: option2Id,
      });
    })
  );

  if (matchingQuestion?.question.questionsToConcepts) {
    await Promise.all(
      matchingQuestion.question.questionsToConcepts.map((concept) =>
        ctx.db.insert(conceptTracking).values({
          id: generateId(21),
          conceptId: concept.conceptId,
          userId: ctx.user.id,
          classroomId: assignmentAttempt?.activity?.classroomId,
          activityType: ActivityType.KnowledgeZap,
          createdAt: new Date(),
          updatedAt: new Date(),
          isCorrect: correct ?? false,
        })
      )
    );
  }

  return {
    correct: correct ?? false,
  };

};

export const checkMultipleChoiceAnswer = async (ctx: ProtectedTRPCContext, input: CheckMultipleChoiceAnswerInput) => {
  const { assignmentAttemptId, multipleChoiceQuestionId, questionId, answerOptionId } = input;

  const assignmentAttempt = await ctx.db.query.knowledgeZapAssignmentAttempts.findFirst({
    where: eq(knowledgeZapAssignmentAttempts.id, assignmentAttemptId),
    with: {
      activity: true
    }
  });

  if (!assignmentAttempt?.activity?.classroomId) {
    throw new Error("Classroom ID not found for this activity");
  }

  const multipleChoiceQuestion = await ctx.db.query.multipleChoiceQuestions.findFirst({
    where: eq(multipleChoiceQuestions.id, multipleChoiceQuestionId),
    with: {
      options: true,
      question: {
        with: {
          questionsToConcepts: true,
        }
      }
    }
  });

  const correctOptionId = multipleChoiceQuestion?.options.find((option) => option.isCorrect)?.id;
  const correct = correctOptionId === answerOptionId;

  const questionAttemptId = generateId(21);
  await ctx.db.insert(knowledgeZapQuestionAttempts).values({
    id: questionAttemptId,
    attemptId: assignmentAttemptId,
    questionId,
    isCorrect: correct ?? false,
  });

  await ctx.db.insert(multipleChoiceAttempt).values({
    id: generateId(21),
    questionAttemptId: questionAttemptId,
    questionId: multipleChoiceQuestionId,
    optionId: answerOptionId,
    isCorrect: correct ?? false,
  });

  if (multipleChoiceQuestion?.question.questionsToConcepts) {
    await Promise.all(
      multipleChoiceQuestion.question.questionsToConcepts.map((concept) =>
        ctx.db.insert(conceptTracking).values({
          id: generateId(21),
          conceptId: concept.conceptId,
          userId: ctx.user.id,
          classroomId: assignmentAttempt?.activity?.classroomId,
          activityType: ActivityType.KnowledgeZap,
          createdAt: new Date(),
          updatedAt: new Date(),
          isCorrect: correct ?? false,
        })
      )
    );
  }

  return {
    correct: correct ?? false,
  };

};

export const checkOrderingAnswer = async (ctx: ProtectedTRPCContext, input: CheckOrderingAnswerInput) => {
  const { assignmentAttemptId, orderingQuestionId, questionId, answer } = input;

  const assignmentAttempt = await ctx.db.query.knowledgeZapAssignmentAttempts.findFirst({
    where: eq(knowledgeZapAssignmentAttempts.id, assignmentAttemptId),
    with: {
      activity: true
    }
  });

  if (!assignmentAttempt?.activity?.classroomId) {
    throw new Error("Classroom ID not found for this activity");
  }

  const orderingQuestion = await ctx.db.query.orderingQuestions.findFirst({
    where: eq(orderingQuestions.id, orderingQuestionId),
    with: {
      options: true,
      question: {
        with: {
          questionsToConcepts: true,
        }
      }
    }
  });

  let correct = true;
  
  for (const userAnswer of input.answer) {
    const correctOption = orderingQuestion?.options.find(o => o.option === userAnswer?.option);

    if (userAnswer.order !== correctOption?.order) {
      correct = false;
    }
  }

  const questionAttemptId = generateId(21);
  await ctx.db.insert(knowledgeZapQuestionAttempts).values({
    id: questionAttemptId,
    attemptId: assignmentAttemptId,
    questionId,
    isCorrect: correct ?? false,
  });

  const orderingAttemptId = generateId(21);
  await ctx.db.insert(orderingAttempt).values({
    id: orderingAttemptId,
    questionAttemptId: questionAttemptId,
    questionId: orderingQuestionId,
    isCorrect: correct ?? false,
  });

  await Promise.all(
    answer.map(async (option) => {
      const optionOrder = orderingQuestion?.options.find((o) => o.option === option.option)?.order;
      const optionCorrect = optionOrder === option.order;

      return ctx.db.insert(orderingAttemptSelection).values({
        id: generateId(21),
        attemptId: orderingAttemptId,
        optionId: option.id,
        order: option.order,
        isCorrect: optionCorrect,
      });
    })
  );

  if (orderingQuestion?.question.questionsToConcepts) {
    await Promise.all(
      orderingQuestion.question.questionsToConcepts.map((concept) =>
        ctx.db.insert(conceptTracking).values({
          id: generateId(21),
          conceptId: concept.conceptId,
          userId: ctx.user.id,
          classroomId: assignmentAttempt?.activity?.classroomId,
          activityType: ActivityType.KnowledgeZap,
          createdAt: new Date(),
          updatedAt: new Date(),
          isCorrect: correct ?? false,
        })
      )
    );
  }

  return {
    correct: correct ?? false,
  };

};

export const flagQuestion = async (ctx: ProtectedTRPCContext, input: FlagQuestionInput) => {
  const { questionId, type, report, questionText, classroomId } = input;

  // Create the question report entry
  const reportId = generateId(21);
  await ctx.db.insert(knowledgeZapQuestionReport).values({
    id: reportId,
    questionId,
    type,
    report: report ?? "",
    userId: ctx.user.id,
  });

  // Get all teachers in the classroom
  const teachers = await ctx.db.query.usersToClassrooms.findMany({
    where: (table, { eq, and }) => and(
      eq(table.classroomId, classroomId),
      eq(table.role, Roles.Teacher),
      eq(table.isDeleted, false)
    ),
    with: {
      user: {
        columns: {
          email: true,
          name: true,
        }
      }
    }
  });

  // Prepare email template props
  const studentName = ctx.user.name ?? 'A student';
  const emailProps = {
    studentName,
    questionText,
    report: report ?? undefined,
  };

  // Send emails to all teachers in the classroom
  const teacherEmails = teachers.map(t => t.user?.email).filter((email): email is string => Boolean(email));
  
  for (const teacherEmail of teacherEmails) {
    try {
      await sendMail(teacherEmail, EmailTemplate.FlagQuestion, emailProps);
      console.log("Email sent to teacher:", teacherEmail);
    } catch (error) {
      console.error('Failed to send email to teacher:', teacherEmail, error);
    }
  }

  // Send email to vignesh@iraproject.com
  try {
    await sendMail('vignesh@iraproject.com', EmailTemplate.FlagQuestion, emailProps);
    console.log("Email sent to vignesh@iraproject.com");
  } catch (error) {
    console.error('Failed to send email to vignesh@iraproject.com:', error);
  }

  return { success: true };
};

