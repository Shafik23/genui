import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Mock database
const db = {
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
app.get("/api/data", (req, res) => {
  res.json(db);
});

// POST /api/data - update data (for demo interactivity)
app.post("/api/data", (req, res) => {
  const { path, value } = req.body;
  const parts = path.split("/").filter(Boolean);

  let target = db;
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

// Simulate real-time updates
app.get("/api/simulate", (req, res) => {
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
  const statuses = ["active", "away", "active", "active"];
  db.team.forEach((member, i) => {
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
