// Imported first by scripts so .env.local is loaded before any module reads process.env.
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
