export interface User {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  password: string;
  role?: "admin" | "user";
  otp?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Detection {
  _id?: string;
  upload_id: string;
  uploader_id: string;
  original_video_url: string;
  detected_video_url: string;
  detected_events: DetectedEvent[];
  summary: DetectionSummary;
  processed_at: Date;
}

export interface DetectedEvent {
  class: string;
  confidence: number;
  first_seen: number;
  last_seen: number;
  frame_indices: number[];
  best_frame_url: string;
  bbox: number[];
}

export interface DetectionSummary {
  total_events: number;
  classes: { [key: string]: number };
}
