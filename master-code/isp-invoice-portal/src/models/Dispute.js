import mongoose from "mongoose";

const DisputeSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    mobile: { type: String, required: true },
    category: { type: String, enum: ["Dispute", "Enquiry"], required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
    },
    resolvedBy: { type: String },
    resolvedAt: { type: Date },
    notes: { type: String },
  },
  {
    collection: "disputes",
    timestamps: true,
  }
);

export default mongoose.models.Dispute ||
  mongoose.model("Dispute", DisputeSchema);
