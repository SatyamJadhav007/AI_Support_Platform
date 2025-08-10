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
    const userId = ctx.db.insert("users", {
      name: "Satyam", //HardCoded it for testing
    });
    return userId;
  },
});
