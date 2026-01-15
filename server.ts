import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import * as pollamin from "./services/pollamin.js";

// Type definitions for our mock database
interface UserStats {
  commits: number;
  prs: number;
  reviews: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  department: string;
  joinDate: string;
  skills: string[];
  stats: UserStats;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  status: string;
}

interface Metrics {
  cpu: number;
  memory: number;
  requests: number;
  errors: number;
  uptime: number;
  responseTime: number;
}

interface Orders {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  revenue: number;
  avgOrderValue: number;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  users: number;
  growth: number;
}

interface Database {
  user: User;
  team: TeamMember[];
  metrics: Metrics;
  orders: Orders;
  notifications: Notification[];
  products: Product[];
}

const app = express();
app.use(cors());
app.use(express.json());

// Mock database
const db: Database = {
  user: {
    id: 1,
    name: "Sarah Chen",
    email: "sarah@example.com",
    role: "Engineering Lead",
    avatar: "SC",
    department: "Platform",
    joinDate: "2022-03-15",
    skills: ["React", "TypeScript", "Go", "Kubernetes"],
    stats: {
      commits: 847,
      prs: 156,
      reviews: 423,
    },
  },
  team: [
    { id: 1, name: "Sarah Chen", role: "Engineering Lead", status: "active" },
    { id: 2, name: "Marcus Johnson", role: "Senior Engineer", status: "active" },
    { id: 3, name: "Priya Patel", role: "Engineer", status: "away" },
    { id: 4, name: "Alex Kim", role: "Engineer", status: "active" },
  ],
  metrics: {
    cpu: 34,
    memory: 67,
    requests: 12847,
    errors: 23,
    uptime: 99.97,
    responseTime: 45,
  },
  orders: {
    total: 1284,
    pending: 47,
    completed: 1198,
    cancelled: 39,
    revenue: 89420,
    avgOrderValue: 69.64,
  },
  notifications: [
    { id: 1, type: "info", message: "Deployment completed successfully", time: "2 min ago" },
    { id: 2, type: "warning", message: "High memory usage detected", time: "15 min ago" },
    { id: 3, type: "success", message: "All tests passed", time: "1 hour ago" },
  ],
  products: [
    { id: 1, name: "Pro Plan", price: 29, users: 1420, growth: 12 },
    { id: 2, name: "Team Plan", price: 79, users: 567, growth: 23 },
    { id: 3, name: "Enterprise", price: 199, users: 89, growth: 45 },
  ],
};

// GET /api/data - returns all data
app.get("/api/data", (_req: Request, res: Response) => {
  res.json(db);
});

// POST /api/data - update data (for demo interactivity)
interface UpdateDataBody {
  path: string;
  value: unknown;
}

app.post("/api/data", (req: Request<object, unknown, UpdateDataBody>, res: Response) => {
  const { path, value } = req.body;
  const parts = path.split("/").filter(Boolean);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let target: any = db;
  for (let i = 0; i < parts.length - 1; i++) {
    target = target[parts[i]];
  }

  if (target) {
    target[parts[parts.length - 1]] = value;
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid path" });
  }
});

// LLM endpoint - proxy to Pollamin API
interface LlmPromptBody {
  model?: string;
  prompt?: string;
}

app.post("/api/llm/prompt", async (req: Request<object, unknown, LlmPromptBody>, res: Response) => {
  const { model, prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  try {
    const data = await pollamin.prompt(prompt, model);
    res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// Simulate real-time updates
app.get("/api/simulate", (_req: Request, res: Response) => {
  // Randomly update metrics
  db.metrics.cpu = Math.floor(Math.random() * 60) + 20;
  db.metrics.memory = Math.floor(Math.random() * 40) + 50;
  db.metrics.requests += Math.floor(Math.random() * 100);
  db.metrics.errors += Math.floor(Math.random() * 5);
  db.metrics.responseTime = Math.floor(Math.random() * 30) + 30;

  // Randomly update orders
  db.orders.total += Math.floor(Math.random() * 20);
  db.orders.pending = Math.floor(Math.random() * 60) + 20;
  db.orders.completed += Math.floor(Math.random() * 15);
  db.orders.revenue += Math.floor(Math.random() * 2000);
  db.orders.avgOrderValue = +(Math.random() * 40 + 50).toFixed(2);

  // Randomly update user stats
  db.user.stats.commits += Math.floor(Math.random() * 5);
  db.user.stats.prs += Math.floor(Math.random() * 3);
  db.user.stats.reviews += Math.floor(Math.random() * 4);

  // Randomly change team member statuses
  db.team.forEach((member) => {
    member.status = Math.random() > 0.7 ? "away" : "active";
  });

  // Randomly update product stats
  db.products.forEach((product) => {
    product.users += Math.floor(Math.random() * 20);
    product.growth = Math.floor(Math.random() * 30) + 5;
  });

  res.json({ success: true, message: "All data updated!" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log(`Fetch data: http://localhost:${PORT}/api/data`);
});
