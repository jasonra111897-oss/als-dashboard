import { spawn } from "node:child_process";
import net from "node:net";

const children = [];
let shuttingDown = false;

const getScriptCommand = (scriptName) => {
  if (process.platform === "win32") {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", "npm", "run", scriptName],
    };
  }

  return {
    command: "npm",
    args: ["run", scriptName],
  };
};

const isPortAvailable = (port) =>
  new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "127.0.0.1");
  });

const findAvailablePort = async (preferredPort, attempts = 20) => {
  for (let offset = 0; offset < attempts; offset += 1) {
    const candidatePort = preferredPort + offset;
    const available = await isPortAvailable(candidatePort);

    if (available) {
      return candidatePort;
    }
  }

  throw new Error(`No available port found starting from ${preferredPort}.`);
};

const stopChild = (child) => {
  if (!child || child.killed) {
    return;
  }

  try {
    child.kill();
  } catch {
    // Ignore shutdown errors from already-exiting child processes.
  }
};

const shutdown = (exitCode = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    stopChild(child);
  }

  setTimeout(() => {
    for (const child of children) {
      stopChild(child);
    }

    process.exit(exitCode);
  }, 300);
};

const spawnProcess = (label, scriptName, extraEnv = {}) => {
  const { command, args } = getScriptCommand(scriptName);
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    if (signal) {
      console.log(`[${label}] stopped by signal ${signal}`);
      shutdown(0);
      return;
    }

    if (code && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
      shutdown(code);
    }
  });


  child.on("error", (error) => {
    console.error(`[${label}] failed to start: ${error.message}`);
    shutdown(1);
  });

  children.push(child);
};

const startDev = async () => {
  const backendPort = await findAvailablePort(5000);
  const clientPort = await findAvailablePort(5174);
  const apiBaseUrl = `http://localhost:${backendPort}`;

  if (backendPort !== 5000) {
    console.log(
      `[dev-runner] Port 5000 is busy. Starting the backend on ${backendPort} instead.`
    );
  }

  if (clientPort !== 5174) {
    console.log(
      `[dev-runner] Port 5174 is busy. Starting the frontend on ${clientPort} instead.`
    );
  }

  console.log(`[dev-runner] API base URL: ${apiBaseUrl}`);

  spawnProcess("backend", "dev:server", {
    PORT: String(backendPort),
  });

  spawnProcess("frontend", "dev:client", {
    PORT: String(clientPort),
    VITE_API_BASE_URL: apiBaseUrl,
    VITE_BACKEND_PORT: String(backendPort),
  });
};

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

startDev().catch((error) => {
  console.error(`[dev-runner] ${error.message}`);
  shutdown(1);
});
