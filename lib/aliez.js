'use strict';

var RouteList = require('./route.js'),
	http = require('http'),
	calls = require('callback2'),
	N = require('next2'),
	utils = require('./alize_utils.js'),
	path = require('path');

/*
 *
 */
var Aliez = function(){
	this.rules = new RouteList();
	this.midwares = [];
	this.host = [];
	this.static_list = [];
	this.config = {
		printLog: true,
		logFile: null
	};
}
Aliez.prototype.addhost = function(){
	for(var i = 0; i < arguments.length; i++){
		if('string' == typeof arguments[i]){
			this.host.push(arguments[i]);
		}
	}
	return this;
}

Aliez.prototype.static = function(s){
	for(var i = 0; i < arguments.length; i++){
		if('string' == typeof arguments[i]){
			var str = arguments[i].replace('/', '\/');
			str = str.replace('.', '\.');
			str = str.replace('\\', '\\\\');
			str = '^' + str;
			this.static_list.push(new RegExp(str));
		}
	}
	return this;
}

Aliez.prototype.use = function(){
	for(var i = 0; i < arguments.length; i++){
		if('function' == typeof arguments[i]){
			this.host.push(arguments[i]);
		}
	}
	return this;
}

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
				});
			}else{
				// 404
			}
		}else{
			// 不在域名列表里
		}
	}).listen(port);
}