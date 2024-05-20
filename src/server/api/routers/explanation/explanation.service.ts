import type { ProtectedTRPCContext } from "../../trpc";
import { type ExplainInput } from "./explanation.input";
import { AssignmentUpdateActionType } from "@/lib/constants";
import { actions } from "@/server/realtime_db/schema/actions";
import { generateId } from "lucia";


export const explain = async (ctx: ProtectedTRPCContext, input: ExplainInput) => {
  
  await ctx.realtimeDb.insert(actions).values({
    id: generateId(21),
    channelId: input.channelName,
    actionType: AssignmentUpdateActionType.SET_LOADING,
    payload: {}
  })
  
}