import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const login = mutation({
    args: { email: v.string(), password: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            return null; // User not found
        }

        // Check if user is approved (treat undefined as approved for existing users)
        if (user.isApproved === false) {
            throw new Error("Your account is pending admin approval. Please wait for approval before logging in.");
        }

        // In production, verify password hash
        // const isValid = await bcrypt.compare(args.password, user.passwordHash);
        // if (!isValid) return null;

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    },
});

export const createUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
        role: v.union(v.literal("employee"), v.literal("admin"), v.literal("super_admin")),
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existing) {
            throw new Error("User with this email already exists");
        }

        // In production, hash the password
        // const passwordHash = await bcrypt.hash(args.password, 10);

        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            passwordHash: args.password, // Store plaintext for MVP (NOT SECURE)
            role: args.role,
            isApproved: false, // Require admin approval
        });

        return userId;
    },
});
