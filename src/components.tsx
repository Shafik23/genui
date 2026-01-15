import React from "react";
import { useData, type ComponentRenderProps } from "@json-render/react";

// Helper to resolve dynamic values (path references)
function useDynamicValue<T>(value: T | { path: string }): T | undefined {
  const { get } = useData();

  if (value && typeof value === "object" && "path" in value) {
    return get(value.path) as T | undefined;
  }
  return value as T;
}

const paddingMap = { none: "0", sm: "8px", md: "16px", lg: "24px" };
const gapMap = { none: "0", sm: "8px", md: "16px", lg: "24px" };

const colorMap = {
  default: "#1a1a1a",
  muted: "#666",
  accent: "#0070f3",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
};

const bgMap = {
  default: "transparent",
  muted: "#f5f5f5",
  accent: "#e0f2fe",
  success: "#d1fae5",
  warning: "#fef3c7",
  error: "#fee2e2",
};

interface BoxProps {
  padding?: "none" | "sm" | "md" | "lg";
  background?: "default" | "muted" | "accent" | "success" | "warning" | "error";
  border?: boolean;
  rounded?: boolean;
}

export const Box: React.FC<ComponentRenderProps<BoxProps>> = ({ element, children }) => {
  const { padding = "md", background = "default", border, rounded } = element.props;
  return (
    <div
      style={{
        padding: paddingMap[padding],
        background: bgMap[background],
        border: border ? "1px solid #e5e5e5" : "none",
        borderRadius: rounded ? "8px" : "0",
      }}
    >
      {children}
    </div>
  );
};

interface StackProps {
  direction?: "row" | "column";
  gap?: "none" | "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
}

export const Stack: React.FC<ComponentRenderProps<StackProps>> = ({ element, children }) => {
  const { direction = "column", gap = "md", align = "stretch", justify = "start" } = element.props;

  const alignItems = align === "start" ? "flex-start" : align === "end" ? "flex-end" : align;
  const justifyContent = justify === "between" ? "space-between" : justify === "start" ? "flex-start" : justify === "end" ? "flex-end" : justify;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        gap: gapMap[gap],
        alignItems,
        justifyContent,
      }}
    >
      {children}
    </div>
  );
};

interface TextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "caption" | "code";
  color?: "default" | "muted" | "accent" | "success" | "warning" | "error";
  align?: "left" | "center" | "right";
  content: string | { path: string };
}

export const Text: React.FC<ComponentRenderProps<TextProps>> = ({ element }) => {
  const { variant = "body", color = "default", align = "left", content: rawContent } = element.props;
  const content = useDynamicValue(rawContent) ?? "";

  const styles: Record<string, React.CSSProperties> = {
    h1: { fontSize: "2rem", fontWeight: 700, margin: "0 0 0.5rem" },
    h2: { fontSize: "1.5rem", fontWeight: 600, margin: "0 0 0.4rem" },
    h3: { fontSize: "1.25rem", fontWeight: 600, margin: "0 0 0.3rem" },
    body: { fontSize: "1rem", margin: 0 },
    caption: { fontSize: "0.875rem", margin: 0 },
    code: { fontSize: "0.875rem", fontFamily: "monospace", background: "#f5f5f5", padding: "2px 6px", borderRadius: "4px", margin: 0 },
  };

  const Tag = variant.startsWith("h") ? (variant as "h1" | "h2" | "h3") : "p";
  return (
    <Tag style={{ ...styles[variant], color: colorMap[color], textAlign: align }}>
      {String(content)}
    </Tag>
  );
};

interface ButtonProps {
  label: string | { path: string };
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ComponentRenderProps<ButtonProps>> = ({ element }) => {
  const { label: rawLabel, variant = "primary", size = "md", disabled, fullWidth } = element.props;
  const label = useDynamicValue(rawLabel) ?? "";

  const baseStyle: React.CSSProperties = {
    border: "none",
    borderRadius: "6px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 500,
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? "100%" : "auto",
    transition: "all 0.2s",
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: "6px 12px", fontSize: "0.875rem" },
    md: { padding: "10px 20px", fontSize: "1rem" },
    lg: { padding: "14px 28px", fontSize: "1.125rem" },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: "#0070f3", color: "white" },
    secondary: { background: "#f5f5f5", color: "#1a1a1a" },
    outline: { background: "transparent", color: "#0070f3", border: "1px solid #0070f3" },
    ghost: { background: "transparent", color: "#666" },
    danger: { background: "#ef4444", color: "white" },
  };

  return (
    <button style={{ ...baseStyle, ...sizeStyles[size], ...variantStyles[variant] }}>
      {String(label)}
    </button>
  );
};

interface InputProps {
  placeholder?: string | { path: string };
  label?: string | { path: string };
  type?: "text" | "email" | "password" | "number";
  disabled?: boolean;
  valuePath?: string;
}

export const Input: React.FC<ComponentRenderProps<InputProps>> = ({ element }) => {
  const { placeholder: rawPlaceholder, label: rawLabel, type = "text", disabled, valuePath } = element.props;
  const { get, set } = useData();

  const placeholder = useDynamicValue(rawPlaceholder);
  const label = useDynamicValue(rawLabel);
  const value = valuePath ? (get(valuePath) as string) ?? "" : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {label && <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>{String(label)}</label>}
      <input
        type={type}
        placeholder={placeholder ? String(placeholder) : undefined}
        disabled={disabled}
        value={value}
        onChange={(e) => valuePath && set(valuePath, e.target.value)}
        style={{
          padding: "10px 12px",
          border: "1px solid #e5e5e5",
          borderRadius: "6px",
          fontSize: "1rem",
          outline: "none",
          opacity: disabled ? 0.5 : 1,
        }}
      />
    </div>
  );
};

interface CardProps {
  title?: string | { path: string };
  subtitle?: string | { path: string };
  elevated?: boolean;
}

export const Card: React.FC<ComponentRenderProps<CardProps>> = ({ element, children }) => {
  const { title: rawTitle, subtitle: rawSubtitle, elevated } = element.props;
  const title = useDynamicValue(rawTitle);
  const subtitle = useDynamicValue(rawSubtitle);

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid #e5e5e5",
        boxShadow: elevated ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
      }}
    >
      {title && <h3 style={{ margin: "0 0 4px", fontSize: "1.125rem", fontWeight: 600 }}>{String(title)}</h3>}
      {subtitle && <p style={{ margin: "0 0 16px", fontSize: "0.875rem", color: "#666" }}>{String(subtitle)}</p>}
      {children}
    </div>
  );
};

interface BadgeProps {
  text: string | { path: string };
  variant?: "default" | "success" | "warning" | "error" | "info" | { path: string };
}

export const Badge: React.FC<ComponentRenderProps<BadgeProps>> = ({ element }) => {
  const { text: rawText, variant: rawVariant = "default" } = element.props;
  const text = useDynamicValue(rawText) ?? "";
  const variant = useDynamicValue(rawVariant) ?? "default";

  const colors: Record<string, { bg: string; text: string }> = {
    default: { bg: "#f5f5f5", text: "#666" },
    success: { bg: "#d1fae5", text: "#059669" },
    warning: { bg: "#fef3c7", text: "#d97706" },
    error: { bg: "#fee2e2", text: "#dc2626" },
    info: { bg: "#e0f2fe", text: "#0284c7" },
    active: { bg: "#d1fae5", text: "#059669" },
    away: { bg: "#fef3c7", text: "#d97706" },
    offline: { bg: "#f5f5f5", text: "#666" },
  };

  const colorSet = colors[variant as string] || colors.default;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 500,
        background: colorSet.bg,
        color: colorSet.text,
      }}
    >
      {String(text)}
    </span>
  );
};

interface AvatarProps {
  name: string | { path: string };
  size?: "sm" | "md" | "lg";
}

export const Avatar: React.FC<ComponentRenderProps<AvatarProps>> = ({ element }) => {
  const { name: rawName, size = "md" } = element.props;
  const name = useDynamicValue(rawName) ?? "?";

  const sizes = { sm: 32, md: 40, lg: 56 };
  const initials = String(name).split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const hue = String(name).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;

  return (
    <div
      style={{
        width: sizes[size],
        height: sizes[size],
        borderRadius: "50%",
        background: `hsl(${hue}, 70%, 60%)`,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: size === "sm" ? "0.75rem" : size === "lg" ? "1.25rem" : "1rem",
      }}
    >
      {initials}
    </div>
  );
};

interface DividerProps {
  spacing?: "sm" | "md" | "lg";
}

export const Divider: React.FC<ComponentRenderProps<DividerProps>> = ({ element }) => {
  const { spacing = "md" } = element.props;
  const spacingMap = { sm: "8px", md: "16px", lg: "24px" };
  return <hr style={{ border: "none", borderTop: "1px solid #e5e5e5", margin: `${spacingMap[spacing]} 0` }} />;
};

interface ImageProps {
  src: string | { path: string };
  alt: string | { path: string };
  rounded?: boolean;
}

export const Image: React.FC<ComponentRenderProps<ImageProps>> = ({ element }) => {
  const { src: rawSrc, alt: rawAlt, rounded } = element.props;
  const src = useDynamicValue(rawSrc) ?? "";
  const alt = useDynamicValue(rawAlt) ?? "";

  return (
    <img
      src={String(src)}
      alt={String(alt)}
      style={{
        maxWidth: "100%",
        height: "auto",
        borderRadius: rounded ? "8px" : "0",
        display: "block",
      }}
    />
  );
};

interface ProgressBarProps {
  value: number | { path: string };
  color?: "default" | "success" | "warning" | "error";
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ComponentRenderProps<ProgressBarProps>> = ({ element }) => {
  const { value: rawValue, color = "default", showLabel } = element.props;
  const value = useDynamicValue(rawValue) ?? 0;

  const colors = {
    default: "#0070f3",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          width: "100%",
          height: "8px",
          background: "#e5e5e5",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, Number(value)))}%`,
            height: "100%",
            background: colors[color],
            transition: "width 0.3s ease",
          }}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: "0.75rem", color: "#666", marginTop: "4px", display: "block" }}>
          {Number(value)}%
        </span>
      )}
    </div>
  );
};

// New component: Metric display
interface MetricProps {
  label: string | { path: string };
  value: string | number | { path: string };
  prefix?: string;
  suffix?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string | { path: string };
}

export const Metric: React.FC<ComponentRenderProps<MetricProps>> = ({ element }) => {
  const { label: rawLabel, value: rawValue, prefix = "", suffix = "", trend, trendValue: rawTrend } = element.props;
  const label = useDynamicValue(rawLabel) ?? "";
  const value = useDynamicValue(rawValue) ?? 0;
  const trendValue = useDynamicValue(rawTrend);

  const trendColors = {
    up: "#10b981",
    down: "#ef4444",
    neutral: "#666",
  };

  return (
    <div style={{ padding: "12px 0" }}>
      <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "4px" }}>{String(label)}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "1.75rem", fontWeight: 700 }}>
          {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
        </span>
        {trend && trendValue && (
          <span style={{ fontSize: "0.875rem", color: trendColors[trend] }}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {String(trendValue)}
          </span>
        )}
      </div>
    </div>
  );
};

// New component: List for iterating over data
interface ListProps {
  items: string; // path to array
  itemKey?: string;
}

export const List: React.FC<ComponentRenderProps<ListProps>> = ({ element, children }) => {
  const { get } = useData();
  const items = get(element.props.items) as unknown[] | undefined;

  if (!items || !Array.isArray(items)) {
    return <div style={{ color: "#999" }}>No data at {element.props.items}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {children}
    </div>
  );
};

export const componentRegistry = {
  Box,
  Stack,
  Text,
  Button,
  Input,
  Card,
  Badge,
  Avatar,
  Divider,
  Image,
  ProgressBar,
  Metric,
  List,
};
