import { fileURLToPath } from 'node:url'
import { defineConfig, type UserConfig } from 'vite'

const page: (path: string) => string = (path: string): string => fileURLToPath(new URL(path, import.meta.url))

const config: UserConfig = defineConfig({
  base: '/RatioCalc/',
  build: {
    rolldownOptions: {
      input: {
        main: page('./index.html'),
        imprint: page('./imprint/index.html'),
        privacy: page('./privacy/index.html'),
      },
    },
  },
})

export default config
