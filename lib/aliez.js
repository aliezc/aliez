'use strict';

var routes = require('./routes.js');
var midwares = require('./midware.js');
var config = require('./config.js');
var response = require('./response.js');
var EventEmitter = require('events');
var static_svr = require('./static.js');

module.exports = function(){
	function aliez(req, res){
		// 此函数将被放到http的request事件中
		var ev = new EventEmitter();
		
		ev.on('error', function(code){
			var handle = config.get('' + code);
			if('function' == typeof handle){
				handle.call(this, req, res);
			}else if('string' == typeof handle){
				res.send(code, {"content-type": "text/html"}, handle);
			}else{
				throw new Error('Invalid error handle type');
			}
		});
		
		res.setTimeout(config.get('timeout'), function(){
			res.status(408);
		});
		
		res.status = function(code){
			if('number' != typeof code) throw new Error('Invalid status code');
			if(code >= 400){
				ev.emit('error', code);
			}
			
			res.statusCode = code;
		};
		
		var getFunc = function(f){
			return function(){
				var code = 200,
					headers = {},
					data = '';
				
				if(arguments.length == 3){
					// code headers data
					if('number' == typeof arguments[0]) code = arguments[0];
					if('object' == typeof arguments[1]) headers = arguments[1];
					if('string' == typeof arguments[2] ||
						arguments[2] instanceof Buffer) data = arguments[2];
				}else if(arguments.length == 2){
					if('object' == typeof arguments[0]) headers = arguments[0];
					if('string' == typeof arguments[1] ||
						arguments[1] instanceof Buffer) data = arguments[1];
				}else if(arguments.length == 1){
					if('string' == typeof arguments[0] ||
						arguments[0] instanceof Buffer) data = arguments[0];
				}
				
				response[f].call(this, req, res, code, headers, data, function(err){
					if(err){
						switch(err.message){
							case 'Invalid argument':
								res.status(500);
								break;
							case 'Read file error':
								res.status(403);
								break;
						}
					}
				});
			};
		}
		res.send = getFunc('send');
		
		res.file = getFunc('sendFile');
		
		res.render = function(view, args){
			if('function' !=typeof config.renderer) throw new Error('Invalid renderer');
			
			config.renderer.call(this, req,  view, args, function(err, data){
				if(err){
					res.status(500);
					return;
				}
				
				res.send(200, {"content-type": "text/html"}, data);
			});
		};
		
		if(config.get('hostname') != ""){
			var hostname = config.get('hostname');
			if(req.headers['host']){
				if(hostname != req.headers['host']){
					res.status(502);
					return;
				}
			}else{
				res.status(502);
				return;
			}
		}
		
		var rule = routes.match(req);
		if(rule){
			midwares.exec(req, res, function(){
				if('string' == typeof rule.handle){
					res.file(rule.handle);
				}else{
					rule.handle.call(this, req, res);
				}
			});
		}else{
			midwares.exec(req, res, function(){
				static_svr.exec(req, res, function(err, file){
					if(err){
						res.status(403);
						return;
					}
					
					if(!file){
						res.status(404);
						return;
					}
				});
			});
		}
	}
	aliez.add = routes.add.bind(routes);
	aliez.get = routes.get.bind(routes);
	aliez.post = routes.post.bind(routes);
	aliez.all = routes.all.bind(routes);
	aliez.use = midwares.add.bind(midwares);
	aliez.dir = static_svr.add.bind(static_svr);
	aliez.config = function(){
		if(arguments.length == 2){
			return config.set.apply(config, arguments) || this;
		}else if(arguments.length == 1){
			return config.get.apply(config, arguments);
		}
		return this;
	}
	
	return aliez;
}