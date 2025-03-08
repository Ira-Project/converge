import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./leaderboard.service";
import * as inputs from "./leaderboard.input";

export const leaderboardRouter = createTRPCRouter({
  getLeaderboard: protectedProcedure
    .input(inputs.getLeaderboardSchema)
    .query(({ ctx, input }) => services.getLeaderboard(ctx, input)),
});