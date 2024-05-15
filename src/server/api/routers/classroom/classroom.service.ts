import type { ProtectedTRPCContext } from "../../trpc";

export const listClassrooms = async (ctx: ProtectedTRPCContext) => {
  return await ctx.db.query.usersToClassrooms.findMany({
    where: 
      (table, { eq }) => eq(table.userId, ctx.user.id) && eq(table.isDeleted, false),
      columns: {
        classroomId: true,
      }, 
      with: {
        classroom: {
          columns: {
            id: true,
            name: true,
            description: true,
          }, 
          with: {
            subject: {
              columns: {
                name: true,
              }
            },
            classroomMembers: {
              columns: {
                role: true,
              },
            }
          },
        }
      }
  });
};