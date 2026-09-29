import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import bcrypt from 'bcryptjs';
import { db } from './server/db.js';
import { generateToken, requireAuth, AuthRequest } from './server/auth.js';
import { energyEngine } from './server/energyEngine.js';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const app = express();
const server = http.createServer(app);

// JSON body parser
app.use(express.json());

// Set up WebSocket server on path /ws/grid
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const url = request.url || '';
  if (url.startsWith('/ws/grid')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws) => {
  energyEngine.registerClient(ws);
});

// ==========================================
// 1. AUTHENTICATION ENDPOINTS (Username & Password)
// ==========================================

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { username, password, confirmPassword } = req.body;

  // 1. Validate username
  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: 'Please enter a valid username.' });
  }

  const cleanUsername = username.trim();
  if (cleanUsername.length < 2) {
    return res.status(400).json({ error: 'Username must be at least 2 characters long.' });
  }

  // 2. Validate password
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // 3. Check that Password and Confirm Password match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  // 4. Check whether the username already exists
  const existingUser = db.findUserByUsername(cleanUsername);
  if (existingUser) {
    // 5. If the username already exists, show exact message:
    return res.status(400).json({ error: 'Username already exists. Please choose another username.' });
  }

  // 6. If valid:
  // - Create the user account in the database.
  // - Store the exact username entered by the user.
  // - NEVER store the password as plain text.
  // - Securely hash the password on the backend using a modern password hashing algorithm (bcrypt).
  // - Set the account as ACTIVE immediately.
  // - Do NOT require email verification.
  // - Do NOT generate an OTP.
  // - Do NOT send an email.
  // - Do NOT require Gmail.
  const user = db.createUser(cleanUsername, password);

  return res.status(201).json({
    message: 'Account created successfully.',
    user: {
      id: user.id,
      username: user.username,
      selectedStationId: user.selectedStationId,
      role: user.role,
      account_status: 'ACTIVE'
    }
  });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  // 1. User enters username and password
  if (!username || typeof username !== 'string' || !username.trim() || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const cleanUsername = username.trim();

  // 2. Backend checks the username
  const user = db.findUserByUsername(cleanUsername);
  if (!user) {
    // 5. If incorrect:
    return res.status(401).json({ error: 'Incorrect username or password. Please try again.' });
  }

  // 3. Backend securely verifies the password against the stored password hash
  const isValidPassword = bcrypt.compareSync(password, user.passwordHash);
  if (!isValidPassword) {
    // 5. If incorrect:
    return res.status(401).json({ error: 'Incorrect username or password. Please try again.' });
  }

  // 4. If correct, create an authenticated session/JWT and open the POLAR-GRID AI system
  const token = generateToken(user);
  return res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      username: user.username, // Exact stored username
      selectedStationId: user.selectedStationId,
      role: user.role,
      account_status: user.account_status
    }
  });
});

// GET /api/auth/me
app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
  const user = req.user!;
  const station = db.getStationById(user.selectedStationId);
  const settings = db.getUserSettings(user.id);

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      selectedStationId: user.selectedStationId,
      role: user.role,
      account_status: user.account_status,
      station,
      settings
    }
  });
});

// ==========================================
// 2. RESEARCH STATIONS
// ==========================================

// GET /api/stations
app.get('/api/stations', (req, res) => {
  const stations = db.getStations();
  return res.json(stations);
});

// GET /api/stations/:id
app.get('/api/stations/:id', (req, res) => {
  const station = db.getStationById(req.params.id);
  if (!station) {
    return res.status(404).json({ error: 'Please select a valid research station.' });
  }
  return res.json(station);
});

// POST /api/stations/select
app.post('/api/stations/select', requireAuth, (req: AuthRequest, res) => {
  const { stationId } = req.body;
  const station = db.getStationById(stationId);
  if (!station) {
    return res.status(400).json({ error: 'Please select a valid research station.' });
  }

  db.updateUserStation(req.user!.id, stationId);
  return res.json({
    message: 'Research station successfully assigned',
    station
  });
});

// ==========================================
// 3. AI ENGINE STATE
// ==========================================

// POST /api/engine/toggle
app.post('/api/engine/toggle', requireAuth, (req, res) => {
  const { active } = req.body;
  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: 'AI engine could not start. Please try again.' });
  }

  const newState = energyEngine.setEngineState(active);
  return res.json({
    success: true,
    aiEngineActive: newState,
    status: newState ? 'ACTIVE' : 'OFFLINE'
  });
});

// GET /api/engine/status
app.get('/api/engine/status', (req, res) => {
  return res.json({
    aiEngineActive: energyEngine.getIsEngineActive(),
    status: energyEngine.getIsEngineActive() ? 'ACTIVE' : 'OFFLINE'
  });
});

// ==========================================
// 4. DASHBOARD & ENERGY DATA
// ==========================================

// GET /api/dashboard/overview
app.get('/api/dashboard/overview', (req, res) => {
  const snapshot = energyEngine.getTelemetrySnapshot();
  return res.json(snapshot);
});

// GET /api/energy/sources
app.get('/api/energy/sources', (req, res) => {
  const snapshot = energyEngine.getTelemetrySnapshot();
  return res.json(snapshot.sources);
});

// GET /api/energy/availability
app.get('/api/energy/availability', (req, res) => {
  const snapshot = energyEngine.getTelemetrySnapshot();
  const availability = snapshot.sources.map(s => ({
    id: s.id,
    name: s.name,
    type: s.type,
    availabilityPct: s.availabilityPct,
    status: s.status,
    outputMw: s.outputMw,
    capacityMw: s.capacityMw
  }));
  return res.json(availability);
});

// GET /api/energy/mix
app.get('/api/energy/mix', (req, res) => {
  const snapshot = energyEngine.getTelemetrySnapshot();
  const mix = snapshot.sources.map(s => ({
    name: s.name.split(' ')[0],
    fullName: s.name,
    outputMw: s.outputMw,
    sharePct: snapshot.metrics.totalGenerationMw > 0 
      ? Math.round((s.outputMw / snapshot.metrics.totalGenerationMw) * 100) 
      : 0
  }));
  return res.json({
    totalGenerationMw: snapshot.metrics.totalGenerationMw,
    renewableContributionPct: snapshot.metrics.renewableContributionPct,
    mix
  });
});

// GET /api/grid/nodes
app.get('/api/grid/nodes', (req, res) => {
  const snapshot = energyEngine.getTelemetrySnapshot();
  return res.json(snapshot.nodes);
});

// GET /api/grid/readings
app.get('/api/grid/readings', (req, res) => {
  const snapshot = energyEngine.getTelemetrySnapshot();
  return res.json(snapshot.recentReadings);
});

// GET /api/analytics
app.get('/api/analytics', (req, res) => {
  const snapshot = energyEngine.getTelemetrySnapshot();
  return res.json({
    summary: {
      averageGenerationMw: 147.2,
      averageConsumptionMw: 125.4,
      renewablePenetrationPct: snapshot.metrics.renewableContributionPct,
      gridStabilityIndex: 98.4,
      efficiencyIndex: snapshot.metrics.gridEfficiencyPct,
      carbonOffsetMetricTons: 412.8
    },
    recentReadings: snapshot.recentReadings,
    sources: snapshot.sources,
    nodes: snapshot.nodes
  });
});

// GET /api/predictions
app.get('/api/predictions', (req, res) => {
  const snapshot = energyEngine.getTelemetrySnapshot();
  return res.json(snapshot.predictions);
});

// GET /api/anomalies
app.get('/api/anomalies', (req, res) => {
  const snapshot = energyEngine.getTelemetrySnapshot();
  return res.json(snapshot.anomalies);
});

// ==========================================
// 5. ALERTS & RECOMMENDATIONS
// ==========================================

// GET /api/alerts
app.get('/api/alerts', (req, res) => {
  const alerts = db.getAlerts();
  return res.json(alerts);
});

// PATCH /api/alerts/:id/acknowledge
app.patch('/api/alerts/:id/acknowledge', requireAuth, (req, res) => {
  const alert = db.acknowledgeAlert(req.params.id);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found.' });
  }
  return res.json({ message: 'Alert acknowledged', alert });
});

// PATCH /api/alerts/:id/resolve
app.patch('/api/alerts/:id/resolve', requireAuth, (req, res) => {
  const alert = db.resolveAlert(req.params.id);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found.' });
  }
  return res.json({ message: 'Alert marked as resolved', alert });
});

// GET /api/recommendations
app.get('/api/recommendations', (req, res) => {
  const recommendations = db.getRecommendations();
  return res.json(recommendations);
});

// ==========================================
// 6. REPORTS
// ==========================================

// GET /api/reports
app.get('/api/reports', (req, res) => {
  const reportData = {
    generatedAt: new Date().toISOString(),
    station: 'Research Station Alpha',
    metrics: {
      totalEnergyGeneratedMwh: 3540.8,
      totalEnergyConsumedMwh: 3012.4,
      renewableEnergyMwh: 2266.1,
      dieselBackupMwh: 746.3,
      batteryDischargedMwh: 528.4,
      averageEfficiencyPct: 93.6,
      averageGridHealthScore: 96.2,
      anomaliesRecorded: 3,
      unresolvedAlerts: 1
    },
    dailyBreakdown: [
      { date: '2026-09-16', generationMwh: 498.2, consumptionMwh: 422.1, renewablePct: 65, efficiency: 94.1 },
      { date: '2026-09-17', generationMwh: 512.4, consumptionMwh: 435.6, renewablePct: 68, efficiency: 94.5 },
      { date: '2026-09-18', generationMwh: 489.1, consumptionMwh: 418.0, renewablePct: 62, efficiency: 93.2 },
      { date: '2026-09-19', generationMwh: 504.6, consumptionMwh: 429.3, renewablePct: 64, efficiency: 93.8 },
      { date: '2026-09-20', generationMwh: 520.8, consumptionMwh: 441.2, renewablePct: 69, efficiency: 94.7 },
      { date: '2026-09-21', generationMwh: 509.3, consumptionMwh: 432.8, renewablePct: 66, efficiency: 94.0 },
      { date: '2026-09-22', generationMwh: 506.4, consumptionMwh: 433.4, renewablePct: 64, efficiency: 93.8 }
    ]
  };
  return res.json(reportData);
});

// GET /api/reports/export
app.get('/api/reports/export', (req, res) => {
  const csvHeaders = 'Timestamp,Station,Total_Generation_MW,Total_Consumption_MW,Renewable_Pct,Battery_Charge_Pct,Efficiency_Pct,Grid_Health_Pct\n';
  const snapshot = energyEngine.getTelemetrySnapshot();
  const rows = snapshot.recentReadings.map(r => 
    `"${r.time}","Research Station Alpha",${r.generation},${r.consumption},${r.renewable},${snapshot.metrics.batteryChargePct},${r.efficiency},${snapshot.metrics.gridHealthPct}`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="polar_grid_telemetry_report.csv"');
  return res.status(200).send(csvHeaders + rows);
});

// ==========================================
// 7. SETTINGS
// ==========================================

// GET /api/settings
app.get('/api/settings', requireAuth, (req: AuthRequest, res) => {
  const settings = db.getUserSettings(req.user!.id);
  return res.json({
    settings,
    user: {
      id: req.user!.id,
      username: req.user!.username,
      selectedStationId: req.user!.selectedStationId
    }
  });
});

// PUT /api/settings
app.put('/api/settings', requireAuth, (req: AuthRequest, res) => {
  const { username, alertNotificationsEnabled, highLoadThresholdPct, voltageVarianceTolerancePct, theme, autoAcknowledgeMinorAlerts } = req.body;

  if (username && username.trim() !== req.user!.username) {
    const existing = db.findUserByUsername(username);
    if (existing && existing.id !== req.user!.id) {
      return res.status(400).json({ error: 'This username is already in use.' });
    }
    db.updateUserProfile(req.user!.id, username);
  }

  const updated = db.updateUserSettings(req.user!.id, {
    alertNotificationsEnabled,
    highLoadThresholdPct,
    voltageVarianceTolerancePct,
    theme,
    autoAcknowledgeMinorAlerts
  });

  return res.json({
    message: 'Settings updated successfully',
    settings: updated,
    username: req.user!.username
  });
});

// ==========================================
// 8. VITE MIDDLEWARE & STATIC ASSETS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`POLAR-GRID AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
