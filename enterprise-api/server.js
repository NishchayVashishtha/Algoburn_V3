const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || "algoburn-dev-key";

// ─── API Key Middleware (protects write endpoints) ─────────────────────────
function requireApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ status: "error", message: "Unauthorized: invalid or missing x-api-key" });
  }
  next();
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Mock In-Memory Database ───────────────────────────────────────────────
let users = [
  { userId: "user_001", name: "Amit Sharma",   email: "amit@test.com",    status: "Active" },
  { userId: "user_002", name: "Priya Patel",   email: "priya@test.com",   status: "Active" },
  { userId: "user_003", name: "Rahul Verma",   email: "rahul@test.com",   status: "Active" },
  { userId: "user_004", name: "Sneha Iyer",    email: "sneha@test.com",   status: "Active" },
  { userId: "user_005", name: "Karan Mehta",   email: "karan@test.com",   status: "Active" },
  { userId: "user_006", name: "Divya Nair",    email: "divya@test.com",   status: "Active" },
  { userId: "user_007", name: "Arjun Singh",   email: "arjun@test.com",   status: "Active" },
  { userId: "user_008", name: "Meera Joshi",   email: "meera@test.com",   status: "Active" },
];

// ─── Routes ────────────────────────────────────────────────────────────────

// Serve Admin Dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// GET /api/v1/users — return current user list
app.get("/api/v1/users", (req, res) => {
  res.json({ status: "success", count: users.length, users });
});

// POST /api/v1/delete-user-data — triggered by AI Agent on NFT burn
app.post("/api/v1/delete-user-data", requireApiKey, (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      status: "error",
      message: "userId is required in the request body",
    });
  }

  const userIndex = users.findIndex((u) => u.userId === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      status: "error",
      message: `No user found with userId: ${userId}`,
    });
  }

  // Mark as Purged (DPDP compliant — audit trail preserved)
  users[userIndex].status = "Purged";
  users[userIndex].email = "[REDACTED]";
  users[userIndex].name = "[REDACTED]";

  console.log(`[AlgoBurn] 🔥 Data purge triggered for ${userId} at ${new Date().toISOString()}`);

  return res.status(200).json({
    status: "success",
    message: `Enterprise Data Purged for ${userId}`,
    timestamp: new Date().toISOString(),
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const base = process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${PORT}`;
  console.log(`\n🚀 AlgoBurn Enterprise API running at ${base}`);
  console.log(`📊 Admin Dashboard : ${base}/`);
  console.log(`🔗 API Base        : ${base}/api/v1`);
  console.log(`🔑 API Key         : ${API_KEY}\n`);
});
