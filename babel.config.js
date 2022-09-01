module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    'power-assert'
  ],
  plugins: ['@babel/plugin-proposal-optional-chaining']
}
