'use strict';

var zlib = require('zlib'), next = require('next2');

var getReqParams, sendData, getRange, encoding;

/*
 * 获取url的参数
 * @param {string} 请求的地址，不带query参数
 * @param {string} 模板规则，如：/tag/@tag/page/@page
 * @returns {object} 参数值，如：{tag: 'abc', page: '1'}
 */
getReqParams = function(url, rule){
	if('string' == typeof url && 'string' == typeof rule){
		var arglist = rule.match(/(\@[a-zA-Z0-9_-]*)/g);
		var list = [];
		for(var i = 0; i < arglist.length; i++){
			list.push(arglist[i].slice(1));
		}
		var str = rule.replace(/\@[a-zA-Z0-9_-]*/g, '([a-zA-Z0-9%_-]*)');
		str = str.replace('.', '\.');
		str = str.replace('/', '\/');
		str = '^' + str + '$';
		var reg = new RegExp(str);
		var result = {};
		var tmp = url.match(reg);
		if(tmp.length == list.length + 1){
			for(var i = 0; i < list.length; i++){
				result[list[i]] = tmp[i + 1];
			}
			return result;
		}else{
			return false;
		}
	}else{
		return false;
	}
}

/*
 * 发送数据
 * @param {IncommingMessage} 请求信息
 * @param {ServerResponse} 响应对象
 * @param {string or Buffer} 要发送的内容
 * @param {function} 发送完成的回调函数
 */
sendData = function(req, res, data, cb){
	if(!(req instanceof IncommingMessage)) throw new Error('request object illegal');
	if(!(res instanceof ServerResponse)) throw new Error('reponse object illegal');
	if('string' != typeof data && !(data instanceof Buffer)) throw new Error('data illegal');
	var headers = req.headers, range, buf, ne = new next();
	if(headers['range']){
		range = getRange(headers['range']);
		buf = data.slice(range.start, range.end);
	}else{
		buf = data;
	}
	if(headers['accept-encoding']){
		if(-1 != headers['accept-encoding'].indexOf('gzip')){
			res.setHeader('content-encoding', 'gzip');
			ne.next(function(){
				encoding('gzip', buf, function(){
					ne.done.apply(this, arguments);
				});
			});
		}else if(-1 != headers['accept-encoding'].indexOf('deflate')){
			res.setHeader('content-encoding', 'deflate');
			ne.next(function(){
				encoding('deflate', buf, function(){
					ne.done.apply(this, arguments);
				});
			});
		}
	}else{
		// to be continue................................................................
	}
}

/*
 * 获取range范围
 * @param {string} Range字符串
 * @param {number} 数据最大值
 * @returns {object} 范围对象
 */
getRange = function(str, max){
	var arr = str.split('-');
	var start, end, res;
	if(arr[0] == ''){
		start = 0;
	}else{
		start = +arr[0];
	}
	if(arr[1] == ''){
		end = max;
	}else{
		end = +arr[1];
	}
	return {start: start, end: end};
}

/*
 * 压缩数据
 * @param {string} 压缩算法，gzip或defalte
 * @param {string or Buffer} 要压缩的内容
 * @param {function} 执行完成后的回调函数
 */
encoding = function(zip, data, cb){
	if(zip == 'gzip' || zip == 'deflate'){
		zlib[zip].call(null, data, cb);
	}else{
		if('function' == typeof cb){
			cb.call(null, new Error('unknown encoding type'));
		}
	}
}

// exports
module.exports.getReqParams = getReqParams;
