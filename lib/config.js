'use strict';

var aliez_base_renderer = require('./aliez-render.js');

module.exports = {
	// 设置
	_config: {
		// 错误回复信息
		"400": "400 - Bad Request",
		"401": "401 - Unauthorized",
		"402": "402 - Payment Required",
		"403": "403 - Forbidden",
		"404": "404 - Not Found",
		"405": "405 - Method Not Allowed",
		"406": "406 - Not Acceptable",
		"407": "407 - Proxy Authentication Required",
		"408": "408 - Request Timeout",
		"409": "409 - Conflict",
		"410": "410 - Gone",
		"411": "411 - Length Required",
		"412": "412 - Precondition Failed",
		"413": "413 - Request Entity Too Large",
		"414": "414 - Request-URI Too Long",
		"415": "415 - Unsupported Media Type",
		"416": "416 - Requested Range Not Satisfiable",
		"417": "417 - Expectation Failed",
		"500": "500 - Internal Server Error",
		"501": "501 - Implemented",
		"502": "502 - Bad Gateway",
		"503": "503 - Service Unavailable",
		"504": "504 - Gateway Timeout",
		"505": "505 - HTTP Version Not Supported",
		
		// 监听端口
		"port": 5000,
		
		// 域名
		"hostname": "",
		
		// 页面渲染器
		"renderer": aliez_base_renderer,
		
		// 超时限制，默认30
		"timeout": 30000,
		
		// 默认文档
		"default_document": ["index.htm", "index.html"]
	},
	
	set: function(k, v){
		if('undefined' == typeof this._config[k]) throw new Error('Unknow settings');
		
		this._config[k] = v;
	},
	
	get: function(k){
		return this._config[k];
	}
}