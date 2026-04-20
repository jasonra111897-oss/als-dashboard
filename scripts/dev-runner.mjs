import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [];

const spawnProcess = (label, scriptName) => {
  const child = spawn(npmCommand, ["run", scriptName], {
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`[${label}] stopped by signal ${signal}`);
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
  return child;
};

let shuttingDown = false;

const shutdown = (exitCode = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill("SIGKILL");
      }
    }
    process.exit(exitCode);
  }, 300);
};

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

spawnProcess("backend", "dev:server");
spawnProcess("frontend", "dev:client");
