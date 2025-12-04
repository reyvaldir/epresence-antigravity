import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Employee Management
export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    },
});

export const updateUserRole = mutation({
    args: {
        userId: v.id("users"),
        role: v.union(v.literal("employee"), v.literal("admin"), v.literal("super_admin")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, { role: args.role });
    },
});

export const deleteUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        // 1. Delete Attendance Records
        const attendance = await ctx.db
            .query("attendance_records")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
        for (const record of attendance) {
            await ctx.db.delete(record._id);
        }

        // 2. Delete Absence Requests
        const absences = await ctx.db
            .query("absence_requests")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
        for (const absence of absences) {
            await ctx.db.delete(absence._id);
        }

        // 3. Delete Schedule Overrides
        const overrides = await ctx.db
            .query("schedule_overrides")
            .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
            .collect();
        for (const override of overrides) {
            await ctx.db.delete(override._id);
        }

        // 4. Delete Weekly Schedule
        const weeklySchedule = await ctx.db
            .query("work_schedules")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique();
        if (weeklySchedule) {
            await ctx.db.delete(weeklySchedule._id);
        }

        // 5. Delete Device Fingerprints
        const fingerprints = await ctx.db
            .query("device_fingerprints")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
        for (const fp of fingerprints) {
            await ctx.db.delete(fp._id);
        }

        // 6. Finally, delete the user
        await ctx.db.delete(args.userId);
    },
});

export const approveUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, { isApproved: true });
    },
});

// User approval functions
export const getPendingUsers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("isApproved"), false))
            .collect();
    },
});

// Office Location Management
export const getAllOfficeLocations = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("office_locations").collect();
    },
});

export const createOfficeLocation = mutation({
    args: {
        name: v.string(),
        latitude: v.number(),
        longitude: v.number(),
        radius: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("office_locations", args);
    },
});

export const updateOfficeLocation = mutation({
    args: {
        locationId: v.id("office_locations"),
        name: v.string(),
        latitude: v.number(),
        longitude: v.number(),
        radius: v.number(),
    },
    handler: async (ctx, args) => {
        const { locationId, ...data } = args;
        await ctx.db.patch(locationId, data);
    },
});

export const deleteOfficeLocation = mutation({
    args: { locationId: v.id("office_locations") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.locationId);
    },
});

// Reports
export const getAttendanceReport = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, _args) => {
        let query = ctx.db.query("attendance_records");

        const records = await query.collect();

        // Fetch user details for each record
        const recordsWithUsers = await Promise.all(
            records.map(async (record) => {
                const user = await ctx.db.get(record.userId);
                return { ...record, userName: user?.name, userEmail: user?.email };
            })
        );

        return recordsWithUsers;
    },
});
