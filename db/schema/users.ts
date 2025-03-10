import { pgTable, serial, varchar, timestamp, text } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', {length: 255}).notNull().unique(),
    otp: varchar('otp', {length: 6}), 
    otpExpiresAt: timestamp('otp_expires_at'),
    username: varchar('username', {length: 50}).unique(),
    fullName: varchar('full_name', {length: 100}),
    profileImageUrl: varchar('profile_image_url', {length: 255}),
    bio: text('bio'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});


