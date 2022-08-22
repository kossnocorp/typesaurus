module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript'
  ],
  plugins: [
    [
      '@babel/plugin-transform-modules-commonjs',
      { importInterop: 'node', loose: true, strict: true }
    ],
    ['babel-plugin-add-import-extension', { extension: process.env.TARGET }]
  ],
  ignore: [
    'src/**/*.d.ts',
    'src/**/tests.ts',
    'src/tests/**/*',
    'src/**/tysts.ts'
  ]
}
