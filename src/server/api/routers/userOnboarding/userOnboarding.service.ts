import { eq } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { updateUserInput } from "./userOnboarding.input";
import { preloadedUsers, teacherCourses, teacherGrades, teacherSubjects, users } from "@/server/db/schema/user";
import { generateId } from "lucia";
import { subjects } from "@/server/db/schema/subject";
import { classrooms, usersToClassrooms } from "@/server/db/schema/classroom";
import { Roles } from "@/lib/constants";
import { createClassroom } from "@/lib/utils/createClassroom";

export const updateUser = async (ctx: ProtectedTRPCContext, input: updateUserInput) => {
  
  await ctx.db.update(users)
    .set({name: input.name, isOnboarded: true})
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
    const subjectObject = await ctx.db.query.subjects.findFirst({
      where: eq(subjects.id, subject),
      columns: {
        demoClassroomId: true,
      }
    });
    
    if(!subjectObject) {
      continue
    }

    if(subjectObject.demoClassroomId) {
      const classroom = await ctx.db.query.classrooms.findFirst({
        where: eq(classrooms.id, subjectObject.demoClassroomId),
        columns: {
          id: true,
        }
      });
      if(classroom) {
        await ctx.db.insert(usersToClassrooms).values({
          userId: ctx.user.id,
          classroomId: classroom.id,
          role: Roles.Student,
        });
      }
    }
      
    await ctx.db.insert(teacherSubjects).values({
      id: generateId(21),
      userId: ctx.user.id,
      subjectId: subject,
    });
  }

  for(const grade of input.grades) {
    await ctx.db.insert(teacherGrades).values({
      id: generateId(21),
      userId: ctx.user.id,
      grade: grade,
    });
  }

  //Creating a classroom for the teacher
  const classroomId = await createClassroom(ctx.user.id, ctx.user.name ?? "anonymous", input.courses, input.subjects, input.grades);
  return classroomId;
}