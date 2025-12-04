import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Internal helper to calculate effective schedule
export const calculateEffectiveSchedule = async (db: any, userId: any, date: string) => {
    // 1. Check for override
    const override = await db
        .query("schedule_overrides")
        .withIndex("by_user_date", (q: any) => q.eq("userId", userId).eq("date", date))
        .first();

    if (override) {
        return {
            type: "override",
            startTime: override.startTime,
            endTime: override.endTime,
            isDayOff: override.isDayOff,
            reason: override.reason,
        };
    }

    // 2. Fallback to weekly schedule
    const schedule = await db
        .query("work_schedules")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .first();

    if (schedule) {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay(); // 0=Sun
        const daySchedule = schedule.days.find((d: any) => d.dayOfWeek === dayOfWeek);

        if (daySchedule) {
            return {
                type: "weekly",
                startTime: daySchedule.startTime,
                endTime: daySchedule.endTime,
                isDayOff: daySchedule.isDayOff,
            };
        }
    }

    // 3. Default (Mon-Fri 9-5)
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return {
        type: "default",
        startTime: "09:00",
        endTime: "17:00",
        isDayOff: isWeekend,
    };
};

// Get a specific user's schedule
export const getSchedule = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("work_schedules")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();
    },
});

// Update or create a user's schedule
export const updateSchedule = mutation({
    args: {
        userId: v.id("users"),
        days: v.array(v.object({
            dayOfWeek: v.number(),
            startTime: v.string(),
            endTime: v.string(),
            isDayOff: v.boolean(),
        })),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("work_schedules")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                days: args.days,
            });
        } else {
            await ctx.db.insert("work_schedules", {
                userId: args.userId,
                days: args.days,
            });
        }
    },
});

// Get a specific user's schedule (Base + Overrides)
export const getEffectiveSchedule = query({
    args: {
        userId: v.id("users"),
        date: v.string(), // YYYY-MM-DD
    },
    handler: async (ctx, args) => {
        return await calculateEffectiveSchedule(ctx.db, args.userId, args.date);
    },
});

// Set a schedule override
export const setScheduleOverride = mutation({
    args: {
        userId: v.id("users"),
        date: v.string(),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        isDayOff: v.boolean(),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("schedule_overrides")
            .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", args.date))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                startTime: args.startTime,
                endTime: args.endTime,
                isDayOff: args.isDayOff,
                reason: args.reason,
            });
        } else {
            await ctx.db.insert("schedule_overrides", {
                userId: args.userId,
                date: args.date,
                startTime: args.startTime,
                endTime: args.endTime,
                isDayOff: args.isDayOff,
                reason: args.reason,
            });
        }
    },
});

// Get all schedules (for admin overview)
export const getAllSchedules = query({
    args: {},
    handler: async (ctx) => {
        const schedules = await ctx.db.query("work_schedules").collect();

        // Enrich with user details
        const schedulesWithUser = await Promise.all(
            schedules.map(async (schedule) => {
                const user = await ctx.db.get(schedule.userId);
                return {
                    ...schedule,
                    userName: user?.name || "Unknown",
                    userEmail: user?.email || "",
                };
            })
        );

        return schedulesWithUser;
    },
});
