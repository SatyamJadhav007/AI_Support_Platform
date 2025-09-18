import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

// the internal query is used with actions to access the convex database...
export const getOne = internalQuery({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.contactSessionId);
  },
});
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
// If you have less than three hours left and your still online then refresh the session...
const AUTO_REFREST_THRESHOLD_MS = 3 * 60 * 60 * 1000;
export const refresh = internalMutation({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);
    if (!contactSession) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Contact session not found",
      });
    }
    // Here, the contact session is already expired...
    if (contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Contact session expired",
      });
    }

    const timeRemaining = contactSession.expiresAt - Date.now();
    if (timeRemaining < AUTO_REFREST_THRESHOLD_MS) {
      const newExpiresAt = Date.now() + SESSION_DURATION_MS;
      await ctx.db.patch(args.contactSessionId, {
        expiresAt: newExpiresAt,
      });
      return { ...contactSession, expiresAt: newExpiresAt };
    }
    return contactSession;
  },
});
