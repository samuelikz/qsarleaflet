// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app'

export default defineConfig((/* ctx */) => {
  return {
    boot: [],

    css: [
      'app.css'
    ],

    extras: [
      'roboto-font', // optional, you are not bound to it
      'material-icons' // optional, you are not bound to it
    ],

    build: {
      vueRouterMode: 'hash', // available values: 'hash', 'history'

      vitePlugins: [
        ['vite-plugin-checker', {
          eslint: {
            lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
            useFlatConfig: true
          }
        }, { server: false }]
      ]
    },

    devServer: {
      port: 8080,
      open: true // opens browser window automatically
    },

    framework: {
      config: {},
      iconSet: 'material-icons', // Quasar icon set
      lang: 'pt-BR', // Quasar language pack
      plugins: []
    },

    animations: []
  }
})
