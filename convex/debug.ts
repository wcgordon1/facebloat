import { query } from "./_generated/server";

export const debugAuthFlow = query({
  args: {},
  handler: async (ctx) => {
    // No-op or update for Clerk if needed
    return { status: "Clerk Auth active" };
  },
});
