import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, required: true, default: 0 },
    category: { type: String, required: true }, // e.g. Car Fund, Emergency Fund
    monthlyContribution: { type: Number, default: 0 }, // ₹/month the user plans to save
    targetDate: { type: Date, default: null },         // Optional deadline
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Goal", goalSchema);
