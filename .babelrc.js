// const editorJsx = require('./babel-plugin-transform-typex-jsx.js')
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ]
}
