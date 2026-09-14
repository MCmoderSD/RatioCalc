import { defineConfig, type UserConfig } from 'vite'

const config: UserConfig = defineConfig({
  base: '/RatioCalc/',
  build: {
    rolldownOptions: {
      input: {
        main: 'index.html',
        imprint: 'imprint/index.html',
        privacy: 'privacy/index.html'
      }
    }
  }
})

export default config