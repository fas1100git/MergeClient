const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const preprocessor = {
    loader: 'webpack-preprocessor-loader',
    options: {
        debug: true,
        directives: {
            secret: false,
        },
        params: {
            target: 'debug',    // debug, releace
            platform: 'none',   // none, yandex, inplay
        },
        verbose: false,
    },
};

module.exports = {

    entry: './src/Main.ts',
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'dst'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: [".ts", ".js"],
        //fallback: {
        //    fs: false,
        //    path: false
        //},
        /* alias: { '@pixi': 'pixi.js/node_modules/@pixi' }*/
    },
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
            { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            sources: false
                        }
                    },
                    preprocessor
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },

            { test: /\.ts$/, use: [preprocessor] },
        ]
    },

    plugins: [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            title: 'webpack.config.js',
            template: path.resolve(__dirname, './src/index.html'), // шаблон
            filename: 'index.html', // название выходного файла
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/image/**/*', // путь к исходным изображениям
                    to: 'image/[name][ext]', // путь в выходной директории
                }
            ]
        })
    ],

    watchOptions: {

        // Директории, которые watch будет игнорировать
        ignored: ['node_modules/']
    },

    devServer: {

        // Здесь указывается вся статика, которая будет на нашем сервере
        static: {
            directory: path.join(__dirname, 'dst'),
        },

        // Сжимать ли бандл при компиляции📦
        compress: false,

        host: '0.0.0.0',

        // Порт на котором будет наш сервер
        port: 8080,

        /*disableHostCheck: true,*/
    }
};