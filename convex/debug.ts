import { query } from "./_generated/server";

export const debugAuthFlow = query({
  args: {},
  handler: async (ctx) => {
    // Check authentication status
    const identity = await ctx.auth.getUserIdentity();
    return { 
      status: "Clerk Auth active",
      isAuthenticated: !!identity,
      userId: identity?.subject || null
    };
  },
});
