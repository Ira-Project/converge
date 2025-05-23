import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./classroom.service";
import * as inputs from "./classroom.input";

export const classroomRouter = createTRPCRouter({
  get: protectedProcedure
    .input(inputs.getClassroomSchema)
    .query(({ ctx, input }) => services.getClassroom(ctx, input)),
  list: protectedProcedure
    .query(({ ctx }) => services.listClassrooms(ctx)),  
  getClassrooms: protectedProcedure
    .query(({ ctx }) => services.getClassrooms(ctx)),
  teachers: protectedProcedure
    .input(inputs.getClassroomTeachersSchema)
    .query(({ ctx, input }) => services.getClassroomTeachers(ctx, input)),
  students: protectedProcedure
    .input(inputs.getClassroomStudentsSchema)
    .query(({ ctx, input }) => services.getClassroomStudents(ctx, input)),
  join: protectedProcedure
    .input(inputs.joinClassroomSchema)
    .mutation(({ ctx, input }) => services.joinClassroom(ctx, input)),
  getOrCreateUserToClassroom: protectedProcedure
    .input(inputs.getOrCreateUserToClassroomSchema)
    .query(({ ctx, input }) => services.getOrCreateUserToClassroom(ctx, input)),
  create: protectedProcedure
    .input(inputs.createClassroomSchema)
    .mutation(({ ctx, input }) => services.createClassroom(ctx, input)),
  update: protectedProcedure
    .input(inputs.updateClassroomSchema)
    .mutation(({ ctx, input }) => services.updateClassroom(ctx, input)),
  removeStudent: protectedProcedure
    .input(inputs.removeStudentSchema)
    .mutation(({ ctx, input }) => services.removeStudent(ctx, input)),
  archive: protectedProcedure
    .input(inputs.archiveClassroomSchema)
    .mutation(({ ctx, input }) => services.archiveClassroom(ctx, input)),
});