import { eq, and } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { UpdateUserNameInput, SetDefaultClassroomInput } from "./userSettings.input";
import { users } from "@/server/db/schema/user";
import { usersToClassrooms } from "@/server/db/schema/classroom";
import { TRPCClientError } from "@trpc/client";

export const getUserSettings = async (ctx: ProtectedTRPCContext) => {
  // Get user basic info
  const user = await ctx.db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, ctx.user.id),
    columns: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      defaultClassroomId: true,
    }
  });

  if (!user) {
    throw new TRPCClientError("User not found");
  }

  // Get all classrooms the user is part of (including archived)
  const userClassrooms = await ctx.db.query.usersToClassrooms.findMany({
    where: (table, { eq }) => eq(table.userId, ctx.user.id),
    columns: {
      role: true,
      isDeleted: true,
      createdAt: true,
    },
    with: {
      classroom: {
        columns: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          isDeleted: true,
          code: true,
        }
      }
    }
  });

  // Filter and categorize classrooms
  const classrooms = userClassrooms
    .filter(uc => !uc.classroom?.isDeleted) // Don't show completely deleted classrooms
    .map(uc => ({
      id: uc.classroom?.id ?? "",
      name: uc.classroom?.name ?? "",
      description: uc.classroom?.description ?? "",
      code: uc.classroom?.code ?? "",
      role: uc.role,
      isActive: uc.classroom?.isActive ?? false,
      isArchived: !uc.classroom?.isActive,
      isUserRemoved: uc.isDeleted,
      joinedAt: uc.createdAt,
      isDefault: user.defaultClassroomId === uc.classroom?.id,
    }))
    .sort((a, b) => {
      // Sort by: default first, then active, then by name
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return a.name.localeCompare(b.name);
    });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      defaultClassroomId: user.defaultClassroomId,
    },
    classrooms,
  };
};

export const updateUserName = async (ctx: ProtectedTRPCContext, input: UpdateUserNameInput) => {
  const [updatedUser] = await ctx.db.update(users)
    .set({
      name: input.name,
      updatedAt: new Date(),
    })
    .where(eq(users.id, ctx.user.id))
    .returning({
      id: users.id,
      name: users.name,
    });

  if (!updatedUser) {
    throw new TRPCClientError("Failed to update user name");
  }

  return updatedUser;
};

export const setDefaultClassroom = async (ctx: ProtectedTRPCContext, input: SetDefaultClassroomInput) => {
  // First verify the user is a member of this classroom
  const userToClassroom = await ctx.db.query.usersToClassrooms.findFirst({
    where: (table, { eq, and }) => and(
      eq(table.userId, ctx.user.id),
      eq(table.classroomId, input.classroomId),
      eq(table.isDeleted, false)
    ),
    with: {
      classroom: {
        columns: {
          id: true,
          isActive: true,
          isDeleted: true,
        }
      }
    }
  });

  if (!userToClassroom || userToClassroom.classroom?.isDeleted) {
    throw new TRPCClientError("You are not a member of this classroom");
  }

  if (!userToClassroom.classroom?.isActive) {
    throw new TRPCClientError("Cannot set an archived classroom as default");
  }

  // Update the user's default classroom
  const [updatedUser] = await ctx.db.update(users)
    .set({
      defaultClassroomId: input.classroomId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, ctx.user.id))
    .returning({
      id: users.id,
      defaultClassroomId: users.defaultClassroomId,
    });

  if (!updatedUser) {
    throw new TRPCClientError("Failed to set default classroom");
  }

  return updatedUser;
}; 