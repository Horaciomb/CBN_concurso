import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// command === 'serve' en dev, 'build' en producción
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // '/' en dev para que funcione en localhost, '/raspadita_mundial/' en build
  base: command === 'build' ? '/raspadita_mundial/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
