import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

loadEnvFile();

const PORT = Number(process.env.PORT || 3001);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.MONGODB_DB || "panthera";
const STATE_ID = "app-state";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const DEFAULT_STATE = {
  pending: [],
  approved: [],
  rejected: [],
  scouts: [],
  finances: [],
  inventory: [],
  projects: [],
  badgeReports: [],
  awardedBadges: [],
  announcements: [],
  notifications: [],
  roles: [
    { id: "SYSTEM_ADMIN", name: "SYSTEM_ADMIN", label: "System Administrator" },
    { id: "MEMBER", name: "MEMBER", label: "Member" },
    { id: "SECRETARY", name: "SECRETARY", label: "Secretary" },
    { id: "OG", name: "OG", label: "Organizing Secretary" },
    { id: "TREASURER", name: "TREASURER", label: "Treasurer" },
    { id: "QUARTERMASTER", name: "QUARTERMASTER", label: "Quartermaster" },
    { id: "DISCIPLINARIAN", name: "DISCIPLINARIAN", label: "Disciplinarian" },
    { id: "CREW_LEADER", name: "CREW_LEADER", label: "Crew Leader" },
    { id: "ASSISTANT_CREW_LEADER", name: "ASSISTANT_CREW_LEADER", label: "Assistant Crew Leader" }
  ],
  users: [
    {
      id: "system-admin",
      email: "admin@ku.ac.ke",
      name: "System Administrator",
      role: "SYSTEM_ADMIN",
      registrationNumber: "ADMIN-001",
      phone: "",
      school: "",
      course: "",
      yearOfStudy: null,
      dateJoined: new Date().toISOString(),
      membershipStatus: "Active",
      registrationFeePaid: true
    }
  ]
};

function loadEnvFile() {
  if (!existsSync(".env")) return;

  const lines = readFileSync(".env", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
}

let mongoClient;

async function getStateCollection() {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
  }
  return mongoClient.db(DB_NAME).collection("app_state");
}

async function readState() {
  const collection = await getStateCollection();
  const state = await collection.findOne({ _id: STATE_ID });
  if (!state) {
    await writeState(DEFAULT_STATE);
    return DEFAULT_STATE;
  }
  delete state._id;
  return { ...DEFAULT_STATE, ...state };
}

async function writeState(state) {
  const collection = await getStateCollection();
  const next = { ...DEFAULT_STATE, ...state };
  await collection.updateOne(
    { _id: STATE_ID },
    { $set: next },
    { upsert: true },
  );
  return next;
}

async function readJsonBody(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  return body ? JSON.parse(body) : {};
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(payload));
}

function issueToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function getAuthToken(request) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

function hasPermission(role, action) {
  const map = {
    SYSTEM_ADMIN: ["read-state", "write-state", "manage-users", "manage-settings"],
    MEMBER: ["read-state", "update-profile"],
    SECRETARY: ["read-state", "write-state", "manage-members"],
    OG: ["read-state", "write-state", "manage-events"],
    TREASURER: ["read-state", "write-state", "manage-payments"],
    QUARTERMASTER: ["read-state", "write-state", "manage-inventory"],
    DISCIPLINARIAN: ["read-state", "write-state", "manage-discipline"],
    CREW_LEADER: ["read-state"],
    ASSISTANT_CREW_LEADER: ["read-state"]
  };
  return Boolean(map[role]?.includes(action));
}

async function authorizeRequest(request) {
  const token = getAuthToken(request);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const state = await readState();
  return state.users.find((user) => user.id === payload.id && user.email === payload.email);
}

async function getUserByEmail(email) {
  const state = await readState();
  return state.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

async function createUser(email, name) {
  const state = await readState();
  const member = {
    id: `user-${Date.now()}`,
    email,
    name,
    role: "MEMBER",
    registrationNumber: `KM-${Math.floor(1000 + Math.random() * 9000)}`,
    phone: "",
    school: "",
    course: "",
    yearOfStudy: null,
    dateJoined: new Date().toISOString(),
    membershipStatus: "Pending",
    registrationFeePaid: false
  };
  const updated = { ...state, users: [...state.users, member] };
  await writeState(updated);
  return member;
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "OPTIONS") {
      sendJson(response, 204, {});
      return;
    }

    if (url.pathname === "/api/health") {
      await getStateCollection();
      sendJson(response, 200, { ok: true, database: DB_NAME });
      return;
    }

    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      const { email, name } = await readJsonBody(request);
      if (!email) {
        sendJson(response, 400, { error: "Email is required" });
        return;
      }
      let user = await getUserByEmail(email);
      if (!user) {
        user = await createUser(email, name || email.split("@")[0]);
      }
      const token = issueToken(user);
      sendJson(response, 200, { token, user });
      return;
    }

    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      const user = await authorizeRequest(request);
      if (!user) {
        sendJson(response, 401, { error: "Unauthorized" });
        return;
      }
      sendJson(response, 200, { user });
      return;
    }

    if (url.pathname === "/api/state" && request.method === "GET") {
      const user = await authorizeRequest(request);
      if (!user) {
        sendJson(response, 401, { error: "Unauthorized" });
        return;
      }
      const state = await readState();
      sendJson(response, 200, state);
      return;
    }

    if (url.pathname === "/api/state" && request.method === "PATCH") {
      const user = await authorizeRequest(request);
      if (!user) {
        sendJson(response, 401, { error: "Unauthorized" });
        return;
      }
      if (!hasPermission(user.role, "write-state")) {
        sendJson(response, 403, { error: "Forbidden" });
        return;
      }
      const current = await readState();
      const updates = await readJsonBody(request);
      const next = { ...current, ...updates };
      sendJson(response, 200, await writeState(next));
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Panthera API listening on http://localhost:${PORT}`);
  console.log(`Using MongoDB database "${DB_NAME}"`);
});

async function shutdown() {
  if (mongoClient) await mongoClient.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
