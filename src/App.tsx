import { useState, useMemo, useCallback, useEffect } from "react";
import { JSONUIProvider, Renderer } from "@json-render/react";
import type { UITree } from "@json-render/core";
import { componentRegistry } from "./components";
import { VibePromptInput } from "./components/VibePromptInput";
import { VIBE_CODE_SYSTEM_PROMPT } from "./lib/vibeCodeSystemPrompt";

const API_URL = "http://localhost:3001";

// Dynamic presets that use path references to backend data
const examplePresets: Record<string, UITree> = {
  "User Profile (Dynamic)": {
    root: "card",
    elements: {
      card: {
        key: "card",
        type: "Card",
        props: { elevated: true },
        children: ["stack1"],
      },
      stack1: {
        key: "stack1",
        type: "Stack",
        props: { gap: "md" },
        parentKey: "card",
        children: ["header", "divider", "badges", "stats"],
      },
      header: {
        key: "header",
        type: "Stack",
        props: { direction: "row", gap: "md", align: "center" },
        parentKey: "stack1",
        children: ["avatar", "info"],
      },
      avatar: {
        key: "avatar",
        type: "Avatar",
        props: { name: { path: "/user/name" }, size: "lg" },
        parentKey: "header",
      },
      info: {
        key: "info",
        type: "Stack",
        props: { gap: "none" },
        parentKey: "header",
        children: ["name", "role", "email"],
      },
      name: {
        key: "name",
        type: "Text",
        props: { content: { path: "/user/name" }, variant: "h3" },
        parentKey: "info",
      },
      role: {
        key: "role",
        type: "Text",
        props: { content: { path: "/user/role" }, color: "muted", variant: "caption" },
        parentKey: "info",
      },
      email: {
        key: "email",
        type: "Text",
        props: { content: { path: "/user/email" }, color: "accent", variant: "caption" },
        parentKey: "info",
      },
      divider: {
        key: "divider",
        type: "Divider",
        props: { spacing: "sm" },
        parentKey: "stack1",
      },
      badges: {
        key: "badges",
        type: "Stack",
        props: { direction: "row", gap: "sm" },
        parentKey: "stack1",
        children: ["badge0", "badge1", "badge2", "badge3"],
      },
      badge0: {
        key: "badge0",
        type: "Badge",
        props: { text: { path: "/user/skills/0" }, variant: "info" },
        parentKey: "badges",
      },
      badge1: {
        key: "badge1",
        type: "Badge",
        props: { text: { path: "/user/skills/1" }, variant: "info" },
        parentKey: "badges",
      },
      badge2: {
        key: "badge2",
        type: "Badge",
        props: { text: { path: "/user/skills/2" }, variant: "success" },
        parentKey: "badges",
      },
      badge3: {
        key: "badge3",
        type: "Badge",
        props: { text: { path: "/user/skills/3" }, variant: "warning" },
        parentKey: "badges",
      },
      stats: {
        key: "stats",
        type: "Stack",
        props: { direction: "row", gap: "lg" },
        parentKey: "stack1",
        children: ["commits", "prs", "reviews"],
      },
      commits: {
        key: "commits",
        type: "Metric",
        props: { label: "Commits", value: { path: "/user/stats/commits" } },
        parentKey: "stats",
      },
      prs: {
        key: "prs",
        type: "Metric",
        props: { label: "Pull Requests", value: { path: "/user/stats/prs" } },
        parentKey: "stats",
      },
      reviews: {
        key: "reviews",
        type: "Metric",
        props: { label: "Reviews", value: { path: "/user/stats/reviews" } },
        parentKey: "stats",
      },
    },
  },
  "System Metrics (Live)": {
    root: "main",
    elements: {
      main: {
        key: "main",
        type: "Stack",
        props: { gap: "md" },
        children: ["title", "cards", "bottomRow"],
      },
      title: {
        key: "title",
        type: "Text",
        props: { content: "System Metrics", variant: "h2" },
        parentKey: "main",
      },
      cards: {
        key: "cards",
        type: "Stack",
        props: { direction: "row", gap: "md" },
        parentKey: "main",
        children: ["cpuCard", "memCard"],
      },
      cpuCard: {
        key: "cpuCard",
        type: "Card",
        props: { title: "CPU Usage" },
        parentKey: "cards",
        children: ["cpuStack"],
      },
      cpuStack: {
        key: "cpuStack",
        type: "Stack",
        props: { gap: "sm" },
        parentKey: "cpuCard",
        children: ["cpuProgress", "cpuLabel"],
      },
      cpuProgress: {
        key: "cpuProgress",
        type: "ProgressBar",
        props: { value: { path: "/metrics/cpu" }, color: "success", showLabel: true },
        parentKey: "cpuStack",
      },
      cpuLabel: {
        key: "cpuLabel",
        type: "Text",
        props: { content: "Current CPU load", variant: "caption", color: "muted" },
        parentKey: "cpuStack",
      },
      memCard: {
        key: "memCard",
        type: "Card",
        props: { title: "Memory Usage" },
        parentKey: "cards",
        children: ["memStack"],
      },
      memStack: {
        key: "memStack",
        type: "Stack",
        props: { gap: "sm" },
        parentKey: "memCard",
        children: ["memProgress", "memLabel"],
      },
      memProgress: {
        key: "memProgress",
        type: "ProgressBar",
        props: { value: { path: "/metrics/memory" }, color: "warning", showLabel: true },
        parentKey: "memStack",
      },
      memLabel: {
        key: "memLabel",
        type: "Text",
        props: { content: "Current memory usage", variant: "caption", color: "muted" },
        parentKey: "memStack",
      },
      bottomRow: {
        key: "bottomRow",
        type: "Stack",
        props: { direction: "row", gap: "md" },
        parentKey: "main",
        children: ["reqMetric", "errMetric", "respMetric"],
      },
      reqMetric: {
        key: "reqMetric",
        type: "Card",
        props: {},
        parentKey: "bottomRow",
        children: ["reqMetricInner"],
      },
      reqMetricInner: {
        key: "reqMetricInner",
        type: "Metric",
        props: { label: "Total Requests", value: { path: "/metrics/requests" }, trend: "up", trendValue: "+12%" },
        parentKey: "reqMetric",
      },
      errMetric: {
        key: "errMetric",
        type: "Card",
        props: {},
        parentKey: "bottomRow",
        children: ["errMetricInner"],
      },
      errMetricInner: {
        key: "errMetricInner",
        type: "Metric",
        props: { label: "Errors", value: { path: "/metrics/errors" }, trend: "down", trendValue: "-5%" },
        parentKey: "errMetric",
      },
      respMetric: {
        key: "respMetric",
        type: "Card",
        props: {},
        parentKey: "bottomRow",
        children: ["respMetricInner"],
      },
      respMetricInner: {
        key: "respMetricInner",
        type: "Metric",
        props: { label: "Avg Response", value: { path: "/metrics/responseTime" }, suffix: "ms" },
        parentKey: "respMetric",
      },
    },
  },
  "Order Dashboard": {
    root: "main",
    elements: {
      main: {
        key: "main",
        type: "Stack",
        props: { gap: "lg" },
        children: ["header", "metrics", "revenue"],
      },
      header: {
        key: "header",
        type: "Stack",
        props: { direction: "row", justify: "between", align: "center" },
        parentKey: "main",
        children: ["title", "badge"],
      },
      title: {
        key: "title",
        type: "Text",
        props: { content: "Order Analytics", variant: "h2" },
        parentKey: "header",
      },
      badge: {
        key: "badge",
        type: "Badge",
        props: { text: "Live", variant: "success" },
        parentKey: "header",
      },
      metrics: {
        key: "metrics",
        type: "Stack",
        props: { direction: "row", gap: "md" },
        parentKey: "main",
        children: ["totalCard", "pendingCard", "completedCard"],
      },
      totalCard: {
        key: "totalCard",
        type: "Card",
        props: { elevated: true },
        parentKey: "metrics",
        children: ["totalMetric"],
      },
      totalMetric: {
        key: "totalMetric",
        type: "Metric",
        props: { label: "Total Orders", value: { path: "/orders/total" }, trend: "up", trendValue: "+8%" },
        parentKey: "totalCard",
      },
      pendingCard: {
        key: "pendingCard",
        type: "Card",
        props: { elevated: true },
        parentKey: "metrics",
        children: ["pendingMetric"],
      },
      pendingMetric: {
        key: "pendingMetric",
        type: "Metric",
        props: { label: "Pending", value: { path: "/orders/pending" }, trend: "neutral", trendValue: "0%" },
        parentKey: "pendingCard",
      },
      completedCard: {
        key: "completedCard",
        type: "Card",
        props: { elevated: true },
        parentKey: "metrics",
        children: ["completedMetric"],
      },
      completedMetric: {
        key: "completedMetric",
        type: "Metric",
        props: { label: "Completed", value: { path: "/orders/completed" }, trend: "up", trendValue: "+12%" },
        parentKey: "completedCard",
      },
      revenue: {
        key: "revenue",
        type: "Card",
        props: { title: "Revenue Overview", elevated: true },
        parentKey: "main",
        children: ["revenueStack"],
      },
      revenueStack: {
        key: "revenueStack",
        type: "Stack",
        props: { direction: "row", gap: "lg" },
        parentKey: "revenue",
        children: ["revenueMetric", "avgMetric"],
      },
      revenueMetric: {
        key: "revenueMetric",
        type: "Metric",
        props: { label: "Total Revenue", value: { path: "/orders/revenue" }, prefix: "$", trend: "up", trendValue: "+15%" },
        parentKey: "revenueStack",
      },
      avgMetric: {
        key: "avgMetric",
        type: "Metric",
        props: { label: "Avg Order Value", value: { path: "/orders/avgOrderValue" }, prefix: "$" },
        parentKey: "revenueStack",
      },
    },
  },
  "Team Directory": {
    root: "main",
    elements: {
      main: {
        key: "main",
        type: "Stack",
        props: { gap: "md" },
        children: ["title", "member0", "member1", "member2", "member3"],
      },
      title: {
        key: "title",
        type: "Text",
        props: { content: "Team Members", variant: "h2" },
        parentKey: "main",
      },
      member0: {
        key: "member0",
        type: "Card",
        props: {},
        parentKey: "main",
        children: ["row0"],
      },
      row0: {
        key: "row0",
        type: "Stack",
        props: { direction: "row", gap: "md", align: "center", justify: "between" },
        parentKey: "member0",
        children: ["info0", "status0"],
      },
      info0: {
        key: "info0",
        type: "Stack",
        props: { direction: "row", gap: "md", align: "center" },
        parentKey: "row0",
        children: ["avatar0", "details0"],
      },
      avatar0: {
        key: "avatar0",
        type: "Avatar",
        props: { name: { path: "/team/0/name" } },
        parentKey: "info0",
      },
      details0: {
        key: "details0",
        type: "Stack",
        props: { gap: "none" },
        parentKey: "info0",
        children: ["name0", "role0"],
      },
      name0: {
        key: "name0",
        type: "Text",
        props: { content: { path: "/team/0/name" }, variant: "body" },
        parentKey: "details0",
      },
      role0: {
        key: "role0",
        type: "Text",
        props: { content: { path: "/team/0/role" }, variant: "caption", color: "muted" },
        parentKey: "details0",
      },
      status0: {
        key: "status0",
        type: "Badge",
        props: { text: { path: "/team/0/status" }, variant: { path: "/team/0/status" } },
        parentKey: "row0",
      },
      member1: {
        key: "member1",
        type: "Card",
        props: {},
        parentKey: "main",
        children: ["row1"],
      },
      row1: {
        key: "row1",
        type: "Stack",
        props: { direction: "row", gap: "md", align: "center", justify: "between" },
        parentKey: "member1",
        children: ["info1", "status1"],
      },
      info1: {
        key: "info1",
        type: "Stack",
        props: { direction: "row", gap: "md", align: "center" },
        parentKey: "row1",
        children: ["avatar1", "details1"],
      },
      avatar1: {
        key: "avatar1",
        type: "Avatar",
        props: { name: { path: "/team/1/name" } },
        parentKey: "info1",
      },
      details1: {
        key: "details1",
        type: "Stack",
        props: { gap: "none" },
        parentKey: "info1",
        children: ["name1", "role1"],
      },
      name1: {
        key: "name1",
        type: "Text",
        props: { content: { path: "/team/1/name" }, variant: "body" },
        parentKey: "details1",
      },
      role1: {
        key: "role1",
        type: "Text",
        props: { content: { path: "/team/1/role" }, variant: "caption", color: "muted" },
        parentKey: "details1",
      },
      status1: {
        key: "status1",
        type: "Badge",
        props: { text: { path: "/team/1/status" }, variant: { path: "/team/1/status" } },
        parentKey: "row1",
      },
      member2: {
        key: "member2",
        type: "Card",
        props: {},
        parentKey: "main",
        children: ["row2"],
      },
      row2: {
        key: "row2",
        type: "Stack",
        props: { direction: "row", gap: "md", align: "center", justify: "between" },
        parentKey: "member2",
        children: ["info2", "status2"],
      },
      info2: {
        key: "info2",
        type: "Stack",
        props: { direction: "row", gap: "md", align: "center" },
        parentKey: "row2",
        children: ["avatar2", "details2"],
      },
      avatar2: {
        key: "avatar2",
        type: "Avatar",
        props: { name: { path: "/team/2/name" } },
        parentKey: "info2",
      },
      details2: {
        key: "details2",
        type: "Stack",
        props: { gap: "none" },
        parentKey: "info2",
        children: ["name2", "role2"],
      },
      name2: {
        key: "name2",
        type: "Text",
        props: { content: { path: "/team/2/name" }, variant: "body" },
        parentKey: "details2",
      },
      role2: {
        key: "role2",
        type: "Text",
        props: { content: { path: "/team/2/role" }, variant: "caption", color: "muted" },
        parentKey: "details2",
      },
      status2: {
        key: "status2",
        type: "Badge",
        props: { text: { path: "/team/2/status" }, variant: { path: "/team/2/status" } },
        parentKey: "row2",
      },
      member3: {
        key: "member3",
        type: "Card",
        props: {},
        parentKey: "main",
        children: ["row3"],
      },
      row3: {
        key: "row3",
        type: "Stack",
        props: { direction: "row", gap: "md", align: "center", justify: "between" },
        parentKey: "member3",
        children: ["info3", "status3"],
      },
      info3: {
        key: "info3",
        type: "Stack",
        props: { direction: "row", gap: "md", align: "center" },
        parentKey: "row3",
        children: ["avatar3", "details3"],
      },
      avatar3: {
        key: "avatar3",
        type: "Avatar",
        props: { name: { path: "/team/3/name" } },
        parentKey: "info3",
      },
      details3: {
        key: "details3",
        type: "Stack",
        props: { gap: "none" },
        parentKey: "info3",
        children: ["name3", "role3"],
      },
      name3: {
        key: "name3",
        type: "Text",
        props: { content: { path: "/team/3/name" }, variant: "body" },
        parentKey: "details3",
      },
      role3: {
        key: "role3",
        type: "Text",
        props: { content: { path: "/team/3/role" }, variant: "caption", color: "muted" },
        parentKey: "details3",
      },
      status3: {
        key: "status3",
        type: "Badge",
        props: { text: { path: "/team/3/status" }, variant: { path: "/team/3/status" } },
        parentKey: "row3",
      },
    },
  },
  "Static Example": {
    root: "box",
    elements: {
      box: {
        key: "box",
        type: "Box",
        props: { padding: "lg", background: "muted", rounded: true },
        children: ["text"],
      },
      text: {
        key: "text",
        type: "Text",
        props: { content: "This example uses static values (no backend data)", variant: "body", align: "center" },
        parentKey: "box",
      },
    },
  },
};

function App() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(examplePresets["User Profile (Dynamic)"], null, 2));
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [vibeLoading, setVibeLoading] = useState(false);
  const [vibeError, setVibeError] = useState<string | null>(null);

  const parsedUI = useMemo((): UITree | null => {
    try {
      const parsed = JSON.parse(jsonInput);
      setError(null);
      return parsed as UITree;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [jsonInput]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setDataError(null);
    try {
      const res = await fetch(`${API_URL}/api/data`);
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setDataError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const simulateUpdate = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/simulate`);
      if (!res.ok) throw new Error("Failed to simulate");
      // Refresh all data after simulation
      await fetchData();
    } catch (e) {
      setDataError((e as Error).message);
    }
  }, [fetchData]);

  const handleVibeGenerate = useCallback(async (userPrompt: string) => {
    setVibeLoading(true);
    setVibeError(null);

    try {
      const fullPrompt = `${VIBE_CODE_SYSTEM_PROMPT}\n\nUser request: ${userPrompt}`;

      const response = await fetch(`${API_URL}/api/llm/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();

      // Extract JSON content from the response
      let jsonContent: string;

      if (typeof data === "string") {
        jsonContent = data;
      } else if (data.content) {
        jsonContent = data.content;
      } else if (data.text) {
        jsonContent = data.text;
      } else if (data.response) {
        jsonContent = data.response;
      } else {
        jsonContent = JSON.stringify(data, null, 2);
      }

      // Extract JSON from markdown code blocks if present
      const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }

      // Handle escaped JSON from LLM responses
      // LLMs often return JSON with literal escape sequences (\n, \", etc.)
      // that need to be converted to actual characters before parsing

      // First, try parsing as a JSON string if it looks double-stringified
      if (jsonContent.startsWith('"') && jsonContent.endsWith('"')) {
        try {
          const unescaped = JSON.parse(jsonContent);
          if (typeof unescaped === 'string') {
            jsonContent = unescaped;
          }
        } catch {
          // Not a valid JSON string, continue
        }
      }

      // If content has literal escape sequences (backslash followed by n/r/t/"),
      // manually unescape them
      if (jsonContent.includes('\\n') || jsonContent.includes('\\r') ||
          jsonContent.includes('\\t') || jsonContent.includes('\\"')) {
        jsonContent = jsonContent
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"');
      }

      // Validate the JSON
      const parsed = JSON.parse(jsonContent);

      // Basic structure validation
      if (!parsed.root || !parsed.elements) {
        throw new Error("Invalid UI structure: missing 'root' or 'elements'");
      }

      if (!parsed.elements[parsed.root]) {
        throw new Error(`Root element '${parsed.root}' not found in elements`);
      }

      // Set the validated JSON
      setJsonInput(JSON.stringify(parsed, null, 2));
      setVibeError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate UI";
      setVibeError(message);
      console.error("Vibe-code generation error:", err);
    } finally {
      setVibeLoading(false);
    }
  }, []);

  // Auto-fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const actionHandlers: Record<string, (params: Record<string, unknown>) => unknown> = {
    alert: (params) => {
      window.alert(params.message as string);
    },
    log: (params) => {
      console.log("Log action:", params.data);
    },
    refresh: async () => {
      await fetchData();
    },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      <header
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "20px 32px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>
              Vibe-Code UI Studio
            </h1>
            <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: "0.9rem" }}>
              Powered by json-render — Dynamic UIs from JSON + Backend Data
            </p>
          </div>
          <button
            onClick={simulateUpdate}
            disabled={loading}
            style={{
              padding: "8px 16px",
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "6px",
              color: "white",
              cursor: loading ? "wait" : "pointer",
              fontSize: "0.875rem",
            }}
          >
            {loading ? "Loading..." : "Simulate Data Change"}
          </button>
        </div>
        {dataError && (
          <div style={{ marginTop: "12px", padding: "8px 12px", background: "rgba(239,68,68,0.2)", borderRadius: "6px", fontSize: "0.875rem" }}>
            Error: {dataError} — Make sure the API server is running (npm run server)
          </div>
        )}
      </header>

      <div style={{ padding: "0 32px 32px" }}>
        <VibePromptInput
          onGenerate={handleVibeGenerate}
          isLoading={vibeLoading}
          error={vibeError}
        />

        <div style={{ marginBottom: "16px" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 500, marginRight: "12px" }}>
            Load preset:
          </span>
          {Object.keys(examplePresets).map((name) => (
            <button
              key={name}
              onClick={() => setJsonInput(JSON.stringify(examplePresets[name], null, 2))}
              style={{
                margin: "0 4px 4px 0",
                padding: "6px 12px",
                fontSize: "0.8rem",
                border: "1px solid #e5e5e5",
                borderRadius: "6px",
                background: "white",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = "#667eea")}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")}
            >
              {name}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            minHeight: "calc(100vh - 280px)",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e5e5e5",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #e5e5e5",
                background: "#f9fafb",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              JSON Editor
              {error && (
                <span style={{ marginLeft: "12px", color: "#ef4444", fontWeight: 400 }}>
                  {error}
                </span>
              )}
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                width: "100%",
                padding: "16px",
                border: "none",
                outline: "none",
                resize: "none",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: "0.8rem",
                lineHeight: 1.5,
                background: error ? "#fef2f2" : "white",
              }}
            />
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e5e5e5",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #e5e5e5",
                background: "#f9fafb",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Live Preview
            </div>
            <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
              {parsedUI ? (
                <JSONUIProvider
                  key={JSON.stringify(data)}
                  registry={componentRegistry}
                  initialData={data}
                  actionHandlers={actionHandlers}
                >
                  <Renderer tree={parsedUI} registry={componentRegistry} />
                </JSONUIProvider>
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                  }}
                >
                  Fix JSON errors to see preview
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "white",
            borderRadius: "8px",
            border: "1px solid #e5e5e5",
          }}
        >
          <h3 style={{ margin: "0 0 12px", fontSize: "0.9rem", fontWeight: 600 }}>
            Available Components
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {Object.keys(componentRegistry).map((name) => (
              <code
                key={name}
                style={{
                  padding: "4px 10px",
                  background: "#f5f5f5",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                }}
              >
                {name}
              </code>
            ))}
          </div>
          <h3 style={{ margin: "16px 0 12px", fontSize: "0.9rem", fontWeight: 600 }}>
            Dynamic Values
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
            Use <code style={{ background: "#f5f5f5", padding: "2px 6px", borderRadius: "4px" }}>{`{ "path": "/user/name" }`}</code> in props to bind to backend data.
            Available paths: <code>/user/*</code>, <code>/team/*</code>, <code>/metrics/*</code>, <code>/orders/*</code>, <code>/products/*</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
