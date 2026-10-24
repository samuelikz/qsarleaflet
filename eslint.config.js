import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import pluginQuasar from '@quasar/app-vite/eslint'

export default [
  ...pluginQuasar.configs.recommended(),
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node, // config files
        process: 'readonly' // process.env.*
      }
    },

    rules: {
      'prefer-promise-reject-errors': 'off',
      'vue/multi-word-component-names': 'off',

      // allow debugger during development only
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    }
  }
]
