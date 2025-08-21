import { query } from "./_generated/server";

export const debugAuthFlow = query({
  args: {},
  handler: async (ctx) => {
    const verificationCodes = await (ctx.db as any).query("authVerificationCodes").collect();
    const accounts = await (ctx.db as any).query("authAccounts").collect();
    const sessions = await (ctx.db as any).query("authSessions").collect();
    
    return {
      verificationCodes: verificationCodes.map((code: any) => ({
        id: code._id,
        provider: code.provider,
        emailVerified: code.emailVerified,
        expirationTime: new Date(code.expirationTime).toISOString(),
        createdAt: new Date(code._creationTime).toISOString(),
        hasCode: !!code.code
      })),
      accounts: accounts.map((acc: any) => ({
        id: acc._id,
        provider: acc.provider,
        providerAccountId: acc.providerAccountId,
        createdAt: new Date(acc._creationTime).toISOString()
      })),
      sessions: sessions.length,
      timestamp: new Date().toISOString()
    };
  },
});
