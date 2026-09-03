import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as runtime from "@prisma/client/runtime/client";
import { e as env } from "./env-BKm1UNh2.js";
import { getQueue } from "@adaptive-ai/sdk/server";
import "zod";
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client"
    },
    "output": {
      "value": "/home/computer/4room-mockups/generated",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "client"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "/home/computer/4room-mockups/schema.prisma",
    "isCustomOutput": true
  },
  "relativePath": "..",
  "clientVersion": "6.19.3",
  "engineVersion": "c2990dca591cba766e3b7ef5d9e8a84796e47ab7",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "sqlite",
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DB_FILE_NAME",
        "value": null
      }
    }
  },
  "inlineSchema": 'generator client {\n  provider   = "prisma-client"\n  output     = "./generated"\n  engineType = "client"\n}\n\ndatasource db {\n  provider = "sqlite"\n  url      = env("DB_FILE_NAME")\n}\n\nmodel User {\n  // Adaptive AI platform columns (do not change)\n  id     String  @id\n  name   String?\n  image  String?\n  handle String?\n\n  // Additional columns can be added here\n}\n',
  "inlineSchemaHash": "2a3276d87fa58909803a3a07d98096386e687660480f631e56f1669caa1e684d",
  "copyEngine": true,
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "dirname": ""
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"handle","kind":"scalar","type":"String"}],"dbName":null}},"enums":{},"types":{}}');
config.engineWasm = void 0;
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("node:buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_bg.sqlite.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_bg.sqlite.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  }
};
function getPrismaClientClass(dirname) {
  config.dirname = dirname;
  return runtime.getPrismaClient(config);
}
runtime.Extensions.getExtensionContext;
({
  DbNull: runtime.objectEnumValues.classes.DbNull,
  JsonNull: runtime.objectEnumValues.classes.JsonNull,
  AnyNull: runtime.objectEnumValues.classes.AnyNull
});
runtime.objectEnumValues.instances.DbNull;
runtime.objectEnumValues.instances.JsonNull;
runtime.objectEnumValues.instances.AnyNull;
runtime.makeStrictEnum({
  Serializable: "Serializable"
});
runtime.Extensions.defineExtension;
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
const PrismaClient = getPrismaClientClass(__dirname);
const adapter = new PrismaBetterSQLite3({
  url: env.DB_FILE_NAME
});
const db = new PrismaClient({ adapter });
async function health() {
  return {
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    db: await db.$queryRaw`SELECT 1 as result`.then(() => "connected").catch(() => "disconnected"),
    env: env.VITE_NODE_ENV
  };
}
const procedures = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  health
}, Symbol.toStringTag, { value: "Module" }));
const jobs = {
  debug: async (payload, job) => {
    console.debug(`Debug handler info: ${payload.info}, job id: ${job.id}`);
  }
};
getQueue();
export {
  jobs,
  procedures
};
