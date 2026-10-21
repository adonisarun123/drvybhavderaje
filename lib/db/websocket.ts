import ws from "ws";

/**
 * Returns a WebSocket constructor for the Neon serverless driver.
 * Node 22+ ships a global WebSocket, but it cannot traverse an HTTPS proxy.
 * When HTTPS_PROXY is set (corporate networks, sandboxed CI), tunnel the
 * database WebSocket through it with the `ws` package instead.
 */
export function resolveWebSocketConstructor(): typeof ws | undefined {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy) {
    // Lazy require keeps https-proxy-agent out of the edge/browser bundles.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { HttpsProxyAgent } = require("https-proxy-agent") as typeof import("https-proxy-agent");
    const agent = new HttpsProxyAgent(proxy);
    class ProxiedWebSocket extends ws {
      constructor(address: string | URL, protocols?: string | string[]) {
        super(address, protocols, { agent });
      }
    }
    return ProxiedWebSocket as unknown as typeof ws;
  }
  if (typeof WebSocket === "undefined") return ws;
  return undefined;
}
