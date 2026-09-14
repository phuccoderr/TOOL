import { buildApp } from "./app.js";
import { env } from "./config/env.js";

const start = async () => {
  try {
    const app = await buildApp();
    await app.listen({ host: env.host, port: env.port });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

await start();
