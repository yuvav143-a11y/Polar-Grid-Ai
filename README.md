# POLAR-GRID AI
> **"Intelligent Grid Energy Management & AI Analytics"**

POLAR-GRID AI is a mission-critical, enterprise-grade AI-powered energy management and intelligent grid monitoring platform designed for polar and remote research stations and next-generation power distributions.

---

## ⚡ Core Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Recharts, Lucide React, Motion.
- **Backend**: High-performance Full-Stack API server with WebSocket streaming, JWT Authentication, and intelligent analytics engine.
- **Database Schema**: PostgreSQL-compatible relational structure (`users`, `research_stations`, `user_stations`, `grid_nodes`, `grid_readings`, `energy_sources`, `predictions`, `alerts`, `recommendations`, `reports`, `user_settings`).
- **AI Engine**: 
  - Dynamic physics-based multi-source balance computation (Solar, Wind, Battery Storage, Diesel, Hydro).
  - Bi-directional battery charge / discharge governor.
  - Multi-horizon predictive demand & generation forecasting (1h, 6h, 24h).
  - Multi-node anomaly detection (frequency fluctuations, load spikes, voltage drops, battery instability).
  - Real-time intelligent actionable recommendations with priority weighting.
  - Continuous WebSocket telemetry broadcast (`/ws/grid`).

---

## 🚀 Key Functional Modules

1. **POLAR-GRID AI Cinematic Intro**: High-tech electric energy grid intro sequence leading into the authentication portal.
2. **Secure Authentication & Profiles**:
   - Real bcrypt-hashed credentials and JWT tokens.
   - Exact registered username retention (e.g. `Yuva Raj`).
   - Built-in secure password recovery & verification workflow.
3. **Research Station Management**:
   - Real stations (Station Alpha, Beta, Gamma, Delta) with capacity, environmental conditions, and node attachments.
4. **Master AI Engine Governor**:
   - `START AI ENGINE` / `STOP AI ENGINE` interactive control.
   - When offline, processing and animations pause gracefully. When active, real-time telemetry streams via WebSocket.
5. **Live Energy Flow Visualization**:
   - Animated glowing directional energy currents connecting Solar, Wind, Hydro, Diesel, and bi-directional Battery into the Core Polar Grid, flowing down to Distribution and Facility Load.
6. **Energy Source Availability & Mix**:
   - Dynamic Recharts donut charts and multi-tier availability status gauges.
7. **Grid Nodes & Telemetry**:
   - Node status matrix (`GRID-001` through `GRID-005`) with voltage (kV), frequency (Hz), load (MW), and status (NORMAL / WARNING / CRITICAL).
8. **AI Predictive Analytics & Anomaly Detection**:
   - Forecast charts with confidence intervals and peak demand alerts.
   - Real-time anomaly tracker with alert acknowledgment and resolution.
9. **Automated Reports & CSV Export**:
   - Instant export of telemetry readings and compliance audits.
10. **System Settings**:
   - Profile management, notification triggers, appearance modes, and security settings with full persistence.

---

## 🛠️ Environment Configuration

Refer to `.env.example` for runtime secrets and configuration options:
```bash
# Start development
npm run dev

# Build for production
npm run build
npm start
```
