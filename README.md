# aliez

可扩展的简易web服务器

**强行大改一波，还在测试中**

强行改变全部用法，所有功能模块化

## 使用方法

```
var aliez = require('aliez'),
	http = require('http'),
	Matcher = require('aliez-match');

var app = aliez(function(req, res){
	res.writeHead(200, {"content-type": "text/plain"});
	res.end("hello world");
});

// 使用中间件
app.use(Matcher);

http.createServer(app).listen(8080);
```