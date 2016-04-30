'use strict';

var fs = require('fs');

/*
 * 基本html渲染器
 * @param req
 * @param view
 * @param arguments
 * @param callback(err, result)
 */
module.exports = function(req, view, args, cb){
	fs.readFile(view, function(err, buf){
		if(err){
			// 直接报错跳走
			if('function' == typeof cb) cb.call(this, new Error('can not read file'), null);
		}
		
		var str = buf.toString();
		
		for(var i in args){
			str = str.replace(new RegExp('\$\{' + i + '\}', 'gm'), args[i]);
		}
		
		if('function' == typeof cb) cb.call(this, null, new Buffer(str));
	});
}