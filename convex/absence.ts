import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitAbsenceRequest = mutation({
    args: {
        userId: v.id("users"),
        type: v.string(), // sick, annual, personal, etc.
        reason: v.string(),
        startDate: v.number(),
        endDate: v.number(),
        documentUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("absence_requests", {
            userId: args.userId,
            type: args.type,
            reason: args.reason,
            startDate: args.startDate,
            endDate: args.endDate,
            documentUrl: args.documentUrl,
            status: "pending",
        });
    },
});

export const getUserAbsenceRequests = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("absence_requests")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});

export const getAllPendingRequests = query({
    args: {},
    handler: async (ctx) => {
        const requests = await ctx.db
            .query("absence_requests")
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();

        // Fetch user details for each request
        const requestsWithUsers = await Promise.all(
            requests.map(async (request) => {
                const user = await ctx.db.get(request.userId);
                return { ...request, userName: user?.name, userEmail: user?.email };
            })
        );

        return requestsWithUsers;
    },
});

export const approveAbsenceRequest = mutation({
    args: {
        requestId: v.id("absence_requests"),
        approvedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, {
            status: "approved",
            approvedBy: args.approvedBy,
        });
    },
});

export const rejectAbsenceRequest = mutation({
    args: {
        requestId: v.id("absence_requests"),
        approvedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.requestId, {
            status: "rejected",
            approvedBy: args.approvedBy,
        });
    },
});
