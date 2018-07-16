let express=require('express');
let svgCaptcha = require('svg-captcha');
let path=require('path');
let session = require('express-session')
let bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'SZHM19';
let app=express();

// 设置静态资源管理
app.use(express.static('static'));

app.use(session({ secret: 'keyboard cat'}))
// 使用bodyparser中间件
app.use(bodyParser.urlencoded({ extended: false }))

//访问登录页面，直接读取登录页面
app.get('/login',(req,res)=>{
	console.log(req.session);
    req.session.info='你来了';
    res.sendFile(path.join(__dirname,'static/views/login.html'));
})
// 提交登录页面数据
app.post('/login',(req,res)=>{
 let username=req.body.username;
//  console.log(username);
 let userpass=req.body.userpass;
//  console.log(userpass);
 let code=req.body.code;
//  console.log(code);
 if(code == req.session.captcha){
	//  console.log('验证正确');
	 
	 req.session.userInfo={
		 username,
		 userpass
	 }
	 res.redirect('/index');
 }else{
	//  console.log('失败');
	res.send("<script>alert('验证码失败');</script>")
	res.redirect('/login');
 }
})
// 生成随机图片
app.get('/login/captchaImg', (req, res)=> {
	var captcha = svgCaptcha.create();

	req.session.captcha = captcha.text.toLocaleLowerCase();
	// console.log(captcha.text)
	
	res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
	res.status(200).send(captcha.data);
});

// 路由器4
// 访问首页
app.get('/index',(req,res)=>{
	if(req.session.userInfo){
		res.sendFile(path.join(__dirname,'static/views/index.html'));
	}else{
		res.setheader('content-type','text/html');
		res.send("<script>alert('请登录');window.location.href='/login'</script>")
		//
	}
})

// 路由5 登出操作
app.get('/logout',(req,res)=>{
	delete  req.session.userInfo;
	res.redirect('/login');
})

// 路由6 注册操作
app.get('/register',(req,res)=>{

	res.sendFile(path.join(__dirname,'static/views/register.html'));
})

// 路由7
app.post('/register',(req,res)=>{
 //获取数据
 let username=req.body.username;
//   console.log(username);
 let userpass=req.body.userpass;
//  console.log(userpass);
 MongoClient.connect(url, (err, client)=> {
	const db = client.db(dbName);
   let  collection = db.collection('userList');
  collection.find({username}).toArray((err, docs)=> {
  console.log(docs)
  if(docs.length==0){
	//   console.log('没添加进去');
	collection.insertMany([
	  {username : 'yyy',userpass:123456}, {username : 'rrrr',userpass:123456}
	], (err, result)=> {
		console.log(err);
		// 注册成功了
		res.setHeader('content-type','text/html');
		res.send("<script>alert('欢迎入坑');window.location='/login'</script>")
		// 关闭数据库连接即可
		client.close();
	});
  }
	
  });
})
})
  // Insert some documents

// 监听成功
app.listen(80,'127.0.0.1',()=>{
    console.log('success');
})
