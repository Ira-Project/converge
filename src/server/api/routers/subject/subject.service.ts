import type { ProtectedTRPCContext } from "../../trpc";

export const listSubjects = async (ctx: ProtectedTRPCContext) => {
  return await ctx.db.query.subjects.findMany({
    where: (table, { eq }) => eq(table.isDeleted, false),
    columns: {
      id: true,
      name: true,
    },
  });
};
