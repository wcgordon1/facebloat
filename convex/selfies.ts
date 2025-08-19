import { v } from "convex/values";
import { mutation, query } from "@cvx/_generated/server";
import { auth } from "@cvx/auth";

/**
 * Upload a selfie photo
 */
export const uploadSelfie = mutation({
  args: {
    storageId: v.id("_storage"),
    originalFilename: v.optional(v.string()),
    mimeType: v.string(),
    fileSize: v.number(),
    captureMethod: v.union(v.literal("camera"), v.literal("upload")),
    metadata: v.optional(v.object({
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      deviceInfo: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Create selfie record
    const selfieId = await ctx.db.insert("selfiePhotos", {
      userId,
      storageId: args.storageId,
      originalFilename: args.originalFilename,
      mimeType: args.mimeType,
      fileSize: args.fileSize,
      captureMethod: args.captureMethod,
      metadata: args.metadata,
      analysisStatus: "pending",
    });

    return selfieId;
  },
});

/**
 * Get all selfies for the current user
 */
export const getUserSelfies = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const selfies = await ctx.db
      .query("selfiePhotos")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Get storage URLs for each selfie
    const selfiesWithUrls = await Promise.all(
      selfies.map(async (selfie) => {
        const url = await ctx.storage.getUrl(selfie.storageId);
        return {
          ...selfie,
          url,
        };
      })
    );

    return selfiesWithUrls;
  },
});

/**
 * Get a specific selfie by ID (with authorization check)
 */
export const getSelfie = query({
  args: { selfieId: v.id("selfiePhotos") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const selfie = await ctx.db.get(args.selfieId);
    if (!selfie) {
      throw new Error("Selfie not found");
    }

    // Row-level security: ensure user owns this selfie
    if (selfie.userId !== userId) {
      throw new Error("Not authorized to access this selfie");
    }

    const url = await ctx.storage.getUrl(selfie.storageId);
    return {
      ...selfie,
      url,
    };
  },
});

/**
 * Delete a selfie
 */
export const deleteSelfie = mutation({
  args: { selfieId: v.id("selfiePhotos") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const selfie = await ctx.db.get(args.selfieId);
    if (!selfie) {
      throw new Error("Selfie not found");
    }

    // Row-level security: ensure user owns this selfie
    if (selfie.userId !== userId) {
      throw new Error("Not authorized to delete this selfie");
    }

    // Delete the file from storage
    await ctx.storage.delete(selfie.storageId);

    // Delete the database record
    await ctx.db.delete(args.selfieId);
  },
});

/**
 * Generate upload URL for selfie photos
 */
export const generateSelfieUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Update selfie analysis data (for future AI integration)
 */
export const updateSelfieAnalysis = mutation({
  args: {
    selfieId: v.id("selfiePhotos"),
    analysisData: v.any(),
    analysisStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const selfie = await ctx.db.get(args.selfieId);
    if (!selfie) {
      throw new Error("Selfie not found");
    }

    // Row-level security: ensure user owns this selfie
    if (selfie.userId !== userId) {
      throw new Error("Not authorized to update this selfie");
    }

    await ctx.db.patch(args.selfieId, {
      analysisData: args.analysisData,
      analysisStatus: args.analysisStatus,
    });
  },
});
