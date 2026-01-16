# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a demonstration app for the `@json-render` library - a system for building dynamic UIs from JSON specifications with real-time data binding. The app ("Vibe-Code UI Studio") provides a JSON editor on the left and a live preview on the right, allowing users to define UI trees declaratively.

The app includes a **Vibe-Code feature** that uses AI to generate JSON UI specifications from natural language prompts.

## Build & Development Commands

```bash
npm run dev          # Start both server (port 3001) and client (port 5173) concurrently
npm run server       # Start Express API server only (with nodemon hot reload)
npm run client       # Start Vite dev server only
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint check
npm run preview      # Preview production build
```

## Architecture

### Two-Server Setup
- **Vite dev server** (port 5173): Serves the React frontend with HMR
- **Express API** (port 3001): Mock backend with data endpoints

### Core Files
- `src/App.tsx` - Main component with JSON editor, live preview, and Vibe-Code prompt integration
- `src/components.tsx` - Component registry with 13 custom components (Box, Stack, Text, Badge, Avatar, Card, Button, Input, List, etc.)
- `src/components/VibePromptInput.tsx` - UI component for entering natural language prompts
- `src/lib/vibeCodeSystemPrompt.ts` - System prompt that instructs the LLM how to generate valid JSON UI
- `server.ts` - Express backend (TypeScript) with mock data and four endpoints:
  - `GET /api/data` - Returns all mock data
  - `POST /api/data` - Updates data at specified path
  - `POST /api/llm/prompt` - Proxies prompts to Pollamin LLM API for AI-powered UI generation
  - `GET /api/simulate` - Randomly updates metrics for demo
- `services/pollamin.ts` - Pollamin LLM API client

### JSON UI Format
UI trees are defined as JSON with this structure:
```json
{
  "root": "main",
  "elements": {
    "main": { "type": "Stack", "props": {...}, "children": ["child1"] },
    "child1": { "type": "Text", "props": { "content": { "path": "/user/name" } } }
  }
}
```

### Path-Based Data Binding
Props can reference backend data using `{ "path": "/field/name" }` syntax. The `useDynamicValue()` hook in components resolves these path references to actual data values.

## Environment Configuration

The Vibe-Code feature requires a Pollamin API key. Set the following environment variable:
```bash
POLLAMIN_API_KEY=<your-api-key>
```

This can be configured in a `.env` file at the project root.

## Tech Stack
- React 19.2.0 + TypeScript 5.9.3
- Vite 7.2.4
- Express 5.2.1
- @json-render/core and @json-render/react
- Pollamin LLM API for AI-powered UI generation
- Strict TypeScript configuration enabled
