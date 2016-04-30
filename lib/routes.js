'use strict';

var url = require('url'), http = require('http');

// 合法的请求方法
var HTTP_METHOD = [
	'ALL',
	'GET',
	'POST',
	'PUT',
	'DELETE',
	'HEAD',
	'OPTIONS'];

module.exports = {
	// 路由规则列表
	_rules: [],
	
	// 添加规则
	add: function(method, url, handle){
		// 验证参数合法性
		if(HTTP_METHOD.indexOf(method) == -1) throw new Error('Invalid request method');
		if('string' != typeof url && url instanceof RegExp) throw new Error('Invalid rule type');
		if('function' != typeof handle && 'string' != typeof handle) throw new Error('Invalid handle type');
		
		this._rules[this._rules.length] = {
			method: method,
			url: url,
			handle: handle
		}
		
		return this;
	},
	
	// 匹配规则
	match: function(req){
		// 检查合法性
		if(!req instanceof http.IncomingMessage) throw Error('Invalid object');
		
		// 解析真实请求地址
		var reqUrl = url.parse(req.url).pathname;
		
		for(var i = 0; i < this._rules.length; i++){
			if('string' == typeof this._rules[i].url){
				if(this._rules[i].url != reqUrl) continue;
			}else{
				if(!this._rules[i].url.test(reqUrl)) continue;
			}
			if(req.method != this._rules[i].method &&
				this._rules[i].method != 'ALL' &&
				(['GET', 'HEAD']).indexOf(req.method) == -1) continue;
			return this._rules[i];
		}
		
		return false;
	},
	
	// 简化方法
	all: function(url, handle){
		return this.add('ALL', url, handle);
	},
	
	get: function(url, handle){
		return this.add('GET', url, handle);
	},
	
	post: function(url, handle){
		return this.add('POST', url, handle);
	}
}