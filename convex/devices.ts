import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const registerDevice = mutation({
    args: {
        userId: v.id("users"),
        deviceId: v.string(),
        browserInfo: v.optional(v.string()),
        osInfo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if device already exists
        const existing = await ctx.db
            .query("device_fingerprints")
            .filter((q) => q.and(
                q.eq(q.field("userId"), args.userId),
                q.eq(q.field("deviceId"), args.deviceId)
            ))
            .first();

        if (existing) {
            // Update last seen
            await ctx.db.patch(existing._id, {
                lastSeen: Date.now(),
            });
            return existing._id;
        }

        // Create new device record
        return await ctx.db.insert("device_fingerprints", {
            userId: args.userId,
            deviceId: args.deviceId,
            browserInfo: args.browserInfo,
            osInfo: args.osInfo,
            ipAddress: "", // Placeholder
            isApproved: true, // Auto-approve first device
            lastSeen: Date.now(),
        });
    },
});

export const verifyDevice = query({
    args: {
        userId: v.id("users"),
        deviceId: v.string(),
    },
    handler: async (ctx, args) => {
        const device = await ctx.db
            .query("device_fingerprints")
            .filter((q) => q.and(
                q.eq(q.field("userId"), args.userId),
                q.eq(q.field("deviceId"), args.deviceId)
            ))
            .first();

        return {
            isKnown: !!device,
            isApproved: device?.isApproved ?? false,
        };
    },
});

export const getUserDevices = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("device_fingerprints")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .collect();
    },
});
