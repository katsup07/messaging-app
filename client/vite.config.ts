import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isDockerEnvironment= process.env.DOCKER_ENVIRONMENT === 'true';
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // only used for docker container in development
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: isDockerEnvironment,
      interval: 1000,
    }
  }
})
