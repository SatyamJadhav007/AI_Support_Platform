import { mutation, query } from "./_generated/server";

// Fetching all users ...
export const getMany = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users;
  },
});

export const add = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new Error("Missing Organization");
    }
    const userId = ctx.db.insert("users", {
      name: "Satyam", //HardCoded it for testing
    });
    return userId;
  },
});
