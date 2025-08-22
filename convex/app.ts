import { internal } from "@cvx/_generated/api";
import { mutation, query } from "./_generated/server";
import { currencyValidator, PLANS } from "@cvx/schema";
import { asyncMap } from "convex-helpers";
import { v } from "convex/values";
// Removed unused User import

// Get current user with automatic creation if needed
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    let user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      // User exists in Clerk but not in our database
      // This can happen before webhooks are set up or for existing users
      // Return a temporary user object with Clerk data
      return {
        _id: identity.subject as any,
        _creationTime: Date.now(),
        clerkId: identity.subject,
        email: typeof identity.email === 'string' ? identity.email : undefined,
        name: typeof identity.name === 'string' ? identity.name : 
              typeof identity.given_name === 'string' ? identity.given_name : undefined,
        username: typeof identity.username === 'string' ? identity.username : undefined,
        imageUrl: typeof identity.picture === 'string' ? identity.picture : undefined,
        onboardingCompleted: false,
        // Legacy fields for compatibility
        avatarUrl: typeof identity.picture === 'string' ? identity.picture : undefined,
        customerId: undefined as string | undefined,
      };
    }

    // Get userProfile and subscription for additional fields
    const [userProfile, subscription] = await Promise.all([
      ctx.db
        .query("userProfiles")
        .withIndex("userId", (q) => q.eq("userId", user._id))
        .unique(),
      ctx.db
        .query("subscriptions")
        .withIndex("userId", (q) => q.eq("userId", user._id))
        .unique()
    ]);

    // Get plan data if subscription exists
    const plan = subscription ? await ctx.db.get(subscription.planId) : null;

    // Combine user data with profile and subscription data for full compatibility
    return {
      ...user,
      avatarUrl: user.imageUrl,
      username: user.username || userProfile?.username,
      customerId: userProfile?.customerId,
      imageId: userProfile?.imageId,
      subscription: subscription ? {
        ...subscription,
        plan,
        planKey: plan?.key,
        interval: subscription.interval,
        planId: subscription.planId,
      } : null,
    };
  },
});

// Sync current user to database (call this when user first accesses dashboard)
export const syncCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingUser = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!existingUser) {
      // Create user in database
      const email = typeof identity.email === 'string' ? identity.email : undefined;
      const name = typeof identity.name === 'string' ? identity.name : 
                   typeof identity.given_name === 'string' ? identity.given_name : undefined;
      const username = typeof identity.username === 'string' ? identity.username : undefined;
      const imageUrl = typeof identity.picture === 'string' ? identity.picture : undefined;

      await ctx.db.insert("users", {
        clerkId: identity.subject,
        email,
        name,
        username,
        imageUrl,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastSignInAt: Date.now(),
        onboardingCompleted: false,
      });
    }
  },
});

export const updateUsername = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
      
    if (!user) throw new Error("User not found");

    // Update user record
    await ctx.db.patch(user._id, { 
      username: args.username,
      updatedAt: Date.now(),
    });

    // Also update userProfile for backward compatibility
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .unique();
    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, { username: args.username });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: user._id,
        username: args.username,
      });
    }
  },
});

export const completeOnboarding = mutation({
  args: {
    username: v.string(),
    currency: currencyValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
      
    if (!user) throw new Error("User not found");

    // Mark onboarding as completed
    await ctx.db.patch(user._id, { 
      username: args.username,
      onboardingCompleted: true,
      updatedAt: Date.now(),
    });

    // Update or create userProfile for backward compatibility
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .unique();
    if (profile) {
      await ctx.db.patch(profile._id, { username: args.username });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: user._id,
        username: args.username,
      });
    }
    
    // Create Stripe customer if not exists
    if (!profile?.customerId) {
      await ctx.scheduler.runAfter(
        0,
        internal.stripe.PREAUTH_createStripeCustomer,
        {
          currency: args.currency,
          userId: user._id,
        },
      );
    }
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    if (!userId) {
      throw new Error("User not found");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateUserImage = mutation({
  args: {
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("userId", (q) => q.eq("userId", userId as any))
      .unique();
    if (!existingProfile) {
      throw new Error("User profile not found");
    }
    await ctx.db.patch(existingProfile._id, { imageId: args.imageId });
  },
});

export const removeUserImage = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("userId", (q) => q.eq("userId", userId as any))
      .unique();
    if (!existingProfile) {
      throw new Error("User profile not found");
    }
    await ctx.db.patch(existingProfile._id, { imageId: undefined });
  },
});

export const getActivePlans = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    if (!userId) {
      return;
    }
    const [free, pro] = await asyncMap(
      [PLANS.FREE, PLANS.PRO] as const,
      (key) =>
        ctx.db
          .query("plans")
          .withIndex("key", (q) => q.eq("key", key))
          .unique(),
    );
    if (!free || !pro) {
      throw new Error("Plan not found");
    }
    return { free, pro };
  },
});

export const deleteCurrentUserAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const [profile, subscription] = await Promise.all([
      ctx.db
        .query("userProfiles")
        .withIndex("userId", (q) => q.eq("userId", userId as any))
        .unique(),
      ctx.db
        .query("subscriptions")
        .withIndex("userId", (q) => q.eq("userId", userId as any))
        .unique(),
    ]);
    if (profile) {
      await ctx.db.delete(profile._id);
    }
    if (subscription) {
      await ctx.db.delete(subscription._id);
    }
    // Note: Cannot delete userId directly - it's from Clerk, not your DB
  },
});
