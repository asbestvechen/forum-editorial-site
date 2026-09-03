import { z } from "zod";
const publicSchema = z.object({
  VITE_APP_ID: z.string(),
  VITE_BASE_URL: z.url(),
  VITE_ROOT_URL: z.url(),
  VITE_REALTIME_DOMAIN: z.string(),
  VITE_BOX_ID: z.string(),
  VITE_NODE_ENV: z.enum(["development", "production"]).default("development")
});
const serverSchema = z.object({
  PORT: z.string(),
  API_KEY: z.string(),
  // provided by system variables
  DB_FILE_NAME: z.string(),
  GUEST_SERVICES_URL: z.url(),
  QUEUE_DB_FILE_NAME: z.string(),
  ERRORS_DB_FILE_NAME: z.string(),
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_NOTIFY_CHAT_ID: z.string().min(1).optional(),
  TELEGRAM_ADMIN_CHAT_ID: z.string().min(1).optional()
});
const schema = serverSchema.extend(publicSchema.shape);
const schemaToCheck = schema;
const parsed = schemaToCheck.safeParse(process?.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}
const proxy = new Proxy(parsed.data, {
  get(target, prop) {
    {
      return target[prop];
    }
  }
});
const env = proxy;
export {
  env as e
};
