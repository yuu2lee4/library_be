涉及到技术或者框架：nodejs、koa2、mongodb、es2015+
- nodejs：http://nodejs.cn/api/
- koa2：https://chenshenhai.github.io/koa2-note/note/start/quick.html
- mongoose(操作mongodb)：
http://www.nodeclass.com/api/mongoose.html 	
https://cnodejs.org/topic/548e54d157fd3ae46b233502 
https://cnodejs.org/topic/504b4924e2b84515770103dd
- mongodb：http://docs.mongoing.com/manual-zh/

nodejs社区：https://cnodejs.org

项目运行指南：  
1、安装node8.x，安装完后可在命令行输入node -v查看版本，以便确认安装成功  
2、在命令行里，输入npm install -g nrm（nrm可以管理npm的源，安装完之后可以npm use taobao切换淘宝的源，也可以用yarn替代npm)  
3、在命令行里，输入npm i -g nodemon全局安装nodemon（nodemon可以用来监控你 node.js 源代码的任何变化和自动重启你的服务器）  
4、安装mongodb，建立一个名为library的数据库并运行，可以使用robo 3t进行图形化管理  
5、clone library_be，进入项目根目录输入npm install安装依赖  
6、配置config/mail.js（以126邮箱为示例）
```javascript
module.exports = {
    host: 'smtp.126.com',
    port: 465,
    secure: true,
    //rejectUnauthorized: false,
    auth: {
        user: "username@126.com", // 账号
        pass: "password" // 密码
    }
}
```
7、如果使用ldap，需要配置config/ldap.js
```javascript
module.exports = {
    server: "ldap://ldapservice.domain.com",
    baseDn: "CN=Admin,CN=Users,DC=test,DC=com",
    bindPassword: "password123",
    searchDn: "OU=UserContainer,DC=test,DC=com",
    searchStandard: "mail"
}
```
- `server` LDAP 服务器地址，前面需要加上 ldap:// 前缀，也可以是 - ldaps:// 表示是通过 SSL 连接;
- `baseDn` LDAP 服务器的登录用户名，必须是从根结点到用户节点的全路径;
- `bindPassword` 登录该 LDAP 服务器的密码;
- `searchDn` 查询用户数据的路径，类似数据库中的一张表的地址，注意这里也必须是全路径;
- `searchStandard` 查询条件，这里是 mail 表示查询用户信息是通过邮箱信息来查询的。注意，该字段信息与LDAP数据库存储数据的字段相对应，如果如果存储用户邮箱信息的字段是 email, 这里就需要修改成 email.

8、配置完后输入npm start就可以启动后端了  
9、启动前端(https://github.com/yuu2lee4/library_fe)

目录结构:
````
    ROOT/
    |-- app.js             入口文件
    |-- config             配置文件
    |-- upload             上传文件存放目录
    |-- utils              工具方法
    |-- controllers        控制器，定义了操作数据库集合的各种方法
    |-- routers/routers.js 后端路由，提供接口供前端调用获取数据
    `-- models             数据库模型
````

特别注意  
有些node包是c++写的 ~~（比如本项目的bcrypt）~~（已改为无需编译的bcryptjs），需要node-gyp编译，nodejs安装的时候就自带了node-gyp，然后还需要安装python和c++编译器：
- Linux：GCC
- Mac：Command Line Tools或Xcode
- Windows需要注意的是，你需要自己全局安装node-gyp: npm install -g node-gyp,然后安装下面文档里写的Windows-Build-Tools

https://github.com/nodejs/node-gyp