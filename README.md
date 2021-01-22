# Pdman Web

## 安装

`#`表示执行命令
```shell script
# git clone https://github.com/cweijan/pdman-web.git

# cd pdman_web

# yarn install
```

## 运行

```
# yarn start
```
打开 [http://localhost:3000](http://localhost:3000)

## 备注

历史记录
1. 这个很有趣, 因为用了IndexedDB进行存储, 保存了FileHandler对象
2. 其中使用[idb-keyval](https://github.com/jakearchibald/idb-keyval)简化了操作

IndexedDB
1. IndexedDB是一个NoSQL数据库、分为数据库、数据表和数据
2. 其中数据存放键值对列表, 和数据表是一体的
3. 数据表其实更像是一个文档, 数据库则像是一个表.
