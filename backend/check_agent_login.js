import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import dns from "dns";
import DeliveryAgent from "./models/deliveryAgentModel.js";

dotenv.config();

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    if (!MONGO_URI) {
      console.error("MONGO_URI is missing.");
      process.exit(1);
    }
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const email = "agent2@gmail.com";
    const agent = await DeliveryAgent.findOne({ email }).select("+password");

    if (!agent) {
      console.log(`Agent with email ${email} not found!`);
      const allAgents = await DeliveryAgent.find({}, "email approvalStatus status");
      console.log("Existing agents in DB:", allAgents);
      process.exit(0);
    }

    console.log("Agent found:", {
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      approvalStatus: agent.approvalStatus,
      status: agent.status,
    });

    const candidatePassword = "agent12345";
    const isMatch = await bcrypt.compare(candidatePassword, agent.password);
    console.log(`Password match ("${candidatePassword}"):`, isMatch);

    if (!isMatch) {
      console.log("Hashing new password...");
      const salt = await bcrypt.genSalt(10);
      agent.password = await bcrypt.hash(candidatePassword, salt);
      await agent.save();
      console.log("Password updated successfully to agent12345.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();
