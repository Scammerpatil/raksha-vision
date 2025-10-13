"use client";
import { Detection } from "@/Types";
import {
  IconCloudUpload,
  IconFile,
  IconFolder,
  IconVideo,
} from "@tabler/icons-react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<Detection | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = axios.postForm("/api/upload", { file });
      toast.promise(res, {
        loading: "Uploading and processing...",
        success: (data) => {
          console.log(data.data);
          setResult(data.data.result);
          return "File processed successfully!";
        },
        error: "Error processing file",
      });
    } catch (error) {
      console.log("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="bg-base-200 py-8 shadow-sm">
        <h1 className="text-3xl font-bold text-center text-base-content">
          🎯 Upload Video for Military Vehicle Detection
        </h1>
        <p className="text-center text-base-content/60 mt-2">
          Detect tanks, trucks, and other military assets automatically
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-base-300/50 backdrop-blur-md p-8 shadow-md max-w-3xl mx-auto rounded-2xl mt-10 border border-base-200">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center py-10 w-full border border-dashed border-primary/60 rounded-2xl cursor-pointer bg-base-200/60 hover:bg-base-200 transition-all duration-300"
        >
          <div className="mb-3 flex items-center justify-center text-primary">
            <IconCloudUpload size={60} stroke={1.5} />
          </div>
          <h2 className="text-center text-base-content/70 text-sm font-normal leading-4 mb-1">
            MP4, AVI, MOV up to 500MB
          </h2>
          <h4 className="text-center text-base-content/60 text-sm font-medium leading-snug">
            Drag & Drop your file here or
          </h4>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="mt-4 btn btn-outline btn-primary btn-sm gap-2">
            <IconFolder size={18} />
            {file ? (
              <span className="flex items-center gap-2">
                <IconFile size={18} /> {file.name}
              </span>
            ) : (
              "Browse Files"
            )}
          </div>
        </label>

        <button
          onClick={handleUpload}
          className="btn btn-primary w-full mt-6"
          disabled={!file || uploading}
        >
          {uploading ? (
            <>
              <span className="loading loading-spinner"></span>
              Processing...
            </>
          ) : (
            "Upload & Detect"
          )}
        </button>
      </div>

      {/* Detection Result Section */}
      {result && (
        <div className="mt-14 max-w-6xl mx-auto bg-base-200/60 backdrop-blur-md border border-base-300 rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 text-base-content">
            <IconVideo /> Detection Results
          </h2>

          <div className="flex justify-center mb-8">
            <p className="text-center">Original Video:</p>
            <video
              src={`/${result.original_video_url.replace("public/", "")}`}
              controls
              className="rounded-lg w-full max-w-4xl border border-base-300 shadow-lg"
            />
          </div>

          {/* Video Preview */}
          <div className="flex justify-center mb-8">
            <p className="text-center">Detected Video:</p>
            <video
              src={`/${result.detected_video_url.replace("public/", "")}`}
              controls
              className="rounded-lg w-full max-w-4xl border border-base-300 shadow-lg"
            />
          </div>

          {/* Summary Card */}
          <div className="bg-base-300/60 p-4 rounded-lg border border-base-200 mb-8">
            <h3 className="text-lg font-semibold mb-2 text-base-content">
              Detection Summary
            </h3>
            <p className="text-base-content/80 mb-2">
              Total Events:{" "}
              <span className="font-semibold text-primary">
                {result.summary.total_events}
              </span>
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              {Object.entries(result.summary.classes).map(([cls, count]) => (
                <div
                  key={cls}
                  className="badge badge-outline badge-primary p-3 text-sm"
                >
                  {cls}: {count}
                </div>
              ))}
            </div>
          </div>

          {/* Detected Events Table */}
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full border border-base-300 rounded-xl overflow-hidden">
              <thead className="bg-base-300/70 text-base-content">
                <tr>
                  <th>Class</th>
                  <th>Confidence</th>
                  <th>Frame</th>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
                {result.detected_events.map((e: any, idx: number) => (
                  <tr key={idx} className="hover:bg-base-200/70 transition">
                    <td className="capitalize font-medium">{e.class}</td>
                    <td>{(e.confidence * 100).toFixed(2)}%</td>
                    <td>{e.frame_indices[0]}</td>
                    <td>
                      <img
                        src={`/${e.best_frame_url.replace("public/", "")}`}
                        alt={e.class}
                        className="h-20 rounded-md border border-base-300 shadow-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
