import process from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: Number(process.env.PORT || 5174),
    proxy: {
      "/api": `http://localhost:${process.env.VITE_BACKEND_PORT || 5000}`,
    },
  },
});
