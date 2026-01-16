import React, { useState } from "react";

interface VibePromptInputProps {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const VibePromptInput: React.FC<VibePromptInputProps> = ({
  onGenerate,
  isLoading,
  error,
}) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    await onGenerate(prompt.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e5e5e5",
        padding: "16px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
          Vibe-Code Prompt
        </span>
        <span style={{ fontSize: "0.8rem", color: "#666" }}>
          Describe your UI and let AI generate the JSON
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px" }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Create a dashboard showing CPU and memory metrics with progress bars, and a card showing the current user's name and role..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
            fontSize: "0.9rem",
            minHeight: "60px",
            resize: "vertical",
            fontFamily: "inherit",
            outline: "none",
            background: isLoading ? "#f9fafb" : "white",
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          style={{
            padding: "12px 24px",
            background:
              isLoading || !prompt.trim()
                ? "#9ca3af"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: isLoading || !prompt.trim() ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            alignSelf: "flex-end",
            minWidth: "120px",
          }}
        >
          {isLoading ? "Generating..." : "Generate UI"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px 14px",
            background: "#fee2e2",
            borderRadius: "6px",
            color: "#dc2626",
            fontSize: "0.85rem",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          marginTop: "8px",
          fontSize: "0.75rem",
          color: "#9ca3af",
        }}
      >
        Press Ctrl+Enter to submit
      </div>
    </div>
  );
};
