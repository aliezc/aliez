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
	},

	// 转换地址为正则表达式
	convertRegExp : function(str){
		var str = str.replace('/', '\/');
		str = str.replace('.', '\.');
		str = str.replace(/\@[a-zA-Z0-9_-]*/g, '[a-zA-Z0-9%_-]*');
		str = '^' + str + '$';
		return new RegExp(str);
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
			var reg = api.convertRegExp(rule.url);

			if(reg.test(escape(u.pathname))) return rule;
		}else if(rule.url instanceof RegExp){
			if(rule.url.test(u.pathname)) return rule;
		}else{
			return false;
		}
	}
}

/*
 * 添加路由规则
 * @param {string} 请求方法
 * @param {string or RegExp} 地址，字符串或正则表达式
 * @param {string or function} 处理方法，回调函数或者文件地址
 * @returns this
 */
RouteList.prototype.add = function (method, url, handle) {
	var obj = {
		method: method,
		url: url,
		handle: handle
	};
	if(api.chkFormat(obj)){
		this.push(obj);
	}
	return this;
};

/*
 * 添加get规则
 * @param {string or RegExp} 地址，字符串或正则表达式
 * @param {string or function} 处理方法，回调函数或者文件地址
 * @returns this
 */
RouteList.prototype.get = function (url, handle) {
	var obj = {
		method: 'GET',
		url: url,
		handle: handle
	};
	if(api.chkFormat(obj)){
		this.push(obj);
	}
	return this;
};

/*
 * 添加post规则
 * @param {string or RegExp} 地址，字符串或正则表达式
 * @param {string or function} 处理方法，回调函数或者文件地址
 * @returns this
 */
RouteList.prototype.post = function (url, handle) {
	var obj = {
		method: 'POST',
		url: url,
		handle: handle
	};
	if(api.chkFormat(obj)){
		this.push(obj);
	}
	return this;
};

/*
 * 添加put规则
 * @param {string or RegExp} 地址，字符串或正则表达式
 * @param {string or function} 处理方法，回调函数或者文件地址
 * @returns this
 */
RouteList.prototype.put = function (url, handle) {
	var obj = {
		method: 'PUT',
		url: url,
		handle: handle
	};
	if(api.chkFormat(obj)){
		this.push(obj);
	}
	return this;
};

/*
 * 添加delete规则
 * @param {string or RegExp} 地址，字符串或正则表达式
 * @param {string or function} 处理方法，回调函数或者文件地址
 * @returns this
 */
RouteList.prototype.delete = function (url, handle) {
	var obj = {
		method: 'DELETE',
		url: url,
		handle: handle
	};
	if(api.chkFormat(obj)){
		this.push(obj);
	}
	return this;
};
