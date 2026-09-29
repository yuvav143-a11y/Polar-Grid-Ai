import {
  User,
  ResearchStation,
  TelemetrySnapshot,
  Alert,
  Recommendation,
  UserSettings
} from '../types';

const TOKEN_KEY = 'polar_grid_jwt_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async register(payload: { username: string; password: string; confirmPassword: string }): Promise<{ message: string; user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create account.');
    }
    return data;
  },

  async login(payload: { username: string; password: string }): Promise<{ message: string; token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Incorrect username or password. Please try again.');
    }
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch user session.');
    }
    return data;
  },

  async getStations(): Promise<ResearchStation[]> {
    const res = await fetch('/api/stations');
    if (!res.ok) throw new Error('Failed to load research stations.');
    return res.json();
  },

  async selectStation(stationId: string): Promise<{ station: ResearchStation }> {
    const res = await fetch('/api/stations/select', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ stationId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to select station.');
    return data;
  },

  async getOverview(): Promise<TelemetrySnapshot> {
    const res = await fetch('/api/dashboard/overview');
    if (!res.ok) throw new Error('Failed to load dashboard overview.');
    return res.json();
  },

  async toggleAiEngine(active: boolean): Promise<{ success: boolean; aiEngineActive: boolean; status: string }> {
    const res = await fetch('/api/engine/toggle', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ active })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI engine command failed.');
    return data;
  },

  async getAlerts(): Promise<Alert[]> {
    const res = await fetch('/api/alerts');
    if (!res.ok) throw new Error('Failed to load alerts.');
    return res.json();
  },

  async acknowledgeAlert(id: string): Promise<Alert> {
    const res = await fetch(`/api/alerts/${id}/acknowledge`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to acknowledge alert.');
    return data.alert;
  },

  async resolveAlert(id: string): Promise<Alert> {
    const res = await fetch(`/api/alerts/${id}/resolve`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resolve alert.');
    return data.alert;
  },

  async getRecommendations(): Promise<Recommendation[]> {
    const res = await fetch('/api/recommendations');
    if (!res.ok) throw new Error('Failed to load recommendations.');
    return res.json();
  },

  async getReports() {
    const res = await fetch('/api/reports');
    if (!res.ok) throw new Error('Failed to load report data.');
    return res.json();
  },

  getReportExportUrl() {
    return '/api/reports/export';
  },

  async getSettings(): Promise<{ settings: UserSettings; user: User }> {
    const res = await fetch('/api/settings', {
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load settings.');
    return data;
  },

  async updateSettings(settings: Partial<UserSettings> & { username?: string }) {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update settings.');
    return data;
  }
};

export function connectGridWebSocket(
  onData: (snapshot: TelemetrySnapshot) => void,
  onStatusChange?: (connected: boolean) => void
): () => void {
  let socket: WebSocket | null = null;
  let isClosed = false;
  let reconnectTimeout: any = null;

  function connect() {
    if (isClosed) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/grid`;

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      if (onStatusChange) onStatusChange(true);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        onData(payload);
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    socket.onclose = () => {
      if (onStatusChange) onStatusChange(false);
      if (!isClosed) {
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    socket.onerror = () => {
      socket?.close();
    };
  }

  connect();

  return () => {
    isClosed = true;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (socket) socket.close();
  };
}
