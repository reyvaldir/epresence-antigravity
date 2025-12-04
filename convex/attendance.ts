import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { calculateEffectiveSchedule } from "./schedules";

export const checkIn = mutation({
    args: {
        userId: v.id("users"),
        latitude: v.number(),
        longitude: v.number(),
        address: v.optional(v.string()),
        selfieUrl: v.string(), // In a real app, upload to storage first and get URL
        isSuspicious: v.boolean(),
    },
    handler: async (ctx, args) => {
        // Check if already checked in today (optional logic)

        // Calculate status
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const schedule = await calculateEffectiveSchedule(ctx.db, args.userId, dateStr);

        let status = "on_time";

        if (schedule && !schedule.isDayOff && schedule.startTime) {
            const [schedHour, schedMin] = schedule.startTime.split(':').map(Number);
            const schedTime = new Date(now);
            schedTime.setHours(schedHour, schedMin, 0, 0);

            // Allow 15 minutes grace period
            const gracePeriod = 15 * 60 * 1000;

            if (now.getTime() > schedTime.getTime() + gracePeriod) {
                status = "late";
            }
        }

        await ctx.db.insert("attendance_records", {
            userId: args.userId,
            type: "check_in",
            latitude: args.latitude,
            longitude: args.longitude,
            address: args.address,
            selfieUrl: args.selfieUrl,
            isSuspicious: args.isSuspicious,
            timestamp: Date.now(),
            status: status,
        });
    },
});

export const checkOut = mutation({
    args: {
        userId: v.id("users"),
        latitude: v.number(),
        longitude: v.number(),
        address: v.optional(v.string()),
        selfieUrl: v.string(),
        isSuspicious: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("attendance_records", {
            userId: args.userId,
            type: "check_out",
            latitude: args.latitude,
            longitude: args.longitude,
            address: args.address,
            selfieUrl: args.selfieUrl,
            isSuspicious: args.isSuspicious,
            timestamp: Date.now(),
        });
    },
});

export const getTodayAttendance = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        // Simple query to get latest record
        // In production, filter by today's date range
        return await ctx.db
            .query("attendance_records")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .first();
    },
});
