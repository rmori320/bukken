import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base: './' で相対パス出力にし、どんな静的ホスティング/サブパスでも動くようにする
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
})
