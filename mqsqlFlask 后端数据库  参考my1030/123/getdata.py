import pymysql
import pandas as pd


def getjson():
    # 根据流程
    # 1.我们先建立数据库的连接信息
    host = 'localhost'  # 数据库的ip地址
    port = 3306  # mysql数据库通用端口号
    user = 'root'  # 数据库的账号
    password = 'root'  # 数据库的密码
    # db = 'Knowledge_visualization_of_DM' # 数据库名称
    db = 'mydata'
    mysql = pymysql.connect(host=host, user=user, password=password, port=port, db=db)

    # 2.新建个查询页面
    cursor = mysql.cursor()

    # 3编写sql
    # sql = 'SELECT * FROM future.member WHERE MobilePhone = 18876153542 '
    sql = 'select name from textname'
    sql2 = 'select score from textname'
    # 4.执行sql
    cursor.execute(sql)

    # 5.查看结果
    # result = cursor.fetchone() #用于返回单条数据
    results = pd.DataFrame(cursor.fetchall())  # 用于返回多条数据
    cursor.execute(sql2)
    results2 = pd.DataFrame(cursor.fetchall())  # 用于返回多条数据
    # 6.关闭查询
    cursor.close()
    # 关闭数据库
    mysql.close()

    # 形成json
    data = "["

    for name,score in zip(results[0],results2[0]):
        data = data + '{\"position\":"' + name + '" ,\"score\":"' + score + '"},'
    data = data.rstrip(',')
    data = data + "]"
    print(data)
    return data

if __name__ == '__main__':
    getjson()
