'use strict';

/*
 * 获取url的参数
 * @param {string} 请求的地址，不带query参数
 * @param {string} 模板规则，如：/tag/@tag/page/@page
 * @returns {object} 参数值，如：{tag: 'abc', page: '1'}
 */
var getReqParams = function(url, rule){
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

// exports
module.exports.getReqParams = getReqParams;
