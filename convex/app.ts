import { internal } from "@cvx/_generated/api";
import { mutation, query } from "./_generated/server";
import { currencyValidator, PLANS } from "@cvx/schema";
import { asyncMap } from "convex-helpers";
import { v } from "convex/values";
import { User } from "~/types";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx): Promise<User | undefined> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return undefined;
    }
    
    // Use the Clerk user ID from the JWT
    const userId = identity.subject;
    if (!userId) return undefined;
    
    // For now, just return user data from Clerk identity
    // You can implement user creation/storage logic later
    return {
      _id: userId as any,
      _creationTime: Date.now(),
      email: identity.email,
      name: identity.name || identity.given_name || undefined,
      username: identity.username || undefined,
    } as User;
  },
});

export const updateUsername = mutation({
  args: {
    username: v.string(),
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
    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, { username: args.username });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: userId as any,
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
    const userId = identity.subject;
    if (!userId) {
      return;
    }
    const user = await ctx.db.get(userId as any);
    if (!user) {
      return;
    }
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("userId", (q) => q.eq("userId", userId as any))
      .unique();
    if (profile) {
      await ctx.db.patch(profile._id, { username: args.username });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: userId as any,
        username: args.username,
      });
    }
    if (profile?.customerId) {
      return;
    }
    await ctx.scheduler.runAfter(
      0,
      internal.stripe.PREAUTH_createStripeCustomer,
      {
        currency: args.currency,
        userId: userId as any,
      },
    );
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
