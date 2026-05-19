/**
 * Server-Sent Events (SSE) broker.
 * Maintains a registry of active SSE connections per provider.
 * When a new lead is assigned, the distribution engine calls broadcast()
 * so the relevant provider dashboards update instantly.
 */

class SSEBroker {
  constructor() {
    // Map<providerId, Set<WritableStreamDefaultWriter>>
    this.clients = new Map();
  }

  /** Register a new SSE client for a provider */
  addClient(providerId, writer) {
    if (!this.clients.has(providerId)) {
      this.clients.set(providerId, new Set());
    }
    this.clients.get(providerId).add(writer);
    console.log(`[SSE] Provider ${providerId} connected. Total clients: ${this.clientCount()}`);
  }

  /** Remove a client when the connection closes */
  removeClient(providerId, writer) {
    const set = this.clients.get(providerId);
    if (set) {
      set.delete(writer);
      if (set.size === 0) this.clients.delete(providerId);
    }
    console.log(`[SSE] Provider ${providerId} disconnected. Total clients: ${this.clientCount()}`);
  }

  /** Push a lead event to a specific provider */
  send(providerId, data) {
    const set = this.clients.get(providerId);
    if (!set || set.size === 0) return;
    const message = `data: ${JSON.stringify(data)}\n\n`;
    for (const writer of set) {
      try {
        writer.write(new TextEncoder().encode(message));
      } catch (err) {
        console.error('[SSE] Write error:', err);
        set.delete(writer);
      }
    }
  }

  /** Broadcast a lead to all assigned providers */
  broadcast(providerIds, leadData) {
    for (const id of providerIds) {
      this.send(String(id), leadData);
    }
  }

  clientCount() {
    let total = 0;
    for (const set of this.clients.values()) total += set.size;
    return total;
  }
}

// Singleton shared across the Next.js process
const broker = global.sseBroker ?? (global.sseBroker = new SSEBroker());
export default broker;
