'ues strict';

var util = require('./util.js'), zlib = require('zlib'), fs = require('fs'), http = require('http');

module.exports = {
	send: function(req, res, code, header, data, cb){
		// 检查参数合法性
		if(!req instanceof http.IncomingMessage ||
			!res instanceof http.ServerResponse ||
			'number' != typeof code ||
			'object' != typeof header ||
			('string' != typeof data && !data instanceof Buffer)){
			if('function' == typeof cb) cb.call(new Error('Invalid argument'));
			return;
		}
		
		var range;
		var buf = data instanceof Buffer ? data : new Buffer(data);
		header.date = escape(new Date().toString());
		header.server = 'Aliez 1.0';
		
		if(req.headers['range']){
			code = 206;
			range = util.parseRange(req.headers['range']);
			buf = range.end ? data.slice(range.start, range.end) : data.slice(range.start);
		}
		
		var encoding = req.headers['accept-encoding'];
		if(encoding){
			var enc = encoding.match(/(gzip|deflate)/);
			if(enc){
				header['content-encoding'] = enc[1];
				res.writeHead(code, header);
				zlib[enc[1]].call(this, buf, function(err, result){
					if(err) throw err;
					
					res.end(req.method == 'HEAD' ? '' : result);
					if('function' == typeof cb) cb.call(this);
				});
				return;
			}
		}
		
		res.writeHead(code, header);
		res.end(req.method == 'HEAD' ? '' : buf);
		if('function' == typeof cb) cb.call(this);
	},
	
	sendFile: function(req, res, code, header, file, cb){
		if(!req instanceof http.IncomingMessage ||
			!res instanceof http.ServerResponse ||
			'number' != typeof code ||
			'object' != typeof header ||
			'string' != typeof file){
			if('function' == typeof cb) cb.call(new Error('Invalid argument'));
			return;
		}
		
		var range = req.headers['range'] ? util.parseRange(req.headers['range']) : null,
			frs;
		header.date = escape(new Date().toString());
		header.server = 'Aliez 1.0';
		
		try{
			if(range){
				frs = fs.createReadStream(file, range);
				code = 206;
			}else{
				frs = fs.createReadStream(file);
			}
		}catch(e){
			if('function' == typeof cb) cb.call(this, new Error('Read file error'));
			return;
		}
		
		var encoding = req.headers['accept-encoding'];
		if(encoding){
			var enc = encoding.match(/(gzip|deflate)/);
			if(enc){
				header['content-encoding'] = enc[1];
				var zip = enc[1] == 'gzip' ? zlib.createGzip() : zlib.createDeflate();
				res.writeHead(code, header);
				if(req.method == 'HEAD'){
					res.end('');
				}else{
					frs.pipe(zip).pipe(res);
				}
				if('function' == typeof cb) cb.call(this);
				return;
			}
		}
		
		res.writeHead(code, header);
		if(req.method == 'HEAD'){
			res.end('');
		}else{
			frs.pipe(res);
		}
		if('function' == typeof cb) cb.call(this);
	}
}