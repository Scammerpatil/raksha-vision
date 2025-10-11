import mongoose, { Schema } from "mongoose";

const DetectionSchema = new Schema({
  upload_id: { type: String, required: true },
  uploader_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  original_video_url: { type: String, required: true },
  detected_video_url: { type: String, required: true },
  detected_events: [
    {
      class: { type: String, required: true },
      confidence: { type: Number, required: true },
      first_seen: { type: Number, required: true },
      last_seen: { type: Number, required: true },
      frame_indices: { type: [Number], required: true },
      best_frame_url: { type: String, required: true },
      bbox: { type: [Number], required: true },
    },
  ],
  summary: {
    total_events: { type: Number, required: true },
    classes: { type: Map, of: Number, required: true },
  },
  processed_at: { type: Date, required: true },
});

const Detection =
  mongoose.models.Detection || mongoose.model("Detection", DetectionSchema);
export default Detection;
