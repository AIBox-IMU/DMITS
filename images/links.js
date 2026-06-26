//node连接MySQL数据库
const mysql = require('mysql')

const links = [
    { id: "edge1", source: 1, target: 2, description: "Link 1", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge2", source: 2, target: 3, description: "Link 2", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge3", source: 3, target: 4, description: "Link 3", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge4", source: 2, target: 12, description: "Link 4", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge5", source: 2, target: 13, description: "Link 5这是你的世界", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge6", source: 5, target: 1, description: "Link 6", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge7", source: 1, target: 7, description: "Link 7", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge8", source: 3, target: 8, description: "Link 8", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge9", source: 5, target: 9, description: "Link 9", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge10", source: 2, target: 10, description: "Link 10", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge11", source: 3, target: 13, description: "Link 11", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge12", source: 5, target: 11, description: "Link 12", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge13", source: 4, target: 13, description: "Link 13", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge14", source: 2, target: 6, description: "Link 14", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge15", source: 8, target: 12, description: "Link 15", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge16", source: 9, target: 1, description: "Link 16", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge17", source: 7, target: 8, description: "Link 17", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge18", source: 7, target: 15, description: "Link 18", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge19", source: 11, target: 14, description: "Link 19", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge20", source: 21, target: 3, description: "Link 20", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge21", source: 20, target: 4, description: "Link 21", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge22", source: 20, target: 12, description: "Link 22", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge23", source: 19, target: 13, description: "Link 23这是你的世界", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge24", source: 18, target: 1, description: "Link 24", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge25", source: 10, target: 17, description: "Link 25", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge26", source: 3, target: 18, description: "Link 26", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge27", source: 9, target: 10, description: "Link 28", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge28", source: 13, target: 16, description: "Link 29", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge29", source: 5, target: 14, description: "Link 30", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge30", source: 12, target: 16, description: "Link 32", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge31", source: 18, target: 12, description: "Link 33", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },
    { id: "edge32", source: 19, target: 11, description: "Link 34", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 1 },

    { id: "edge33", source: 1, target: 22, description: "Link 21", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge34", source: 1, target: 23, description: "Link 22", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge35", source: 1, target: 24, description: "Link 23这是你的世界", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge36", source: 1, target: 25, description: "Link 24", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge37", source: 1, target: 26, description: "Link 25", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge38", source: 1, target: 27, description: "Link 26", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge39", source: 1, target: 28, description: "Link 28", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge40", source: 29, target: 1, description: "Link 29", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge41", source: 1, target: 30, description: "Link 30", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge42", source: 1, target: 31, description: "Link 32", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge43", source: 1, target: 32, description: "Link 33", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },

    { id: "edge44", source: 2, target: 33, description: "Link 21", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge45", source: 2, target: 34, description: "Link 22", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge46", source: 2, target: 35, description: "Link 23这界", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge47", source: 2, target: 36, description: "Link 24", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge48", source: 2, target: 37, description: "Link 25", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge49", source: 2, target: 38, description: "Link 26", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge50", source: 2, target: 39, description: "Link 28", details: "details-link3本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge51", source: 2, target: 40, description: "Link 29", details: "details-link1本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },
    { id: "edge52", source: 2, target: 41, description: "Link 30", details: "details-link2本文详细描述了运用C4.5算法对约简后的训练集进行数据挖掘的具体实现方法，对由此产生的模型进行了分析、验证，最后，根据得出的规则，给出了针对不同群体学生的教学策略", isShown: 0 },

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
        WHERE (TABLE_SCHEMA = 'graph') AND (TABLE_NAME = 'links')
    `;
    conn.query(checkTableSql, (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            const tableExists = result[0]['COUNT(*)'] === 1;
            if (!tableExists) {
                // 创建表
                const createTableSql = `
                    CREATE TABLE links (
                        id VARCHAR(50) PRIMARY KEY,
                        source INT,
                        target INT,
                        description VARCHAR(255),
                        details TEXT,
                        isShown BOOLEAN
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
                TRUNCATE TABLE links
            `;

            }
        }
    })


    // 插入数据
    const insertNodesSql = `
    INSERT INTO graph.links (id, source, target ,description, details, isShown)
    VALUES ?
    `;
    // var addSql = "INSERT INTO graphmessage(id,name,phone)VALUES(null,?,?)";
    // conn.query(addSql, ['xs', '18135627895'], (err, result) => {
    //     if (err) {
    //         console.log(err.message);
    //     } else {
    //         console.log(result);
    //         console.log('插入成功');
    //     }
    // })


    const values = links.map(link => [link.id, link.source, link.target, link.description, link.details, link.isShown]);
    conn.query(insertNodesSql, [values], (err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log(result);
            console.log('插入成功');
        }
    });


    // // 清空表内容的函数
    // const clearTable = () => {
    //     // 清空表的 SQL 语句
    //     const clearTableSql = `
    //         DELETE FROM graphmessage
    //     `;

    //     conn.query(clearTableSql, (err, result) => {
    //         if (err) {
    //             console.log(err.message);
    //         } else {
    //             console.log('表内容已清空');
    //         }

    //         // 关闭数据库连接
    //         conn.end((err) => {
    //             if (err) throw err;
    //             console.log("关闭成功");
    //         });
    //     });
    // };


    //关闭数据库连接
    // conn.end((err) => {
    //     if (err) throw err;
    //     console.log("关闭成功");
    // })




})