require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("./db");
const User = require("./models/User");

const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "admin@freshfold.com"
).toLowerCase();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123456!";

async function run() {
  try {
    await connectDB();

    console.log("MongoDB connected");

    if (!ADMIN_EMAIL) {
      throw new Error("ADMIN_EMAIL is missing from .env");
    }

    if (!ADMIN_PASSWORD) {
      throw new Error("ADMIN_PASSWORD is missing from .env");
    }

    let admin = await User.findOne({ email: ADMIN_EMAIL });
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    if (admin) {
      admin.name = ADMIN_NAME;
      admin.passwordHash = passwordHash;
      admin.role = "admin";
      await admin.save();
      console.log("Admin account updated successfully!");
    } else {
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash,
        role: "admin",
      });
      console.log("Admin account created successfully!");
    }

    console.log("");
    console.log("Admin login:");
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log("");
    console.log("There is no public admin signup.");
    console.log("========================================");

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("❌ Admin seeding failed:");
    console.error(error);
    process.exit(1);
  }
}

run();