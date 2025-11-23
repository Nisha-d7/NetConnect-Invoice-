const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: ".env.local" });

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/isp-invoice-portal";

const UserSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
      sparse: true,
      default: function () {
        if (this.role === "customer") {
          const date = new Date();
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0");
          return `CUST-${year}${month}-${random}`;
        }
        return undefined;
      },
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "staff"], required: true },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String, default: "Canada" },
    },
    serviceInfo: {
      plan: { type: String },
      speed: { type: String },
      monthlyRate: { type: Number },
      installationDate: { type: Date },
      status: {
        type: String,
        enum: ["Active", "Suspended", "Cancelled"],
        default: "Active",
      },
    },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const testUsers = [
  {
    email: "customer1@gmail.com",
    password: "password123",
    role: "customer",
    firstName: "John",
    lastName: "Smith",
    phone: "+1-416-555-0101",
    address: {
      street: "123 King Street West",
      city: "Toronto",
      state: "ON",
      zipCode: "M5H 3T9",
      country: "Canada",
    },
    serviceInfo: {
      plan: "High Speed Internet",
      speed: "100 Mbps",
      monthlyRate: 49.99,
      status: "Active",
    },
  },
  {
    email: "customer2@gmail.com",
    password: "password123",
    role: "customer",
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "+1-604-555-0102",
    address: {
      street: "456 Granville Street",
      city: "Vancouver",
      state: "BC",
      zipCode: "V6C 1V5",
      country: "Canada",
    },
    serviceInfo: {
      plan: "Premium Bundle",
      speed: "200 Mbps",
      monthlyRate: 89.99,
      status: "Active",
    },
  },
  {
    email: "customer3@gmail.com",
    password: "password123",
    role: "customer",
    firstName: "Mike",
    lastName: "Davis",
    phone: "+1-514-555-0103",
    address: {
      street: "789 Rue Sainte-Catherine",
      city: "Montreal",
      state: "QC",
      zipCode: "H3B 1B0",
      country: "Canada",
    },
    serviceInfo: {
      plan: "Basic Internet",
      speed: "50 Mbps",
      monthlyRate: 29.99,
      status: "Active",
    },
  },
  {
    email: "staff1@gmail.com",
    password: "password123",
    role: "staff",
    firstName: "Admin",
    lastName: "User",
  },
  {
    email: "staff2@gmail.com",
    password: "password123",
    role: "staff",
    firstName: "Jessica",
    lastName: "Manager",
  },
];

async function initDatabase() {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("MongoDB URI:", MONGODB_URI);

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully");

    // Get or create User model
    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    // Clear existing users (optional - comment out if you want to keep existing data)
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Hash passwords and create users
    const usersWithHashedPasswords = await Promise.all(
      testUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12),
      }))
    );

    // Insert users
    await User.insertMany(usersWithHashedPasswords);
    console.log("Test users created successfully");

    // Display login credentials
    console.log("\n=== Test Login Credentials ===");
    console.log("CUSTOMER ACCOUNTS:");
    console.log("Email: customer1@gmail.com | Password: password123");
    console.log("Email: customer2@gmail.com | Password: password123");
    console.log("Email: customer3@gmail.com | Password: password123");
    console.log("\nSTAFF ACCOUNTS:");
    console.log("Email: staff1@gmail.com | Password: password123");
    console.log("Email: staff2@gmail.com | Password: password123");
    console.log("===============================\n");
  } catch (error) {
    console.error("❌ Error initializing database:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n🔧 MongoDB Connection Failed!");
      console.log("Please ensure MongoDB is running. Here are some options:");
      console.log("1. Install and start MongoDB locally:");
      console.log(
        "   - macOS: brew install mongodb-community && brew services start mongodb-community"
      );
      console.log(
        "   - Or use MongoDB Atlas (cloud): https://cloud.mongodb.com"
      );
      console.log("2. Update MONGODB_URI in your .env.local file");
      console.log("3. Or use a different database service\n");
    }
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

initDatabase();
