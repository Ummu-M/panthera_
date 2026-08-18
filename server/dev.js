import { spawn } from "node:child_process";
import { join } from "node:path";

const commands = [
  ["api", process.execPath, ["server/index.js"]],
  ["web", process.execPath, [join("node_modules", "vite", "bin", "vite.js"), "--host", "0.0.0.0"]],
];

const children = commands.map(([name, command, args]) => {
  const child = spawn(command, args, {
    stdio: ["inherit", "pipe", "pipe"],
  });

  child.stdout.on("data", (data) => process.stdout.write(`[${name}] ${data}`));
  child.stderr.on("data", (data) => process.stderr.write(`[${name}] ${data}`));
  child.on("exit", (code) => {
    if (code && code !== 0) process.exitCode = code;
  });

  return child;
});

function stop() {
  for (const child of children) child.kill();
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
