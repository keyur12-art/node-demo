const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");
    console.log("📦 DB Name:", conn.connection.name);
    console.log("🌍 Host:", conn.connection.host);
  } catch (error) {
    console.error("❌ MongoDB Connection Error");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
