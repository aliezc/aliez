'use strict';

var EventEmitter = require('events'), http = require('http');

module.exports = {
	// 中间件函数列表
	_mids: [],
	
	// 添加
	add: function(f){
		if('function' != typeof f) throw new Error('Invalid midware type');
		
		this._mids[this._mids.length] = f;
	},
	
	// 执行中间件
	exec: function(req, res, cb){
		if(!req instanceof http.IncomingMessage || !res instanceof http.ServerResponse) throw new Error('Invalid arguments');
		if('function' != typeof cb) throw new Error('Invalid callback function');
		
		var e = new EventEmitter(),
			count = 0,
			mids = this._mids;
		
		e.on('done', function(){
			count++;
			if(count == mids.length){
				e.emit('finish');
			}
		}).on('finish', cb);
		
		if(mids.length == 0){
			if('function' == typeof cb) cb.call(this);
		}
		for(var i = 0; i < mids.length; i++){
			mids[i].call(this, req, res, function(){
				e.emit('done');
			});
		}
	}
}