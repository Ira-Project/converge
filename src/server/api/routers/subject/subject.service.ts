import type { ProtectedTRPCContext } from "../../trpc";

export const listCourses = async (ctx: ProtectedTRPCContext) => {
  return await ctx.db.query.courses.findMany({
    where: (table, { eq }) => eq(table.isDeleted, false),
    columns: {
      id: true,
      name: true,
    },
  });
};
