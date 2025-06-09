import { generateId } from "lucia/dist/crypto";

import { classrooms, usersToClassrooms } from "@/server/db/schema/classroom";
import { db } from "@/server/db";
import { Roles } from "@/lib/constants";

export async function createClassroom(
  userId: string,
  name: string,
  // userCourses: string[],
  // userSubjects: string[],
  // userGrades: string[],
): Promise<string> {

  // For now we only have Physics content so we will create a classroom with Physics content
  const description = "Demo Classroom";
  
  const classroom = await db.insert(classrooms).values({
    id: generateId(21),
    name: `${name}'s Classroom`,
    isActive: true,
    description: description,
    code: generateId(6),
    createdBy: userId,
  }).returning({
    id: classrooms.id,
  });

  if(!classroom[0]?.id) {
    throw new Error("Failed to create classroom");
  }

  await db.insert(usersToClassrooms).values({
    role: Roles.Teacher,
    classroomId: classroom[0]?.id,
    userId: userId,
    createdAt: new Date(),
  });

  return classroom[0]?.id
}

