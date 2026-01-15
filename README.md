# Vibe-Code UI Studio

A demonstration app for the `@json-render` library — build dynamic UIs from JSON specifications with real-time data binding.

## Overview

This project provides an interactive playground where you can:

- Define UI layouts using JSON in a live editor
- See changes rendered instantly in a preview pane
- Bind UI elements to backend data using path references
- Simulate real-time data updates

## Quick Start

```bash
# Install dependencies
npm install

# Start both frontend and backend servers
npm run dev
```

This launches:
- **Frontend**: http://localhost:5173 (Vite dev server with HMR)
- **Backend API**: http://localhost:3001 (Express server with mock data)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both servers concurrently |
| `npm run client` | Start Vite dev server only |
| `npm run server` | Start Express API server only |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## How It Works

### JSON UI Format

UIs are defined as JSON trees with this structure:

```json
{
  "root": "main",
  "elements": {
    "main": {
      "type": "Stack",
      "props": { "gap": "md" },
      "children": ["greeting"]
    },
    "greeting": {
      "type": "Text",
      "props": { "content": { "path": "/user/name" } }
    }
  }
}
```

### Path-Based Data Binding

Props can reference backend data using `{ "path": "/field/name" }` syntax:

```json
{ "content": { "path": "/user/name" } }
```

Available data paths include:
- `/user/*` - User profile (name, email, role, skills, stats)
- `/team/*` - Team members array
- `/metrics/*` - System metrics (cpu, memory, requests, errors)
- `/orders/*` - Order statistics
- `/products/*` - Product data

### Available Components

| Component | Description |
|-----------|-------------|
| `Box` | Container with padding, background, border options |
| `Stack` | Flexbox layout (row/column) with gap, alignment |
| `Text` | Typography with variants (h1-h3, body, caption, code) |
| `Button` | Clickable button with variants and sizes |
| `Input` | Form input with label and two-way binding |
| `Card` | Elevated card container with optional title |
| `Badge` | Status badge with color variants |
| `Avatar` | User avatar with initials and color |
| `Divider` | Horizontal separator |
| `Image` | Responsive image with rounded option |
| `ProgressBar` | Progress indicator with color and label |
| `Metric` | Metric display with trend indicators |
| `List` | Data-bound list container |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/data` | GET | Returns all mock data |
| `/api/data` | POST | Update data at specified path |
| `/api/simulate` | GET | Randomly update metrics for demo |

## Example Presets

The app includes several pre-built examples:

- **User Profile** - Dynamic profile card with skills and stats
- **System Metrics** - Live CPU/memory monitoring dashboard
- **Order Dashboard** - E-commerce analytics view
- **Team Directory** - Team member listing with status
- **Static Example** - Simple example without data binding

## Tech Stack

- React 19 + TypeScript 5.9
- Vite 7
- Express 5
- `@json-render/core` and `@json-render/react`
