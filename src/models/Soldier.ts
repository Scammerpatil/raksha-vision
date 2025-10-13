import mongoose, { Schema } from "mongoose";
const SoldierSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    profileImage: { type: String, required: true, default: "" },
    rank: { type: String, required: true },
    serviceNumber: { type: String, required: true, unique: true },
    unit: { type: String, required: true },
    dateOfEnlistment: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

const Soldier =
  mongoose.models.Soldier || mongoose.model("Soldier", SoldierSchema);
export default Soldier;
