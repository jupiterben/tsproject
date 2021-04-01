const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const extensions = ['.js', '.ts'];

const babelOptions = {
    presets: [
        ['@babel/preset-env', {
            modules: false,
        }],
    ],
    plugins: [
        ['@babel/plugin-proposal-decorators', {
            legacy: true,
        }],
        '@babel/plugin-proposal-function-sent',
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-proposal-numeric-separator',
        '@babel/plugin-proposal-throw-expressions',
        ['@babel/plugin-proposal-class-properties', {
            loose: false,
        }],
        '@babel/plugin-syntax-dynamic-import',
    ],
};

module.exports = function (env, argv) {
    const IS_DEV = argv.mode !== 'production';
    env = env || {};
    const { PACKAGE } = env;

    const config = {
        entry: path.resolve(__dirname, './src/index.ts'),
        output: {
            path: path.resolve(__dirname, './dist'),
            filename: 'index.umd.js',
            library: 'MyLib',
            libraryTarget: 'umd',
        },
        module: {
            rules: [{
                test: /\.js$/,
                loader: 'babel-loader',
                include: [
                    path.resolve(__dirname),
                ],
                options: babelOptions,
            },
            {
                test: /\.ts$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        ...babelOptions,
                    },
                }, {
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig.json',
                        transpileOnly: true,
                    },
                }],
            },
            ],
        },
        resolve: {
            extensions,
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify(IS_DEV ? 'development' : 'production'),
                },
            }),
            new CaseSensitivePathsPlugin(),
        ],
        node: {
            fs: 'empty',
        },
    };

    if (!PACKAGE) {
        config.devtool = 'source-map';
        config.optimization = {
            minimize: false,
        };
    } else {
        config.optimization = {
            minimizer: [
                new UglifyJsPlugin({
                    parallel: true,
                    uglifyOptions: {
                        compress: {
                            drop_console: false,
                        },
                        mangle: {
                            reserved: ['$', 'exports', 'require'],
                        },
                        output: {
                            ascii_only: true,
                        },
                        keep_fnames: true,
                    },
                }),
            ],
        };
    }
    if (!IS_DEV) {
        config.plugins = config.plugins.concat([
            new CleanWebpackPlugin(),
            new CopyPlugin([{
                from: 'src/ThirdParty/**/*.wasm',
                flatten: true,
            }]),
        ]);
    }

    if (env.analyze) {
        config.plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: 'static',
        }));
    }

    return config;
};
