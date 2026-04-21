import { spawn } from "node:child_process";

const children = [];
let shuttingDown = false;

const createCommand = (scriptName) => {
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

const spawnProcess = (label, scriptName) => {
  const { command, args } = createCommand(scriptName);
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
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

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

spawnProcess("backend", "dev:server");
spawnProcess("frontend", "dev:client");
