import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "..", "");
  const allowedHosts = (env.VITE_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  // Generate build version: DDMMYY-HHMM
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const buildVersion = `${day}${month}${year}-${hours}${minutes}`;

  return {
    envDir: "..",
    plugins: [react()],
    define: {
      __BUILD_VERSION__: JSON.stringify(buildVersion)
    },
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
