import { internalMutation } from "./_generated/server";

export const seedAdmin = internalMutation({
    args: {},
    handler: async (ctx) => {
        const email = "admin@epresence.com";
        const password = "admin123";
        const name = "System Admin";

        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                role: "super_admin",
                isApproved: true,
                passwordHash: password,
            });
            return "✅ Updated existing admin user!";
        }

        await ctx.db.insert("users", {
            name,
            email,
            passwordHash: password,
            role: "super_admin",
            isApproved: true,
        });
        return "✅ Created new admin user!";
    },
});
