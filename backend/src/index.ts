import "dotenv/config";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const port = env.PORT;
const app = createApp();

app.listen(port, () => {
  console.log(`Responsyva CRM AI API running on http://localhost:${port}`);
});
