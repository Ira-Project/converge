import type { ProtectedTRPCContext } from "../../trpc";

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
