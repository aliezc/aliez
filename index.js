'use strict';

var http = require('http'),
	fs = require('fs'),
	zlib = require('zlib'),
	path = require('path'),
	url = require('url'),
	EventEmitter = require('event');
	
var Aliez, api;

api = {
	matchRoute : function(req, routes){
		var requrl = url.parse(req.url).pathname;
		for(var i = 0; i < routes.length; i++){
			var info = routes[i];
			if(req.method != info.method) continue;
			if('string' == info.url){
				if(info.url == requrl) return routes[i];
			}else if(info.url instanceof RegExp){
				if(info.url.test(requrl)) return routes[i];
			}
		}
		return false;
	},
	
	handleRequest : function(req, res, rule){
		if('string' == typeof rule.handle){
			
		}
	},
	
	parseRange : function(str){
		var arr = str.split('-');
		var res = {};
		res.start = arr[0] == '' ? 0 : +arr[0];
		if(arr[1] != '') res.end = +arr[1];
		return res;
	}
	
	sendFile : function(req, res, file){
		var code = 200, headers, range, frs;
		if(req.headers['range']){
			range = api.parseRange(req.headers['range']);
			code = 206;
			frs = fs.createReadStream(file, range);
		}
	}
};

Aliez = function(){
	// 域名
	this.hostname = [];
	
	// 路由规则
	this.routes = [];
	
	// 中间件
	this.midwares = [];
}

Aliez.prototype.add = function(method, url, handle){
	if('string' != typeof method) return false;
	if('string' != typeof url && !(url instanceof RegExp)) return false;
	if('function' != typeof handle && 'string' != typeof handle) return false;
	var obj = {
		method: method.toUpperCase(),
		url: url,
		handle: handle
	};
	this.routes.push(obj);
	return this;
}

Aliez.prototype.use = function(fun){
	if('function' != typeof fun) return false;
	this.midwares.push(fun);
	return this;
}

Aliez.prototype.host = function(s){
	if('string' != typeof s) return false;
	this.hostname.push(s);
	return this;
}

Aliez.prototype.listen = function(port){
	port = 'number' == typeof port ? port : 8080;
	var server,
		midwares = this.midwares,
		hostname = this.hostname,
		routes = this.routes;
	server = http.createServer(function(req, res){
		if(var rule = api.matchRoute(req, routes)){
			var es = new EventEmitter();
			var count = 0;
			es.on('done', function(){
				count++;
				if(count == midwares.length){
					api.handleRequest.call(server, req, res, rule);
				}
			});
			for(var i = 0; i < midwares.length; i++){
				process.nextTick(function(){
					midwares[i].call(server, req, res, function(){
						es.emit('done');
					});
				});
			}
		}else{
			
		}
	});
	server.listen(port);
}
