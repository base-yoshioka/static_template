const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: {
      vendor: [
          'scrollmagic'
      ],
      app: './src/js/main.js'
  },
  mode: 'development',
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'dist/assets/js')
  },
  resolve: {
    modules: ['node_modules'],
    alias: {
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
            /node_modules/
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
              ]
            }
          }
        ]
      }
    ]
  },
  optimization: {
    splitChunks: {
        cacheGroups: { 
            vendor: {
                test: /node_modules/,
                name: 'vendor',
                chunks: 'initial',
                enforce: true
            }
        }
      
    }
  },
  devtool: 'source-map',
  plugins: [
    new webpack.ProvidePlugin({
        ScrollMagic: 'scrollmagic'
    })
  ]
};