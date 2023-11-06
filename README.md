## 关于本项目
该项目是一个书架借阅管理系统(鲲鹏)，它分为后台管理系统和书籍借阅系统。后台管理系统可管理书籍的分类、录入(可通过isbn自动获取书籍信息)、和借出记录。书籍借阅系统可进行用户注册(公司里可用ldap)、书籍展示、书籍借阅归还。

项目运行指南：  
1、安装node20.x，安装完后可在命令行输入node -v查看版本，以便确认安装成功  
2、在命令行里，输入npm install -g nrm（nrm可以管理npm的源，安装完之后可以nrm use taobao切换淘宝的源)  
3、在命令行里，输入npm i -g nodemon全局安装nodemon（nodemon可以用来监控你 node.js 源代码的任何变化和自动重启你的服务器）  
4、安装mongodb，建立一个名为library的数据库并运行，可以使用robo 3t进行图形化管理  
5、在命令行里，输入npm install -g pnpm  
6、clone本项目，进入项目根目录输入pnpm install安装依赖  
7、配置config/default.json里的邮箱（以126邮箱为示例）
```json
{
    "mail": {
        "host": "smtp.126.com",
        "port": 465,
        "secure": true,
        "auth": {
            "user": "username@126.com", 
            "pass": "password"
        }
    } 
}
```
8、如果使用isbn获取接口，需要配置config/default.json里的isbn.apiky  
apikey需要去https://jike.xyz/jiekou/isbn.html申请  

9、如果使用ldap，需要配置config/default.json里的ldap
```json
{
    "ldap": {
        "server": "ldap://ldapservice.domain.com",
        "baseDn": "CN=Admin,CN=Users,DC=test,DC=com",
        "bindPassword": "password123",
        "searchDn": "OU=UserContainer,DC=test,DC=com",
        "searchStandard": "mail"
    }
}
```
- `server` LDAP 服务器地址，前面需要加上 ldap:// 前缀，也可以是 - ldaps:// 表示是通过 SSL 连接;
- `baseDn` LDAP 服务器的登录用户名，必须是从根结点到用户节点的全路径;
- `bindPassword` 登录该 LDAP 服务器的密码;
- `searchDn` 查询用户数据的路径，类似数据库中的一张表的地址，注意这里也必须是全路径;
- `searchStandard` 查询条件，这里是 mail 表示查询用户信息是通过邮箱信息来查询的。注意，该字段信息与LDAP数据库存储数据的字段相对应，如果如果存储用户邮箱信息的字段是 email, 这里就需要修改成 email.

10、配置完后输入npm start就可以启动后端了  
11、启动前端[vue3版本](https://github.com/yuu2lee4/library_fe)或[react版本](https://github.com/yuu2lee4/library_react)

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
如果安装依赖c++的包，需要node-gyp编译，nodejs安装的时候就自带了node-gyp，然后还需要安装python和c++编译器：
- Linux：GCC
- Mac：Command Line Tools或Xcode
- Windows需要注意的是，你需要自己全局安装node-gyp: npm install -g node-gyp,然后安装下面文档里写的Windows-Build-Tools

https://github.com/nodejs/node-gyp