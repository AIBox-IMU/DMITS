//node连接MySQL数据库
const mysql = require('mysql')
const http = require('http');
const express = require('express');
// const cors = require('cors');
// const app = express();
// app.use(cors());

var jsonNodes;
var jsonlinks;
//创建连接
let conn = mysql.createConnection({
    //主机地址
    host: '127.0.0.1',
    //用户名
    user: 'root',
    //密码
    password: 'y24865q',
    //数据库名称
    database: 'graph'
})

conn.connect((err) => {
    if (err) throw err;
    console.log('连接成功');
    conn.query('SELECT * FROM nodes', (error, results, fields) => {
        if (error) {
            console.log('Error querying database: ', error);
        } else {
            // 将查询结果转换为JSON格式
            jsonNodes = JSON.stringify(results);
            // 在控制台中输出JSON数据
            console.log(jsonNodes);
        }
    });
});

conn.query('SELECT * FROM links', (error, results, fields) => {
    if (error) {
        console.log('Error querying database: ', error);
    } else {
        // 将查询结果转换为JSON格式
        jsonlinks = JSON.stringify(results);
        // 在控制台中输出JSON数据
        console.log(jsonlinks);
    }
});

//获取连接
const server = http.createServer((req, res) => {
    // 设置响应头
    res.setHeader('Access-Control-Allow-Headers', 'mytoken');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    // const data = { message: 'Hello, world!' };
    // res.end(JSON.stringify(jsonNodes));
    // res.writeHead(200, { 'Access-Control-Allow-Headers'，'mytoken'});
    // res.writeHead(200, { 'Content-Type': '/json' });
    // 发送JSON数据作为HTTP响应
    res.end(jsonNodes);
});

// 监听端口
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});