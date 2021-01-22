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
2. 数据表中的数据为键值对列表, 键则是用来唯一标识文档, value为非结构化数据, 可以有多条
3. 总体看来和ElasticSearch是有点像的, 不同的是创建文档时必需手动指定主键.

![test](https://images2015.cnblogs.com/blog/568922/201612/568922-20161207160722647-1068806549.png)

