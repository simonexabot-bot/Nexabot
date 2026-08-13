module.exports = [
  {
    ignores: ['node_modules/**'],
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2024, sourceType: 'commonjs', globals: { console: 'readonly', process: 'readonly', Buffer: 'readonly', fetch: 'readonly', URL: 'readonly', AbortController: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly', clearInterval: 'readonly', module: 'readonly', require: 'readonly', __dirname: 'readonly' } },
    rules: { 'no-undef': 'error', 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], 'no-constant-condition': 'off' }
  },
  {
    files: ['*.js'],
    ignores: ['server.js', 'worker.js', 'eslint.config.js'],
    languageOptions: { sourceType: 'module', globals: { window: 'readonly', document: 'readonly', location: 'readonly', history: 'readonly', navigator: 'readonly', localStorage: 'readonly', load: 'readonly', crypto: 'readonly', ethereum: 'readonly', WebSocket: 'readonly', Intl: 'readonly', Blob: 'readonly', URL: 'readonly', FormData: 'readonly', fetch: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly', confirm: 'readonly', prompt: 'readonly', alert: 'readonly', scrollTo: 'readonly' } }
  },
  { files: ['src/**/*.js', 'test/**/*.js', 'bot/**/*.js'], languageOptions: { sourceType: 'commonjs' } }
];
