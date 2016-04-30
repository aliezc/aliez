'use strict';

var http = require('http'),
	url = require('url'),
	path = require('path'),
	config = require('./config.js'),
	fs = require('fs');

module.exports = {
	
	// 静态服务器映射表
	_dirs: [],
	
	/*
	 * @param {string} dir in local
	 * @param {string} path filter in request
	 */
	add: function(dir, path){
		if('string' != typeof dir || 'string' != typeof path) throw new Error('Invalide argument');
		
		this._dirs[this._dirs.length] = {
			dir: dir,
			path: path
		};
		
		return this;
	},
	
	// 执行静态服务器方法，此方法在执行完所有路由规则之后没有匹配的路由才触发，优先度最低
	exec: function(req, res, cb){
		if(!req instanceof http.IncomingMessage || !res instanceof http.ServerResponse)
			throw new Error('Invalid argument');
			
		var urlobj = url.parse(req.url);
		for(var i = 0; i < this._dirs.length; i++){
			var str = this._dirs[i].path.replace('/', '\/');
			str += str.slice(-1) == '/' ? '' : '\/';
			var reg = new RegExp('^' + str);
			if(reg.test(urlobj.pathname)){
				str += '(.*)';
				var path_reg = new RegExp('^' + str);
				var path_str = url.parse(req.url).pathname.match(path_reg)[1];
				var local_str = path.join(this._dirs[i].dir, path_str);// console.log(url.parse(req.url).pathname);
				
				// 判断是否是文件夹
				var task = {
					start: function(){
						fs.stat(local_str, task.checkdir);
					},
					checkdir: function(err, stat){
						if(err){
							res.status(404);
							if('function' == typeof cb) cb.call(this, new Error('Get file stat error'));
							return;
						}
						
						if(stat.isFile()){
							res.file(local_str);
						}else{
							var func = function(index){
								var def_list = config.get('default_document');
								if(index < def_list.length){
									var def_doc = path.join(local_str, def_list[index]);
									fs.stat(def_doc, function(err, st){
										if(err){
											func.call(this, index++);
											return;
										}
										
										if(st.isFile()){
											res.file(def_doc);
											if('function' == typeof cb) cb.call(this, null, def_doc);
										}else{
											func.call(this, index++);
										}
									});
								}else{
									if('function' == typeof cb) cb.call(this, new Error('File not found'));
								}
							};
							
							func.call(this, 0);
						}
					}
				};
				
				task.start.call(this);
			}
		}
	}
}