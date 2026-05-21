"use client";

import { ImageIcon, Loader2, Send, Copy, Check, Database, Sparkles, Clock, FileImage } from "lucide-react";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Database Integration States
  const [history, setHistory] = useState([]);
  const [dbError, setDbError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [copiedCurrent, setCopiedCurrent] = useState(false);

  // Fetch caption history from MongoDB
  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history");
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      if (data.ok) {
        setHistory(data.captions);
        setDbError("");
      } else {
        setDbError(data.error || "Could not load history");
      }
    } catch (err) {
      console.error(err);
      setDbError("Database not connected. Add MONGODB_URI to .env.local to persist captions.");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleImageChange = (image) => {
    setError("");
    setCaption("");
    setFile(image);

    if (!image) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(image);
    setPreview(url);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setCaption("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/caption", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Captioning request failed.");
      }

      const data = await response.json();
      setCaption(data.caption ?? "No caption returned.");
      
      // Refresh database history immediately!
      fetchHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    if (id === "current") {
      setCopiedCurrent(true);
      setTimeout(() => setCopiedCurrent(false), 2000);
    } else {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Helper to format file sizes
  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Helper to format date relatively or nicely
  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "Just now";
      if (diffMins === 1) return "1 min ago";
      if (diffMins < 60) return `${diffMins} mins ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) return "1 hour ago";
      if (diffHours < 24) return `${diffHours} hours ago`;

      return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "Recently";
    }
  };

  return (
    <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 sm:px-8 overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />

      <section className="relative rounded-3xl border border-slate-800 bg-slate-950/40 p-8 shadow-2xl shadow-slate-950/55 backdrop-blur-2xl">
        {/* Header Block */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-400 animate-pulse" />
              <p className="text-sm uppercase tracking-[0.3em] font-semibold text-cyan-400/90">CaptionAI</p>
            </div>
            <h1 className="mt-3 text-4xl font-extrabold text-white tracking-tight sm:text-5xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              AI Image Captioning Portal
            </h1>
            <p className="mt-4 max-w-2xl text-slate-400 sm:text-lg leading-relaxed">
              Generate meaningful, context-aware descriptions for any image using state-of-the-art Hugging Face vision-language models. Features real-time API responses and automatic database archiving.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left md:text-right shadow-lg backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 flex items-center md:justify-end gap-1.5 font-medium">
              <Database size={12} className="text-cyan-400" /> Integrated System
            </p>
            <p className="mt-2 text-xl font-bold text-cyan-400">Production Ready</p>
          </div>
        </div>

        {/* Database Offline Alert Banner */}
        {dbError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300">
            <span className="text-lg">⚠️</span>
            <div>
              <span className="font-semibold">Local Storage Only:</span> {dbError}
            </div>
          </div>
        )}

        {/* Core Workspace Grid */}
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          {/* Hidden File Input for both Upload Box and Preview Box */}
          <input
            type="file"
            id="image-file-input"
            accept="image/*"
            onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
            className="hidden"
          />

          {/* Left Column: Image Upload or Preview */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm flex flex-col justify-center min-h-[300px]">
            {!preview ? (
              <label
                htmlFor="image-file-input"
                className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center cursor-pointer transition hover:border-cyan-400/50 hover:bg-slate-950/60 group"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-cyan-400 group-hover:scale-105 transition-transform shadow-md">
                  <ImageIcon size={36} />
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">Select or drop your image</p>
                  <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto">Supports PNG, JPG, or WEBP. Uploads are analyzed immediately through the Vision-Language route.</p>
                </div>
                <span className="mx-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-cyan-500 hover:text-white transition-colors">
                  Choose File
                </span>
              </label>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-inner space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-400">Preview</p>
                  <label
                    htmlFor="image-file-input"
                    className="cursor-pointer text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-400/5 border border-cyan-500/20 px-2.5 py-1.5 rounded-lg"
                  >
                    Change Image
                  </label>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Selected preview" className="h-auto max-h-[350px] w-full rounded-2xl object-contain bg-slate-950/50 border border-slate-800" />
              </div>
            )}
          </div>

          {/* Right Column: Controls & Output Pane */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between min-h-[360px] backdrop-blur-sm shadow-inner">
            <div>
              <div className="mb-5 flex items-center justify-between text-slate-400">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] font-semibold">Caption Output</p>
                  <p className="mt-1 text-xs text-slate-400">Real-time Vision Model Result</p>
                </div>
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs text-cyan-400 font-medium">Model Active</span>
              </div>

              {/* Generate Button placed right beside the image in the control column */}
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] transition-all px-6 py-4 text-base font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-cyan-500/10 mb-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Transcribing Image...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" /> Generate Intelligent Caption
                  </>
                )}
              </button>

              {error ? <p className="text-sm font-medium text-rose-400 text-center mb-4">{error}</p> : null}

              <div className="relative min-h-[200px] flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-slate-200 shadow-md">
                {loading ? (
                  <div className="flex flex-col h-full items-center justify-center gap-3 text-slate-400 my-auto py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                    <span className="text-sm animate-pulse">Running advanced AI inference...</span>
                  </div>
                ) : caption ? (
                  <>
                    <p className="whitespace-pre-wrap text-lg leading-8 font-medium text-slate-100">{caption}</p>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleCopyText(caption, "current")}
                        className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-2.5 py-1.5 rounded-lg bg-cyan-400/5 hover:bg-cyan-400/10 transition-colors border border-cyan-500/10"
                      >
                        {copiedCurrent ? (
                          <>
                            <Check size={14} className="text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Copy Caption
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 my-auto text-center py-10 italic">
                    Select an image and click “Generate Intelligent Caption” to view the results here.
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats if file present */}
            {file && (
              <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between font-medium">
                <span className="flex items-center gap-1"><FileImage size={12} /> {file.name.length > 20 ? file.name.substring(0, 17) + "..." : file.name}</span>
                <span>Size: {formatBytes(file.size)}</span>
              </div>
            )}
          </div>
        </form>

        {/* Database History Section (Dynamic Log replacing static info) */}
        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/20 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Database size={20} className="text-cyan-400 animate-pulse" />
              Recent Database Activity Log
            </h2>
            <span className="text-xs text-slate-400 font-medium">Showing last 10 captions</span>
          </div>

          {history.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 flex flex-col justify-between hover:border-slate-700/60 hover:bg-slate-950/80 transition-all shadow-md group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 text-[11px] text-slate-400 font-semibold mb-2">
                      <span className="flex items-center gap-1 text-slate-300 truncate max-w-[70%]">
                        <FileImage size={12} className="text-cyan-400" /> {item.filename}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 shrink-0">
                        <Clock size={11} /> {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 font-medium leading-relaxed">{item.caption}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">{formatBytes(item.fileSize)}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(item.caption, item.id)}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check size={11} className="text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={11} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center rounded-2xl border border-slate-800/40 bg-slate-950/20 text-slate-400">
              <Database size={36} className="mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold">No captions in database yet</p>
              <p className="text-xs text-slate-400 mt-1">Upload and caption an image above to start writing records to MongoDB!</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
