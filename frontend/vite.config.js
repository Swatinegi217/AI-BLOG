import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // proxy API requests to backend
    },
  },
   define: {
    global: 'window', // required for docx internal use
  },

})
