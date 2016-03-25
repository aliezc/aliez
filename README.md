# aliez

可扩展的简易web服务器

## 安装

```
npm install aliez
```

## 快速上手

```javascript
// 引入库
var aliez = require('aliez'), qs = require('querystring'), url = require('url');

// 创建服务器
var svr = aliez.createServer();

// 添加自定义中间件
svr.use(function(req, res, done){
	var str = url.parse(req.url).query;
	req.query = qs.parse(str);
	done();
});

// 添加路由
svr.add('GET', '/', function(req, res){
	// 发送内容
	res.send('hello world');
})

// 添加get方法的路由
.get('/user', function(req, res){
	// 发送文件
	res.sendFile('./1.htm');
})

// 添加post方法
.post('/update', function(req, res){
	res.send('hahaha');
})

// 添加域名
.host('www.example.com')

// 开始监听
.listen(80);
```
