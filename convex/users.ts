import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const registerFace = mutation({
    args: {
        userId: v.id("users"),
        faceEmbedding: v.array(v.number())
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            faceEmbedding: args.faceEmbedding,
        });
    },
});

export const getUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

export const updateProfile = mutation({
    args: {
        userId: v.id("users"),
        name: v.optional(v.string()),
        password: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const updates: any = {};
        if (args.name) updates.name = args.name;
        if (args.password) updates.passwordHash = args.password; // Plaintext for now

        await ctx.db.patch(args.userId, updates);
    },
});
