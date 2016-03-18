'use strict';

var url = require('url');

var api = {
	// http请求方法
	HTTP_METHOD : ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH', 'MOVE', 'COPY', 'LINK', 'WRAPPED'],

	// 检查路由规则格式
	chkFormat : function(o){
		if('object' != typeof o) return false;
		if(-1 == api.HTTP_METHOD.indexOf(o.method)) return false;
		if('string' != typeof o.url && o.url instanceof RegExp) return false;
		if('function' != o.handle && 'string' != o.handle) return false;
		return true;
	}
}

// Class:路由规则列表
var RouteList = function(){
	// 继承Array
	Array.call(this);
}

/*
 * 获取匹配的路由规则
 * @param {IncommingMessage} 请求对象，http.IncommingMessage
 * @returns {object or false} 匹配到的规则，如果没有则为false
 */
RouteList.prototype.match = function(req){
	if(req instanceof IncommingMessage) return false;
	var u = url.parse(req.url), rule;
	for(var i = 0; i < this.length; i++){
		rule = this[i];

		// 匹配请求方法
		if(rule.method != req.method) continue;

		// 匹配请求地址
		if('string' == typeof rule.url){
			// 转换成正则表达式
			var str = rule.url.replace('/', '\/');
			str = str.replace('.', '\.');
			str = str.replace(/\@[a-zA-Z0-9_-]/, '[a-zA-Z0-9%_-]*');
			str = '^' + str + '$';
			var reg = new RegExp(str);
			
			if(reg.test(u.pathname)) return rule;
		}else if(rule.url instanceof RegExp){
			if(rule.url.test(u.pathname)) return rule;
		}else{
			return false;
		}
	}
}
