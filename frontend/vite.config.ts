import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "..", "");
  const allowedHosts = (env.VITE_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    envDir: "..",
    plugins: [react()],
    server: {
      port: 5173,
      host: "0.0.0.0",
      allowedHosts
    },
    preview: {
      port: 4173,
      host: "0.0.0.0",
      allowedHosts
    }
  };
});
