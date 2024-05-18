import type { ProtectedTRPCContext } from "../../trpc";
import type { GetAssignmentTemplateInput } from "./assignmentTemplate.input";

export const listAssignmentTemplates = async (ctx: ProtectedTRPCContext) => {
  setTimeout(() => { return }, 5000);
  return await ctx.db.query.assignmentTemplates.findMany({
    where: (table, { eq }) => eq(table.isDeleted, false),
    columns: {
      id: true,
      name: true,
      imageUrl: true,
    },
  });
};

export const getAssignmentTemplate = async (ctx: ProtectedTRPCContext, input: GetAssignmentTemplateInput) => {
  return await ctx.db.query.assignmentTemplates.findFirst({
    where: (table, { eq }) => eq(table.id, input.id),
    columns: {
      id: true,
      name: true, 
    },
    with: {
      conceptGraphs: {
        with: {
          concepts: {
            with: {
              conceptQuestions: {
                with: {
                  conceptAnswers: true
                }
              }
            }
          },
          conceptGraphEdges: true,
          conceptGraphRoot: true
        },
      }
    }
  });
}
