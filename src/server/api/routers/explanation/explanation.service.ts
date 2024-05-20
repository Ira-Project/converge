import type { ProtectedTRPCContext } from "../../trpc";
import { type ExplainInput } from "./explanation.input";
import { supabaseClient } from "@/lib/supabaseClient";
import { type AssignmentUpdateActions, AssignmentUpdateActionType } from "@/lib/constants";


export const explain = async (ctx: ProtectedTRPCContext, input: ExplainInput) => {

  const payload:AssignmentUpdateActions = {
    type: AssignmentUpdateActionType.SET_LOADING,
  }

  const channelB = supabaseClient.channel(input.channelName)
  channelB.subscribe((status) => {
    if(status !== 'SUBSCRIBED') {
      console.log("Channel not subscribed", status);
      return;
    } 
    void channelB.send({
      type: 'broadcast',
      event: 'action',
      payload: payload,
    }).then(() => {
      console.log("Payload sent to channel");
    });
  })

  await supabaseClient.removeChannel(channelB)
  return;
  
}