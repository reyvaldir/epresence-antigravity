import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("employee"), v.literal("admin"), v.literal("super_admin")),
        avatarUrl: v.optional(v.string()),
        phone: v.optional(v.string()),
        passwordHash: v.string(), // Simple password auth for MVP
        faceEmbedding: v.optional(v.array(v.number())), // For server-side verification if needed
        isApproved: v.optional(v.boolean()), // Admin approval required (optional for backward compatibility)
    }).index("by_email", ["email"]),

    attendance_records: defineTable({
        userId: v.id("users"),
        type: v.union(v.literal("check_in"), v.literal("check_out")),
        latitude: v.number(),
        longitude: v.number(),
        address: v.optional(v.string()),
        selfieUrl: v.string(),
        deviceFingerprintId: v.optional(v.string()),
        isSuspicious: v.boolean(),
        timestamp: v.number(),
        status: v.optional(v.string()), // "on_time", "late", "early_leave"
    }).index("by_user", ["userId"]),

    office_locations: defineTable({
        name: v.string(),
        latitude: v.number(),
        longitude: v.number(),
        radius: v.number(), // in meters
    }),

    absence_requests: defineTable({
        userId: v.id("users"),
        type: v.string(), // sick, annual, etc.
        reason: v.string(),
        status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
        documentUrl: v.optional(v.string()),
        startDate: v.number(),
        endDate: v.number(),
        approvedBy: v.optional(v.id("users")),
    }).index("by_user", ["userId"]),

    device_fingerprints: defineTable({
        userId: v.id("users"),
        deviceId: v.string(),
        browserInfo: v.optional(v.string()),
        osInfo: v.optional(v.string()),
        ipAddress: v.string(),
        isApproved: v.boolean(),
        lastSeen: v.number(),
    }).index("by_user", ["userId"]),

    work_schedules: defineTable({
        userId: v.id("users"),
        days: v.array(v.object({
            dayOfWeek: v.number(), // 0=Sun, 1=Mon, ...
            startTime: v.string(), // "09:00"
            endTime: v.string(),   // "17:00"
            isDayOff: v.boolean(),
        })),
    }).index("by_user", ["userId"]),

    schedule_overrides: defineTable({
        userId: v.id("users"),
        date: v.string(), // YYYY-MM-DD
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        isDayOff: v.boolean(),
        reason: v.optional(v.string()),
    }).index("by_user_date", ["userId", "date"]),
});
