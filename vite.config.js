import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: { host: '127.0.0.1' },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/katex')) return 'vendor-katex'
          if (id.includes('node_modules/react')) return 'vendor-react'
          if (id.includes('/src/content/')) return 'course-content'
          return undefined
        },
      },
    },
  },
})
