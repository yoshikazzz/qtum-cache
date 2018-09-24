const path = require('path');
module.exports = {
  entry: './src/client/index.tsx',
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, 'built/src/public/js'),
    publicPath: '/',
  },
  devtool: process.env.NODE_ENV === 'production' ? '' : 'source-map',
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  devServer: {
    contentBase: 'public',
    historyApiFallback: true,
    port: 3003,
    hot: true,
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "awesome-typescript-loader"
      },
      {
        test: /\.css$/,
        use: [
          {
              loader: 'style-loader',
          },
          {
              loader: 'css-loader',
          }
        ],
      },
      {
        test: /\.scss$/,
        use: [{
            loader: "style-loader"
        }, {
            loader: "css-loader"
        }, {
            loader: "sass-loader",
            options: {
                includePaths: path.resolve(__dirname, 'src'),
            }
        }]
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        //include: path.resolve(__dirname, 'src'),
        use: {
          loader: 'file-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        //include: path.resolve(__dirname, 'src'),
        use: {
          loader: 'file-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        //include: path.resolve(__dirname, 'src'),
        use: {
          loader: 'file-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream',
          },
        },
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
       // include: path.resolve(__dirname, 'src'),
        use: 'file-loader',
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        //include: path.resolve(__dirname, 'src'),
        use: {
          loader: 'file-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml',
          },
        },
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
       // include: path.resolve(__dirname, 'src'),
        use: 'file-loader',
      },
    ]
  },
};
