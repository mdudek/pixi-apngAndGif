const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NpmDtsPlugin = require('npm-dts-webpack-plugin');

module.exports = (env, options) => {
    const minify = !!env.minify;
    const isLibrary = !!env.library;
    return {
        entry: isLibrary ? {
            pixiApngAndGif: './src/pixiApngAndGif.ts'
        } :  {
            demo: './src/demo/demo.ts'
        },
        output: {
            path: path.resolve(__dirname, `dist${isLibrary ? '': '/demo'}`),
            filename: '[name].js',
            assetModuleFilename: 'img/[name][ext][query]',
            clean: isLibrary,
            ...(isLibrary ? {library: {
                name: 'pixiApngAndGif',
                type: 'commonjs2',
            }} : {}),
        },
        optimization: {
            chunkIds: 'named',
            //concatenateModules: false, // use for detailed bundle analyze
            // splitChunks: {
            //     chunks: 'all',
            //     cacheGroups: {
            //         vendor: {
            //             test: /[\\/]node_modules[\\/]/,
            //             chunks: 'all',
            //             name: 'vendors',
            //         },
            //         shared: {
            //             test: /[\\/]_shared[\\/]/,
            //             chunks: 'all',
            //             name: 'shared',
            //         },
            //     },
            // },
            minimize: minify,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        mangle: true, // Note `mangle.properties` is `false` by default.
                    },
                    extractComments: false
                }),
                new CssMinimizerPlugin(),
            ],
        },
        devtool: 'source-map',
        devServer: {
            compress: true,
            port: 9000,
        },
        module: {
            rules: [
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: 'html-loader', // replace img urls
                        }
                    ],
                },
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    type: 'asset/resource'
                }
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        plugins: [
            ...(isLibrary ? [
                new NpmDtsPlugin({
                    entry: 'src/pixiApngAndGif.ts'
                })
            ] : [new HtmlWebpackPlugin({
                template: 'src/demo/index.html',
                filename: 'index.html',
                chunks: ['demo'],
                chunksSortMode: 'manual',
                minify: minify
            })]),
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: 'css/[name].[contenthash].css',
                chunkFilename: 'css/[id].[contenthash].css',
            }),

            // new BundleAnalyzerPlugin()
        ],
        ...(isLibrary ? {externals: /^(@pixi\/.*)/i} : {}),
    };
};
