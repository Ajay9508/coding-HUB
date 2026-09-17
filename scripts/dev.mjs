import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const services = [
  { label: "API", args: ["--prefix", "backend", "run", "dev"] },
  { label: "Web", args: ["--prefix", "frontend", "run", "dev"] },
];

let stopping = false;
const children = services.map(({ label, args }) => {
  const child = spawn(npmCommand, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("error", (error) => {
    console.error(`${label} failed to start: ${error.message}`);
    stop(1);
  });

  child.on("exit", (code) => {
    if (!stopping && code !== 0) {
      console.error(`${label} stopped unexpectedly.`);
      stop(code ?? 1);
    }
  });

  return child;
});

function stop(exitCode = 0) {
  if (stopping) return;

  stopping = true;
  children.forEach((child) => child.kill("SIGTERM"));
  process.exit(exitCode);
}

process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
