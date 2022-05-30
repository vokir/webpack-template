const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin')
const fs = require('fs')

function generateHtmlPlugins (templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir))
  return templateFiles.map((item) => {
    const parts = item.split('.')
    const name = parts[0]
    const extension = parts[1]

    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
      minify: false
    })
  })
}
const htmlPlugins = generateHtmlPlugins('./src/pug/pages')

module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production'

  return {
    mode: argv.mode,
    context: path.resolve(__dirname, 'src'),
    entry: {
      index: './js/index.js'
    },
    output: {
      filename: 'js/scripts.min.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      assetModuleFilename: 'assets/[name][ext]'
    },
    devtool: 'source-map',
    target: devMode ? 'web' : 'browserslist',
    devServer: {
      static: './dist',
      hot: true,
      open: true,
      liveReload: true,
      watchFiles: {
        paths: ['src/pug']
      }
    },
    optimization: {
      moduleIds: 'deterministic'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@img': path.resolve(__dirname, 'src/images/')
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.(s[ac]|c)ss$/i,
          use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][ext]'
          }
        },
        {
          test: /\.svg$/i,
          include: /.*_sprite\.svg/,
          use: [
            {
              loader: 'svg-sprite-loader',
              options: {
                publicPath: '/'
              }
            }
          ]
        },
        {
          test: /\.(mp4)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'videos/[name][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext]'
          }
        },
        {
          test: /\.pug$/,
          loader: 'pug-loader'
        }
      ]
    },
    plugins: [
      new ESLintPlugin(),
      new MiniCssExtractPlugin({
        filename: devMode ? '[name].[contenthash].css' : '[name].css'
      }),
      new SpriteLoaderPlugin({
        plainSprite: true
      })
    ].concat(htmlPlugins)
  }
}
