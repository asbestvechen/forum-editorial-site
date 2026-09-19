import { createLogger, defineConfig, HttpProxy } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { env } from "./src/lib/env";
import http from "http";
import { resolve } from "node:path";

function proxyConfig(proxy: HttpProxy.ProxyServer) {
  proxy.on("error", function (err, _req, res) {
    if ("writeHead" in res) {
      (res as http.ServerResponse).writeHead(500, {
        "Content-Type": "application/json",
      });

      res.end(
        JSON.stringify({
          json: { error: "PROXY_ERROR", details: err.message },
        }),
      );
    }
  });
}

const pad = (n: number) => String(n).padStart(2, "0");
const pad3 = (n: number) => String(n).padStart(3, "0");

function formatTimestamp(d: Date) {
  return (
    `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `.${pad3(d.getMilliseconds())}`
  );
}

function timestampedLogger() {
  const base = createLogger("info", { allowClearScreen: false });
  const withTimestamp = (
    log: (msg: string, opts?: { timestamp?: boolean }) => void,
  ) => {
    return (msg: string, opts?: { timestamp?: boolean }) =>
      log(`[${formatTimestamp(new Date())}] ${msg}`, {
        ...opts,
        timestamp: false,
      });
  };

  return {
    ...base,
    info: withTimestamp(base.info.bind(base)),
    warn: withTimestamp(base.warn.bind(base)),
    warnOnce: withTimestamp(base.warnOnce.bind(base)),
    error: withTimestamp(base.error.bind(base)),
  };
}

function stripCrossOriginFromLocalAssets() {
  return {
    name: "strip-crossorigin-from-local-assets",
    transformIndexHtml: {
      order: "post" as const,
      handler(html: string) {
        return html
          .replace(/(<script\b[^>]*?)\s+crossorigin(?=[^>]*\bsrc="\.\/assets\/)/g, "$1")
          .replace(/(<link\b[^>]*?)\s+crossorigin(?=[^>]*\bhref="\.\/assets\/)/g, "$1");
      },
    },
  };
}

export default ({ mode }: { mode: "development" | "production" }) => {
  console.log(`Started vite server in mode: ${mode}`);

  return defineConfig({
    base: "./",
    plugins: [tsconfigPaths(), react(), tailwindcss(), stripCrossOriginFromLocalAssets()],
    customLogger: timestampedLogger(),
    server: {
      port: Number(env.PORT),
      strictPort: true,
      allowedHosts: true,
      watch: {
        ignored: [
          "**/*.db",
          "**/*.db-journal",
          "**/*.db-shm",
          "**/*.db-wal",
          "**/*.log",
          resolve(import.meta.dirname, "data/**"),
          resolve(import.meta.dirname, "migrations/**"),
        ],
      },
      proxy: {
        "/_logger": {
          target: "http://localhost:" + (Number(env.PORT) + 1),
          changeOrigin: true,
          secure: false,
          configure: proxyConfig,
        },
        "/api/": {
          target: "http://localhost:" + (Number(env.PORT) + 1),
          changeOrigin: true,
          secure: false,
          configure: proxyConfig,
        },
      },
    },
    preview: {
      port: Number(env.PORT),
      strictPort: true,
      allowedHosts: true,
      proxy: {
        "/_logger": {
          target: "http://localhost:" + (Number(env.PORT) + 1),
          changeOrigin: true,
          secure: false,
          configure: proxyConfig,
        },
        "/api/": {
          target: "http://localhost:" + (Number(env.PORT) + 1),
          changeOrigin: true,
          secure: false,
          configure: proxyConfig,
        },
      },
    },
  });
};
