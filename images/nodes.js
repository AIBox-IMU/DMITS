//node连接MySQL数据库
const mysql = require('mysql')

const nodes = [
    { id: 1, name: "Node1", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 1单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 2, name: "Node2", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 2单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 3, name: "Node3", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 3单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 4, name: "Node4", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 4单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 5, name: "Node5", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 5单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 6, name: "Node6", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 6单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 7, name: "Node7", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 7单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 8, name: "Node8", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 8单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 9, name: "Node9", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 9单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 10, name: "Node10", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 10单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 11, name: "Node11", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 11单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 12, name: "Node12", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 12单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 13, name: "Node13", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 13单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 14, name: "Node14", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 9单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 15, name: "Node15", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 10单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 16, name: "Node16", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 11单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 17, name: "Node17", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 12单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 18, name: "Node18", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 9单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 19, name: "Node19", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 10单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 20, name: "Node20", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 11单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: 21, name: "Node21", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 12单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },

    { id: 22, name: "Node22", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 10单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 23, name: "Node23", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 1单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 24, name: "Node24", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 2单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 25, name: "Node25", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 3单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 26, name: "Node26", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 4单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 27, name: "Node27", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 5单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 28, name: "Node28", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 6单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 29, name: "Node29", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 7单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 30, name: "Node30", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 8单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 31, name: "Node31", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 9单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 32, name: "Node32", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 10单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },

    { id: 33, name: "Node33", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 11单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 34, name: "Node34", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 12单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 35, name: "Node35", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 13单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 36, name: "Node36", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 9单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 37, name: "Node37", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 10单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 38, name: "Node38", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 11单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 39, name: "Node39", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 12单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 40, name: "Node40", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 9单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: 41, name: "Node41", image: "Y:/VscodeProject/display/dist/images/snow.png", details: "Node 10单个结点的描述，运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },



];
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
//获取连接
conn.connect((err) => {
    if (err) throw err;
    console.log('连接成功');

    const checkTableSql = `
        SELECT COUNT(*)
        FROM information_schema.TABLES
        WHERE (TABLE_SCHEMA = 'graph') AND (TABLE_NAME = 'nodes')
    `;
    conn.query(checkTableSql, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            const tableExists = result[0]['COUNT(*)'] === 1;
            if (!tableExists) {
                // 创建表
                const createTableSql = `
                    CREATE TABLE nodes (
                        id INT PRIMARY KEY,
                        name VARCHAR(255),
                        image VARCHAR(255),
                        details TEXT,
                        isshown BOOLEAN
                    )
                `;

                conn.query(createTableSql, (err, result) => {
                    if (err) {
                        console.log(err.message);
                    } else {
                        console.log('表创建成功');
                    }
                });
            } else {
                console.log('表已经存在，无需创建');
                const truncateTableSql = `
                TRUNCATE TABLE nodes
            `;
            }
        }
    })


    // 插入数据
    const insertNodesSql = `
    INSERT INTO graph.nodes (id, name, image, details, isShown)
    VALUES ?
    `;
    const values = nodes.map(node => [node.id, node.name, node.image, node.details, node.isShown]);
    conn.query(insertNodesSql, [values], (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log(result);
            console.log('插入成功');
        }
    });

})