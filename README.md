# Pdman Web

web版pdman, 并进行了美化, 只支持Mysql, 不支持数据库版本管理.

## 安装
`npm i -g pdman`

## 启动

打开控制台, 输入`pdman`, 启动后访问[http://localhost:8000](http://localhost:8000)

## 致谢
原始仓库: [pdman](https://gitee.com/robergroup/pdman)

## 备注

历史记录
1. 使用了IndexedDB进行存储, 对FileHandler对象进行了持久化
2. 其中使用[idb-keyval](https://github.com/jakearchibald/idb-keyval)库避免了底层操作

IndexedDB
1. IndexedDB是一个NoSQL数据库、分为数据库、数据表和数据
2. 数据表中的数据为键值对列表, 键则是用来唯一标识文档, value为非结构化数据, 可以有多条
3. 总体结构和ElasticSearch比较像, 不同的是创建文档时必需手动指定主键.
