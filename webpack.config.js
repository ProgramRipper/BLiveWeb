"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const webpack_1 = require("webpack");
const meta_json_1 = __importDefault(require("./src/meta.json"));
const banner = `
// ==UserScript==
${Object.entries(meta_json_1.default)
    .map(([key, value]) => {
    if (Array.isArray(value)) {
        return [
            ...new Set(value.map((item) => `// @${key.padEnd(16, ' ')}${item}`))
        ].join('\n');
    }
    return `// @${key.padEnd(16, ' ')}${value}`;
})
    .join('\n')}
// ==/UserScript==
/* eslint-disable */ /* spell-checker: disable */
// @[ You can find all source codes in GitHub repo ]
`;
const config = {
    entry: './src/index.ts',
    output: {
        filename: 'bilibili-live-game-web.user.js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    optimization: {
        minimizer: [
            new terser_webpack_plugin_1.default({
                terserOptions: {
                    output: {
                        comments: /==\/?UserScript==|^[ ]?@|eslint-disable|spell-checker/i
                    }
                },
                extractComments: false
            })
        ]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader'
                },
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack_1.BannerPlugin({
            banner,
            raw: true,
            entryOnly: true
        })
    ]
};
exports.default = config;
