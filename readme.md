# koishi-plugin-minecraft-chatbridge-to-chat

[![npm](https://img.shields.io/npm/v/koishi-plugin-chatbridge-adapter?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-minecraft-chatbridge-to-chat)

这个插件基于MCDR的Chatbridge插件和koishi，实现了MC和其他聊天平台互通

Chatbridge：(https://github.com/TISUnion/ChatBridge)

Koishi: (https://koishi.chat/zh-CN/)

在Gocq无法正常使用后，Chatbridge的Gocqhttp方法不可用，此插件填上了gocq无法使用的空缺，让CB能通过ws连接来控制其他的adapter发送消息

Chatbridge端配置方法和原来的Gocq一样，只是把原先gocq的ws连接地址改为Koishi地址+此插件配置页面指定端口

关于Chatbridge的部署可以参考这篇帖子：(https://blog.mctown.tech/2022/11/17/%E5%90%8C%E6%AD%A5%E4%B8%8D%E5%90%8C%E6%9C%8D%E5%8A%A1%E7%AB%AF%E9%97%B4%E7%9A%84%E6%B6%88%E6%81%AF-Chatbridge/)

-一些注意事项：

Chatbridge的ws老是连不上，请检查是否是用docker部署，如果是，记得把端口映射到宿主机上，不然会出现无法连接的情况

Koishi配置项的群号需要与Chatbridge的群号一致，否则消息不会正常发送

群号可以用Koishi的inspect指令查询，请填写频道 ID

在修改配置后，需要重启Chatbridge的gocq端，否则会漏消息
