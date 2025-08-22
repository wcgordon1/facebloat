import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// Internal function to create or update user from Clerk webhook
export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(), // Required from Clerk
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    lastSignInAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        username: args.username,
        imageUrl: args.imageUrl,
        updatedAt: args.updatedAt,
        lastSignInAt: args.lastSignInAt,
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        username: args.username,
        imageUrl: args.imageUrl,
        createdAt: args.createdAt,
        updatedAt: args.updatedAt,
        lastSignInAt: args.lastSignInAt,
        onboardingCompleted: false,
      });
      return userId;
    }
  },
});

// Internal function to delete user
export const deleteFromClerk = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      // Delete related data
      const [userProfile, subscriptions, selfiePhotos] = await Promise.all([
        ctx.db
          .query("userProfiles")
          .withIndex("userId", (q) => q.eq("userId", user._id))
          .unique(),
        ctx.db
          .query("subscriptions")
          .withIndex("userId", (q) => q.eq("userId", user._id))
          .collect(),
        ctx.db
          .query("selfiePhotos")
          .withIndex("userId", (q) => q.eq("userId", user._id))
          .collect(),
      ]);

      // Delete related records
      if (userProfile) await ctx.db.delete(userProfile._id);
      for (const subscription of subscriptions) {
        await ctx.db.delete(subscription._id);
      }
      for (const photo of selfiePhotos) {
        await ctx.db.delete(photo._id);
      }

      // Delete user
      await ctx.db.delete(user._id);
    }
  },
});

// Get user by Clerk ID (internal)
export const getByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

// Sync current user from Clerk identity (called on first login)
export const syncCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Extract data from Clerk identity (ensure proper string types)
    const clerkId = identity.subject;
    const email = typeof identity.email === 'string' ? identity.email : undefined;
    const name = typeof identity.name === 'string' ? identity.name : 
                 typeof identity.given_name === 'string' ? identity.given_name : undefined;
    const username = typeof identity.username === 'string' ? identity.username : undefined;
    const imageUrl = typeof identity.picture === 'string' ? identity.picture : undefined;
    
    // Sync user to database
    await ctx.runMutation(internal.users.upsertFromClerk, {
      clerkId,
      email,
      name,
      username,
      imageUrl,
      updatedAt: Date.now(),
      lastSignInAt: Date.now(),
    });
  },
});

// Get current user from database (read-only)
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user; // Return null if user doesn't exist - frontend should call ensureUser
  },
});

// Ensure current user exists in database (creates if needed)
export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    let user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      // User exists in Clerk but not in our database
      // This can happen before webhooks are set up or for existing users
      // Create the user now
      const email = typeof identity.email === 'string' ? identity.email : undefined;
      const name = typeof identity.name === 'string' ? identity.name : 
                   typeof identity.given_name === 'string' ? identity.given_name : undefined;
      const username = typeof identity.username === 'string' ? identity.username : undefined;
      const imageUrl = typeof identity.picture === 'string' ? identity.picture : undefined;

      const userId = await ctx.db.insert("users", {
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

      user = await ctx.db.get(userId);
    }

    return user;
  },
});

// Update user onboarding status
export const completeOnboarding = mutation({
  args: { username: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      onboardingCompleted: true,
      username: args.username || user.username,
      updatedAt: Date.now(),
    });
  },
});
