const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(
            process.env.MONGO_URI || "mongodb://localhost:27017/smartlease"
        );

        console.log("MongoDB connected");

        // Delete existing admin test record
        const deleted = await User.deleteOne({
            email: "admin.smartlease.test@example.com",
        });

        if (deleted.deletedCount > 0) {
            console.log("Existing admin deleted");
        } else {
            console.log("No existing admin found");
        }

        // Hash admin password
        const hashedPassword = await bcrypt.hash("Admin@2026Test", 10);

        // Create new admin
        const admin = await User.create({
            name: "System Admin",
            email: "admin.smartlease.test@example.com",
            password: hashedPassword,
            role: "admin",
            phone: "+91 90000 40001",
            isActive: true,
            emailVerified: true,
            profileImage: "",
            lastLogin: null,
        });

        console.log("Admin created successfully");
        console.log("--------------------------------");
        console.log("Name     :", admin.name);
        console.log("Email    :", admin.email);
        console.log("Password : Admin@2026Test");
        console.log("Role     :", admin.role);
        console.log("--------------------------------");

        await mongoose.connection.close();
        console.log("MongoDB connection closed");
    } catch (error) {
        console.error("Seeder error:", error.message);

        await mongoose.connection.close();
        process.exit(1);
    }
};

seedAdmin();