import { v4 as uuidv4 } from 'uuid';

interface SessionData {
  sessionId: string;
  status: 'pending' | 'scanned' | 'authenticated' | 'completed';
  createdAt: number;
  userData?: any;
  jwt?: string;
}

class SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private readonly EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes

  createSession(): string {
    const sessionId = uuidv4();
    this.sessions.set(sessionId, {
      sessionId,
      status: 'pending',
      createdAt: Date.now(),
    });
    return sessionId;
  }

  getSession(sessionId: string): SessionData | undefined {
    this.cleanup();
    return this.sessions.get(sessionId);
  }

  markAsScanned(sessionId: string): boolean {
    return this.updateSession(sessionId, { status: 'scanned' });
  }

  updateSession(sessionId: string, data: Partial<SessionData>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    this.sessions.set(sessionId, { ...session, ...data });
    return true;
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.createdAt > this.EXPIRATION_TIME) {
        this.sessions.delete(id);
      }
    }
  }
}

export const sessionManager = new SessionManager();
