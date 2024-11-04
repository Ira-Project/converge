import { and, asc, desc } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { ListAssignmentsInput } from "./assignment.input";
import { assignments } from "@/server/db/schema/assignment";
import { reasoningAssignments } from "@/server/db/schema/reasoningAssignment";

export const listAssignments = async (ctx: ProtectedTRPCContext, input: ListAssignmentsInput) => {
  
    const explainingAssignmentList = await ctx.db.query.assignments.findMany({
      where: (table, { eq }) => and(eq(table.classroomId, input.classroomId!), eq(table.isDeleted, false)),
      columns: {
        id: true,
        name: true,
        dueDate: true,
        createdAt: true,
        createdBy: true,
        description: true,
        imageUrl: true,
        isLive: true,
        isLocked: true,
      }, 
      with: {
        topic: {
          columns: {
            name: true,
            imageUrl: true,
          }
        }
      },
      orderBy: [asc(assignments.dueDate), desc(assignments.isLive), asc(assignments.isLocked)],
    })

    const reasoningAssignmentList = await ctx.db.query.reasoningAssignments.findMany({
      where: (table, { eq }) => and(eq(table.classroomId, input.classroomId!), eq(table.isDeleted, false)),
      columns: {
        id: true,
        name: true,
        dueDate: true,
        createdAt: true,
        createdBy: true,
        description: true,
        imageUrl: true,
        isLive: true,
        isLocked: true,
      },
      with: {
        topic: {
          columns: {
            name: true,
            imageUrl: true,
          }
        }
      },
      orderBy: [asc(reasoningAssignments.dueDate), desc(reasoningAssignments.isLive), asc(reasoningAssignments.isLocked)],
    })

    // Create a list of topics from the two lists
    const topicList = [...new Set([...explainingAssignmentList.map(assignment => assignment.topic.name), ...reasoningAssignmentList.map(assignment => assignment.topic.name)])];

    // Create a list of assignments under each topic
    const assignmentList = topicList.map(topic => ({
      topic,
      assignments: [...explainingAssignmentList.filter(assignment => assignment.topic.name === topic), ...reasoningAssignmentList.filter(assignment => assignment.topic.name === topic)]
    }));

    // Find the active index from the first assignment in the list that is due before today
    const now = new Date();
    let activeIndex = 0;
    for (const topic of assignmentList) {
      for (const assignment of topic.assignments) {
        if (assignment.dueDate && assignment.dueDate < now) {
          activeIndex++;
        }
      }
    }

    return {
      assignmentList,
      activeIndex, 
    }

};