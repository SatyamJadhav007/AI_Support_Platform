import { v } from "convex/values";

import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { upsertSecret } from "../lib/secrets";
// this is a internal action because we are calling the aws secrets manager directly for C-U operations
export const upsert = internalAction({
  args: {
    organizationId: v.string(),
    service: v.union(v.literal("vapi")),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const secretName = `tenent/${args.organizationId}/${args.service}`;
    // tenent/1234/vapi <=== example secret name
    await upsertSecret(secretName, args.value);

    await ctx.runMutation(internal.system.plugins.upsert, {
      service: args.service,
      secretName,
      organizationId: args.organizationId,
    });

    return { success: "Success" };
  },
});
