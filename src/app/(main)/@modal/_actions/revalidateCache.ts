"use server";

import { revalidatePath } from "next/cache";

export const revalidateClassroomListQuery = async () => {
  revalidatePath("/api/trpc/classroom.list"); 
}