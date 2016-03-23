'use strict';

var RouteList = require('./route.js'),
	http = require('http'),
	calls = require('callback2'),
	N = require('next2'),
	utils = require('./aliez_utils.js'),
	path = require('path');

/*
 * 主类
 */
var Aliez = function(){
	// 路由规则列表
	this.rules = new RouteList();
	
	// 中间件列表
	this.midwares = [];
	
	// 域名列表
	this.host = [];
	
	// 静态地址列表
	this.static_list = [];
	
	// 配置信息
	this.config = {
		// 打印请求日志
		printLog: true,
		
		// 外部日志文件
		logFile: null
	};
}

/*
 * 添加域名，可链式调用和多个参数调用
 * @param {string} 域名，如：www.abc.com
 * @returns this
 */
Aliez.prototype.addhost = function(){
	for(var i = 0; i < arguments.length; i++){
		if('string' == typeof arguments[i]){
			this.host.push(arguments[i]);
		}
	}
	return this;
}

/*
 * 添加静态路径
 * @param {string} 路径，建议使用绝对路径
 * @returns this
 */
Aliez.prototype.static = function(){
	for(var i = 0; i < arguments.length; i++){
		if('string' == typeof arguments[i]){
			this.static_list.push(arguments[i]);
		}
	}
	return this;
}

/*
 * 添加中间件
 * @param {function} 中间件函数，传递3个参数，req, res, done
 * @returns this
 */
Aliez.prototype.use = function(){
	for(var i = 0; i < arguments.length; i++){
		if('function' == typeof arguments[i]){
			this.host.push(arguments[i]);
		}
	}
	return this;
}

/*
 * 开始监听服务器
 * @param {number} 端口
 */
Aliez.prototype.listen = function(port){
	port = 'number' == typeof port ? port : 8000;
	var rules = this.rules,
		midwares = this.midwares,
		host = this.host;
	
	http.createServer(function(req, res){
		var hostname = req.headers.host || '';
		if(host.length == 0 || host.indexOf(hostname) != -1){
			var rule = rules.match(req);
			if(rule){
				var cs = calls(req, res);
				for(var i = 0; i < midwares.length; i++){
					cs.add(midwares[i]);
				}
				cs.final(function(){
					// 完成所有中间件
					if('string' == typeof rule.handle){
						
					}
				});
			}else{
				// 404
			}
		}else{
			// 不在域名列表里
		}
	}).listen(port);
}