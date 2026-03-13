import mongoose, { Schema } from "mongoose";

const EmailCountSchema = new Schema({
  unidentified_user_email: {
    type: Number,
    default: 0,
  },
  vehicle_detection_email: {
    type: Number,
    default: 0,
  },
});

const EmailCount =
  mongoose.models.EmailCount || mongoose.model("EmailCount", EmailCountSchema);
export default EmailCount;
