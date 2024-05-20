import type { ProtectedTRPCContext } from "../../trpc";
import { type ExplainInput } from "./explanation.input";
import { supabaseClient } from "@/lib/supabase";
import { type QuestionsUpdateActions, QuestionsUpdateActionType } from "@/lib/constants";
// import { explanation } from "@/server/db/schema/explanations";


export const explain = async (ctx: ProtectedTRPCContext, input: ExplainInput) => {
  // const id = generateId(21);
  // const createExplanation = await ctx.db.insert(explanation).values({
  //   id: id,
  //   text: input.explanation,
  //   embedding: "{}",
  //   createdBy: ctx.user.id,
  // })

  const payload:QuestionsUpdateActions = {
    type: QuestionsUpdateActionType.SET_LOADING,
  }

  const channelB = supabaseClient.channel(input.channelName)
  channelB.subscribe((status) => {
    if(status !== 'SUBSCRIBED') {
      console.log("dude");
      return;
    }
    void channelB.send({
      type: 'broadcast',
      event: 'action',
      payload: payload,
    })
  })
  
}