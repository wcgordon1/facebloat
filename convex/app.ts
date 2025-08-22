import { internal } from "@cvx/_generated/api";
import { mutation, query } from "./_generated/server";
import { currencyValidator, PLANS } from "@cvx/schema";
import { asyncMap } from "convex-helpers";
import { v } from "convex/values";
// Removed unused User import

// This now uses the new users.ts functions
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Use the new user sync function
    return await ctx.runQuery("users:getCurrentUser" as any, {});
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
