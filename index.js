'use strict';

var http = require('http'),
	assert = require('assert'),
	EventEmitter = require('events');

var midwares = [];
var aliez = function(cb){
	assert('function' == typeof cb, 'Invalid callback');
	return function(req, res){
		assert(req instanceof http.IncomingMessage &&
			res instanceof http.ServerResponse,
			'Invalid argument');
		var e = new EventEmitter();
		var count = 0;
		e.on('done', function(){
			count++;
			if(count == midwares.length){
				e.emit('finish', req, res);
			}
		}).on('finish', cb);
		
		if(midwares.length > 0){
			for(var i = 0; i < midwares.length; i++){
				midwares[i].call(this, req, res, function(){
					e.emit('done');
				});
			}
		}else{
			e.emit('finish');
		}
	}
}

aliez.use = function(cb){
	assert('function' == typeof cb, 'Invalid midware');
	midwares.push(cb);
	return aliez;
}

module.exports = aliez;