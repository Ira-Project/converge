import { generateId } from "lucia/dist/crypto";

import { classrooms, usersToClassrooms } from "@/server/db/schema/classroom";
import { db } from "@/server/db";
import { ActivityType, Roles } from "@/lib/constants";
import { activity } from "@/server/db/schema/activity";


// Physics activities using the topics under the Generic Physics Course
const activityIdsDev: { topicId: string, assignmentId: string, name: string, type: ActivityType, order: number, points: number }[] = [
  {
    name: "Work, Energy and Power",
    type: ActivityType.LearnByTeaching,
    topicId: "ll3dh4ahr5eseomk70lun",
    assignmentId: "dtzo2yhobe6f9k1k2etjc",
    order: 0,
    points: 100
  },
  {
    name: "Electric Charge",
    type: ActivityType.LearnByTeaching,
    topicId: "xui1dy9jz7pjeq8infn6x",
    assignmentId: "ldfl0y3z0fb42bs6s7djq",
    order: 0,
    points: 100
  },
  {
    name: "Work, Energy and Power",
    type: ActivityType.ReasonTrace,
    topicId: "ll3dh4ahr5eseomk70lun",
    assignmentId: "m4wszne63v7tql2l3pqay",
    order: 1,
    points: 100
  }
]

const activityIdsProd: { topicId: string, assignmentId: string, name: string, type: ActivityType, order: number, points: number }[] = [
  {
    name: "Work, Energy and Power",
    type: ActivityType.LearnByTeaching,
    topicId: "yyyah4hvk5r7188h7mgkk",
    assignmentId: "9pcpaym65ccyj9rtlz6xd",
    order: 0,
    points: 100
  },
  {
    name: "Electric Charge",
    type: ActivityType.LearnByTeaching,
    topicId: "4vqur7i8x3p40quh8uthb",
    assignmentId: "nlamr2cgjenrhof24k3i6",
    order: 0,
    points: 100
  },
  {
    name: "Work, Energy and Power",
    type: ActivityType.ReasonTrace,
    topicId: "yyyah4hvk5r7188h7mgkk",
    assignmentId: "higfjthbjvq05ujje389k",
    order: 1,
    points: 100
  }
]

const activityIds = process.env.ENVIRONMENT === 'dev' ? activityIdsDev : activityIdsProd;

export async function createClassroom(
  userId: string,
  name: string,
  // userCourses: string[],
  // userSubjects: string[],
  // userGrades: string[],
): Promise<string> {

  // For now we only have Physics content so we will hardcode it
  const description = "Demo Classroom";
  
  const classroom = await db.insert(classrooms).values({
    id: generateId(21),
    name: `${name}'s Classroom`,
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

  for(const activityId of activityIds) {
    await db.insert(activity).values({
      id: generateId(21),
      name: activityId.name,
      type: activityId.type,
      assignmentId: activityId.assignmentId,
      order: activityId.order,
      points: activityId.points,
      classroomId: classroom[0]?.id,
      topicId: activityId.topicId,
      createdBy: userId,
      isLive: false,
      isLocked: false,
    });
  }

  return classroom[0]?.id
}

