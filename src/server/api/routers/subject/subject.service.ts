import type { ProtectedTRPCContext } from "../../trpc";

export const listCourses = async (ctx: ProtectedTRPCContext) => {
  return await ctx.db.query.courses.findMany({
    where: (table, { eq }) => eq(table.isDeleted, false),
    columns: {
      id: true,
      name: true,
      locked: true,
      subjectId: true,
    },
  });
};

export const listSubjects = async (ctx: ProtectedTRPCContext) => {
  return await ctx.db.query.subjects.findMany({
    where: (table, { eq }) => eq(table.isDeleted, false),
    columns: {
      id: true,
      name: true,
      locked: true,
    },
  });
};

export const getCoursesBySubject = async (ctx: ProtectedTRPCContext, subjectId: string) => {
  return await ctx.db.query.courses.findMany({
    where: (table, { eq, and }) => and(
      eq(table.subjectId, subjectId),
      eq(table.isDeleted, false)
    ),
    columns: {
      id: true,
      name: true,
      locked: true,
    },
  });
};