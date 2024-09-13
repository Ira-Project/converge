import { eq } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { updateUserInput } from "./preloadedUsers.input";
import { preloadedUsers, teacherCourses, teacherSubjects, users } from "@/server/db/schema/user";
import { generateId } from "lucia";

export const updateUser = async (ctx: ProtectedTRPCContext, input: updateUserInput) => {
  
  await ctx.db.update(users)
    .set({name: input.name })
    .where(eq(users.email, ctx.user.email));

  await ctx.db.update(preloadedUsers)
    .set({notOnboarded: false})
    .where(eq(preloadedUsers.email, input.email));

  for(const course of input.courses) {
    await ctx.db.insert(teacherCourses).values({
      id: generateId(21),
      userId: ctx.user.id,
      courseId: course,
    });
  }

  for(const subject of input.subjects) {
    await ctx.db.insert(teacherSubjects).values({
      id: generateId(21),
      userId: ctx.user.id,
      subjectId: subject,
    });
  }

}
