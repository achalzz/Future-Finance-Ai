import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    income: { type: Number, required: true },
    savingsGoal: { type: Number, required: true },
    monthlyLimit: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Budget", budgetSchema);
