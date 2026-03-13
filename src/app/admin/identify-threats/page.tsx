"use client";

import Title from "@/components/Title";
import { Detection } from "@/Types";
import { sendBrowserNotification } from "@/utils/browserNotification";
import {
  IconCloudUpload,
  IconFile,
  IconFolder,
  IconVideo,
  IconSearch,
  IconMaximize,
  IconZoomIn,
  IconZoomOut,
  IconX,
  IconEye,
  IconChartBar,
} from "@tabler/icons-react";
import axios from "axios";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<Detection | null>(null);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(1);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = axios.postForm("/api/upload", { file });
      toast.promise(res, {
        loading: "Analyzing tactical feed...",
        success: (data) => {
          setResult(data.data.result);
          sendBrowserNotification(
            "Email Sent",
            "Email sent successfully. Please check your inbox."
          );
          return "Intelligence report generated!";
        },
        error: "Signal lost. Error processing file.",
      });
    } catch (error) {
      console.log("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Title
        title="Tactical Asset Identification"
        subtitle="AI-Powered Military Vehicle Intelligence & Reconnaissance"
      />

      {/* Upload Section */}
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <div className="card bg-base-200 border border-base-300 shadow-2xl overflow-hidden">
          <div className="h-1 bg-primary w-full opacity-50"></div>
          <div className="card-body p-1">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center py-12 w-full border-2 border-dashed border-base-300 rounded-xl cursor-pointer bg-base-200/30 hover:bg-base-200/50 transition-all group"
            >
              <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform mb-4">
                <IconCloudUpload size={48} stroke={1.5} />
              </div>
              <p className="text-lg font-bold tracking-tight">
                {file ? file.name : "Deploy Intelligence Feed"}
              </p>
              <p className="text-xs opacity-50 uppercase tracking-widest mt-1 font-black">
                MP4, AVI, MOV • Maximum 500MB
              </p>

              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {!file && (
                <div className="mt-6 btn btn-primary btn-sm px-8 shadow-lg shadow-primary/20">
                  <IconFolder size={18} /> Browse Storage
                </div>
              )}
            </label>
          </div>
          {file && (
            <div className="p-4 bg-base-200 flex gap-2">
              <button
                onClick={handleUpload}
                className="btn btn-primary flex-1 shadow-lg shadow-primary/20"
                disabled={uploading}
              >
                {uploading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Initiate Analysis"
                )}
              </button>
              <button
                onClick={() => setFile(null)}
                className="btn btn-error btn-outline"
                disabled={uploading}
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="mt-16 max-w-6xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Video Comparison */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative group rounded-2xl overflow-hidden border border-base-300 shadow-2xl bg-base-300 aspect-video">
                <video
                  src={`/${result.detected_video_url.replace("public/", "")}`}
                  controls
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Right: Summary Stats */}
            <div className="space-y-6">
              <div className="card bg-base-300 border border-base-300 shadow-xl">
                <div className="card-body p-6">
                  <h3 className="card-title text-sm uppercase tracking-[0.2em] opacity-50 mb-4">
                    <IconChartBar size={18} /> Recon Summary
                  </h3>
                  <div className="stats stats-vertical bg-base-200 w-full rounded-xl overflow-hidden">
                    <div className="stat py-4">
                      <div className="stat-title text-xs font-bold uppercase">
                        Total Targets
                      </div>
                      <div className="stat-value text-primary text-3xl font-black">
                        {result.summary.total_events}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {Object.entries(result.summary.classes).map(
                      ([cls, count]) => (
                        <div
                          key={cls}
                          className="flex items-center justify-between p-3 bg-base-200 rounded-lg border border-base-300"
                        >
                          <span className="capitalize font-bold opacity-70">
                            {cls}
                          </span>
                          <span className="badge badge-primary font-black">
                            {count}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table: Detailed Event Ledger */}
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-6 mt-8">
              <IconSearch className="text-primary" />
              <h2 className="text-xl font-black tracking-tight uppercase">
                Event Ledger
              </h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-base-300 shadow-xl bg-base-100">
              <table className="table table-zebra">
                <thead className="bg-base-200">
                  <tr className="uppercase text-[10px] tracking-widest opacity-60">
                    <th className="py-4">Asset Class</th>
                    <th>Confidence Score</th>
                    <th>Entry Frame</th>
                    <th className="text-right">Intelligence Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {result.detected_events.map((e: any, idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-primary/5 transition-colors group"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--p),0.5)]"></div>
                          <span className="font-black capitalize text-lg tracking-tight">
                            {e.class}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="radial-progress text-primary font-bold">
                          {Math.round(e.confidence * 100)}%
                        </div>
                      </td>
                      <td className="font-mono text-sm opacity-60">
                        FR-{e.frame_indices[0]}
                      </td>
                      <td className="text-right">
                        <div
                          className="relative inline-block cursor-zoom-in group"
                          onClick={() => {
                            setSelectedImg(
                              `/${e.best_frame_url.replace("public/", "")}`
                            );
                            setZoom(1);
                            dialogRef.current?.showModal();
                          }}
                        >
                          <img
                            src={`/${e.best_frame_url.replace("public/", "")}`}
                            alt={e.class}
                            className="h-14 w-24 object-cover rounded-lg border border-base-300 group-hover:border-primary transition-all shadow-md"
                          />
                          <div className="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <IconMaximize
                              size={16}
                              className="text-base-content"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedImg && (
        <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
          <div className="modal-box bg-black/95 backdrop-blur-md max-w-6xl p-0 overflow-hidden">
            {/* Toolbar */}
            <div className="absolute top-4 right-4 flex gap-3 z-10">
              <div className="join bg-base-100/10 border border-white/20 p-1 rounded-xl">
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.5, 0.5))}
                  className="btn btn-ghost btn-sm text-white join-item"
                >
                  <IconZoomOut size={18} />
                </button>
                <div className="flex items-center px-3 text-xs font-black text-white join-item">
                  {(zoom * 100).toFixed(0)}%
                </div>
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
                  className="btn btn-ghost btn-sm text-white join-item"
                >
                  <IconZoomIn size={18} />
                </button>
              </div>

              <form method="dialog">
                <button
                  onClick={() => setSelectedImg(null)}
                  className="btn btn-circle btn-error"
                >
                  <IconX size={20} />
                </button>
              </form>
            </div>

            {/* Image */}
            <div className="flex items-center justify-center h-[80vh] overflow-auto cursor-grab active:cursor-grabbing">
              {selectedImg && (
                <img
                  src={selectedImg}
                  alt="Inspection Preview"
                  className="max-w-none transition-transform duration-200 ease-out shadow-2xl rounded-sm"
                  style={{ transform: `scale(${zoom})` }}
                />
              )}
            </div>

            {/* Hint */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
              Tactical Image Inspection Mode
            </div>
          </div>

          {/* Click outside to close */}
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelectedImg(null)}>close</button>
          </form>
        </dialog>
      )}
    </>
  );
}
