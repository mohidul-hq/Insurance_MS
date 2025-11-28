import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// For GitHub Pages deployment, set base to the repository name so assets resolve correctly.
// Repo: https://github.com/mohidul-hq/Insurance_MS
export default defineConfig({
  base: '/Insurance_MS/',
  plugins: [react()],
})
