import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

// the internal query is used with actions to access the convex database...
export const getOne = internalQuery({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.contactSessionId);
  },
});
