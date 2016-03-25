'use strict';

var http = require('http'),
	fs = require('fs'),
	zlib = require('zlib'),
	path = require('path'),
	url = require('url'),
	EventEmitter = require('events');
	
var Aliez, api;

api = {
	/*
	 * 匹配路由规则
	 * @param {IncommingMessage} 请求对象
	 * @param {Array} 路由规则列表
	 * @returns 匹配到的规则，如果没有返回false
	 */
	matchRoute : function(req, routes){
		// 获取实际请求路径
		var requrl = url.parse(req.url).pathname;
		
		for(var i = 0; i < routes.length; i++){
			var info = routes[i];
			// 匹配请求方法
			if(req.method != info.method) continue;
			
			// 匹配请求路径
			if('string' == typeof info.url){
				if(info.url == requrl) return info;
			}else{
				if(info.url.test(requrl)) return info;
			}
		}
		return false;
	},
	
	/*
	 * 处理请求
	 * @param {IncommingMessage} 请求对象
	 * @param {ServerResponse} 响应对象
	 * @param {object} 规则对象
	 */
	handleRequest : function(req, res, rule){
		if('string' == typeof rule.handle){
			// 如果是字符串，直接发送文件
			api.sendFile(req, res, rule.handle);
		}else{
			// 给res添加快速发送的方法
			res.send = function(){
				if(arguments.length == 3){
					// 3个参数 code headers content
					res.code = arguments[0];
					res.headers = arguments[1];
					api.send.call(res, req, res, arguments[2]);
				}else if(arguments.length == 2){
					// 2个参数 code content 或者 headers content
					if('number' == typeof arguments[0]){
						res.code = arguments[0];
					}else if('object' == typeof arguments[0]){
						res.headers = arguments[0];
					}
					api.send.call(res, req, res, arguments[1]);
				}else{
					// 1个参数 content
					api.send.call(res, req, res, arguments[0]);
				}
			};
			rule.handle.call(res, req, res);
		}
	},
	
	/*
	 * 识别headers里的range
	 * @param {string} range字符串
	 * @returns {object} 识别出的对象，包含start和end
	 */
	parseRange : function(str){
		var arr = str.split('-');
		var res = {};
		res.start = arr[0] == '' ? 0 : +arr[0];
		if(arr[1] != '') res.end = +arr[1];
		return res;
	},
	
	/*
	 * 发送内容
	 * @param {IncommingMessage} 请求对象
	 * @param {ServerResponse} 响应对象
	 * @param {string or Buffer} 要发送的内容
	 */
	send : function(req, res, data){
		var code = res.code || 200,
			headers = res.headers || {},
			range,
			buf,
			zip;
		
		// 检查是否是断点续传
		if(req.headers['range']){
			range = api.parseRange(req.headers['range']);
			code = 206;
			buf = range.end ? data.slice(range.start, range.end) : data.slice(range.start);
		}
		
		buf = data instanceof Buffer ? data : new Buffer(data);
		
		// 压缩
		if(req.headers['accept-encoding']){
			if(req.headers['accept-encoding'].indexOf('gzip') != -1){
				zip = zlib.gzip;
				headers['content-encoding'] = 'gzip';
			}else if(req.headers['accept-encoding'].indexOf('deflate') != -1){
				zip = zlib.deflate;
				headers['content-encoding'] = 'deflate';
			}
		}
		
		headers['date'] = new Date().toLocaleString();
		headers['server'] = 'Aliez 0.1.0';
		res.writeHead(code, headers);
		
		if(zip){
			zip(buf, function(err, result){
				if(err) throw err;
				res.end(result);
			});
		}else{
			res.end(buf);
		}
	},
	
	/*
	 * 发送文件
	 * @param {IncommingMessage} 请求对象
	 * @param {ServerResponse} 响应对象
	 * @param {string or Buffer} 要发送的文件
	 */
	sendFile : function(req, res, file){
		var code = res.code || 200,
			headers = res.headers || {},
			range,
			frs,
			zip;
		
		if(req.headers['range']){
			range = api.parseRange(req.headers['range']);
			code = 206;
			frs = fs.createReadStream(file, range);
		}else{
			frs = fs.createReadStream(file);
		}
		if(req.headers['accept-encoding']){
			if(req.headers['accept-encoding'].indexOf('gzip') != -1){
				zip = zip.createGzip();
				headers['content-encoding'] = 'gzip';
			}else if(req.headers['accept-encoding'].indexOf('deflate') != -1){
				zip = zip.createDeflate();
				headers['content-encoding'] = 'deflate';
			}
		}
		
		headers['date'] = new Date().toString();
		headers['server'] = 'Aliez 0.1.0';
		res.writeHead(code, headers);
		
		if(zip){
			frs.pipe(zip).pipe(res);
		}else{
			frs.pipe(res);
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

/*
 * 添加路由规则
 * @param {string} 请求方法，如GET
 * @param {string or RegExp} 请求地址，可以是字符串，也可以是正则表达式
 * @param {function or string} 处理方法，回调函数，如果是字符串，则发送静态文件
 * @returns this
 */
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

/*
 * 添加get方法的规则
 * @param {string or RegExp} 请求地址，可以是字符串，也可以是正则表达式
 * @param {function or string} 处理方法，回调函数，如果是字符串，则发送静态文件
 */
Aliez.prototype.get = function(url, handle){
	return this.add('GET', url, handle);
}

/*
 * 添加post方法的规则
 * @param {string or RegExp} 请求地址，可以是字符串，也可以是正则表达式
 * @param {function or string} 处理方法，回调函数，如果是字符串，则发送静态文件
 */
Aliez.prototype.post = function(url, handle){
	return this.add('POST', url, handle);
}

/*
 * 添加中间件方法
 * @param {function} 中间件处理函数
 * @returns this
 */
Aliez.prototype.use = function(fun){
	if('function' != typeof fun) return false;
	this.midwares.push(fun);
	return this;
}

/*
 * 添加域名
 * @param {string} 域名，如www.example.com
 * @returns this
 */
Aliez.prototype.host = function(s){
	if('string' != typeof s) return false;
	this.hostname.push(s);
	return this;
}

/*
 * 服务器开始监听端口
 * @param {number} 端口号，默认是8080
 */
Aliez.prototype.listen = function(port){
	port = 'number' == typeof port ? port : 8080;
	var server,
		midwares = this.midwares,
		hostname = this.hostname,
		routes = this.routes;
	server = http.createServer(function(req, res){
		var rule = api.matchRoute(req, routes);
		if(rule){
			var es = new EventEmitter();
			var count = 0;
			
			// 执行中间件，执行完后跳到处理方法
			es.on('done', function(){
				count++;
				if(count == midwares.length){
					api.handleRequest.call(server, req, res, rule);
				}
			});
			if(midwares.length > 0){
				for(var i = 0; i < midwares.length; i++){
					midwares[i].call(server, req, res, function(){
						es.emit('done');
					});
				}
			}else{
				api.handleRequest.call(server, req, res, rule);
			}
		}else{
			res.end();
		}
	});
	server.listen(port);
}

module.exports.createServer = function(){
	return new Aliez();
}
