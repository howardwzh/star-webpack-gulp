var debug = false;
// var debug = process.env.NODE_ENV !== 'production';
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

function isExternal(module) {
	var userRequest = module.userRequest;

	if (typeof userRequest !== 'string') {
		return false;
	}

	return userRequest.indexOf('bower_components') >= 0 ||
		userRequest.indexOf('node_modules') >= 0 ||
		userRequest.indexOf('libraries') >= 0;
}

module.exports = {
	context: __dirname,
	devtool: debug ? 'inline-sourcemap' : null,
	entry: {
		'app': './src/app/app.js',
		'app-2': './src/app/app-2.js'
	},
	output: {
		path: __dirname + '/public/',
		filename: '[name]-[chunkhash].js',
		// publicPath: 'http://cdn.howard.com', // cdn时可设置
		chunkFilename: '[name]-[chunkhash:8].js'
	},
	module: {
		preLoaders: [
			// {
			// 	test: /\.js$/,
			// 	loader: 'string-replace-loader',// 替换文件中相应字符串，支持正则匹配
			// 	query: {
			// 		search: '\\/\\*\\s*prod remove start\\s*\\*\\/(\\s*.*\\s)*\\/\\*\\s*prod remove end\\s*\\*\\/',
			// 		replace: '',
			// 		flags: 'g'
			// 	}
			// }, 
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'eslint'
			}
		],
		loaders: [{
				test: /\.js$/,
				exclude: /node_modules/,
				loaders: ['ng-annotate', 'babel?presets[]=es2015']
			}, {
				test: /\.css$/,
				loader: ExtractTextPlugin.extract('style', 'css!postcss')
			}, {
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract('style', 'css!sass!postcss')
			},
			// {
			// 	test: /\.(png|jpg)$/,
			// 	loader: 'url-loader?limit=10000' //必须是相对路径
			// }, 
			{
				test: /\.html$/,
				loader: 'html'
			}
		]
	},
	postcss: function() {
		return [
			require('autoprefixer')({ /* ...options */ })
		];
	},
	resolve: {
		modulesDirectories: ['node_modules'],
		extensions: ['', '.js']
	},
	devServer: {
		// port: 8080, // 在命令行中可以设置: --port=8080
		contentBase: './public', //本地服务器所加载的页面所在的目录
		colors: true, //终端中输出结果为彩色
		historyApiFallback: true, //不跳转
		inline: true //实时刷新
	},
	plugins: debug ? [] : [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			// mangle: false,
			sourceMap: false,
			//忽略不必要的警告
			compress: {
				warnings: false
			}
		}),
		new ExtractTextPlugin('[name].[contenthash].css'), //提取样式生成文件
		new webpack.optimize.CommonsChunkPlugin({
			filename: 'commons.[chunkhash].js',
			name: 'commons',
			chunks: ['app', 'app-2']
		}),
		new webpack.optimize.CommonsChunkPlugin({
			filename: 'vendors.js',
			name: 'vendors',
			chunks: ['commons'],
			minChunks: function(module) {
				return isExternal(module);
			}
		}),
		new HtmlWebpackPlugin({
			chunks: ['vendors', 'commons', 'app'],
			filename: 'index.html',
			template: './src/index.html',
			chunksSortMode: 'dependency'
		}),
		new HtmlWebpackPlugin({
			chunks: ['vendors', 'commons', 'app-2'],
			filename: 'index-2.html',
			template: './src/index-2.html',
			chunksSortMode: 'dependency'
		}),
		/*
		 * Plugin: CopyWebpackPlugin
		 * Description: Copy files and directories in webpack.
		 *
		 * Copies project static assets.
		 *
		 * See: https://www.npmjs.com/package/copy-webpack-plugin
		 */
		new CopyWebpackPlugin([{
			from: './src/assets',
			to: 'assets'
		}], {
			ignore: [
				'humans.txt',
				'robots.txt'
			]
		}),

		new CleanWebpackPlugin(['public'], {
			root: __dirname,
			verbose: true,
			dry: false,
			exclude: []
		})
	],
	// cdn资源
	externals: {
		// 'angular-ui-router': 'window'
		jquery: 'jQuery'
	}
}