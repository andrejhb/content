// Shared dev-server management for the render scripts. The ready probe hits a
// known asset path so a foreign app squatting the port is never mistaken for
// this one; when we spawn our own server it goes on an explicit free port.

import { spawn } from "node:child_process";
import net from "node:net";

const READY_PATH = "/asset/shared/logos/hububb-symbol.svg";

export async function isUp(base) {
  try {
    const r = await fetch(`${base}${READY_PATH}`, { method: "GET" });
    return r.ok;
  } catch {
    return false;
  }
}

async function waitUntilUp(base, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isUp(base)) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

export function portIsFree(p) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    srv.listen(p, () => srv.close(() => resolve(true)));
  });
}

export async function freePort(start = 3100) {
  for (let p = start; p < start + 20; p++) {
    if (await portIsFree(p)) return p;
  }
  throw new Error("no free port between 3100 and 3119");
}

/**
 * Ensure a dev server serves this app. Returns { base, spawned, proc }.
 * `explicitBase` (RENDER_BASE_URL) is honored: we only spawn on its port and
 * error clearly if a foreign process holds it.
 */
export async function ensureServer(explicitBase) {
  let base = explicitBase || "http://localhost:3000";
  if (await isUp(base)) return { base, spawned: false, proc: null };

  let port;
  if (explicitBase) {
    port = Number(new URL(explicitBase).port) || 3000;
    if (!(await portIsFree(port))) {
      throw new Error(
        `nothing serving the app at ${explicitBase}, and its port ${port} is taken by another process`,
      );
    }
  } else {
    port = await freePort();
    base = `http://localhost:${port}`;
  }
  console.log(`• no dev server detected — starting one on :${port}…`);
  // detached so the child gets its own process group — lets us kill the whole
  // tree (npm + next-server) on cleanup instead of orphaning the server.
  const proc = spawn("npm", ["run", "dev", "--", "--port", String(port)], {
    cwd: process.cwd(),
    stdio: "ignore",
    env: process.env,
    detached: true,
  });
  const ok = await waitUntilUp(base, 90_000);
  if (!ok) {
    stopServer(proc);
    throw new Error("dev server did not come up within 90s");
  }
  return { base, spawned: true, proc };
}

export function stopServer(proc) {
  if (!proc) return;
  try {
    process.kill(-proc.pid, "SIGTERM"); // kill the whole process group
  } catch {
    try {
      proc.kill("SIGTERM");
    } catch {}
  }
}
