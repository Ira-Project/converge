'use-server'

import { db } from "@/server/db";
import { activity } from "@/server/db/schema/activity";
import { eq } from "drizzle-orm";

export async function getClassroomIdFromPathname(pathname: string) {
  if (pathname.includes('/activity')) {
    const path = pathname.split('/');
    const activityId = path[2]; 
    const activityObj = await db.query.activity.findFirst({
      where: eq(activity.id, activityId ?? ''), 
      columns: {
        classroomId: true,
      },
    });
    return activityObj?.classroomId;
  } else {
    const path = pathname.split('/');
    const classroomId = path[1];
    return classroomId;
  }
}