"use client";

import { useState } from "react";
import PreviewPanel from "@/components/PreviewPanel";

export default function Home() {
  const [sandboxId, setSandboxId] = useState<string>("");
  const [port, setPort] = useState<string>("3000");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleCreateSandbox = async () => {
    setIsCreating(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:8000/create-sandbox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to create sandbox: ${response.statusText}`);
      }

      const data = await response.json();
      setSandboxId(data.sandbox_id);
      setPort("3000");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sandbox");
      console.error("Error creating sandbox:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* Left Panel - Preview */}
      <div className="flex-1 flex flex-col border-r border-zinc-800">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900">
          <h2 className="text-lg font-semibold">Sandbox Preview</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          {sandboxId ? (
            <PreviewPanel 
              sandboxId={sandboxId} 
              port={parseInt(port) || 3000} 
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-zinc-500">Click &quot;Create Sandbox&quot; to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Controls */}
      <div className="w-96 flex flex-col bg-zinc-900">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold">Sandbox Controls</h2>
        </div>
        <div className="p-4 space-y-4">
          <button
            onClick={handleCreateSandbox}
            disabled={isCreating}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-md font-medium transition-colors"
          >
            {isCreating ? "Creating Sandbox..." : "Create Sandbox"}
          </button>
          
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-md">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}
          
          {sandboxId && (
            <div className="mt-4 p-3 bg-zinc-800 rounded-md">
              <p className="text-sm text-zinc-400">Active Sandbox:</p>
              <p className="font-mono text-sm mt-1 break-all">{sandboxId}</p>
              <p className="text-sm text-zinc-400 mt-2">Port: {port}</p>
            </div>
          )}
          
          {isCreating && (
            <div className="space-y-2">
              <div className="h-1 w-full bg-zinc-800 rounded overflow-hidden">
                <div className="h-full bg-green-500 animate-pulse"></div>
              </div>
              <p className="text-xs text-zinc-500 text-center">
                This may take a few minutes...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

