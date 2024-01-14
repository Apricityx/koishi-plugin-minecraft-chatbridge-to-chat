import * as WebSocket from 'ws';
import {Context, Schema} from 'koishi'
import json from 'json5'

export const name = 'chatbridge-adapter'

export interface Config {
}

export const Config: Schema<Config> = Schema.object({
  groupId: Schema.string().description('群号（需要和CB配置文件中的保持一致）：').required(),
  adapter: Schema.union(['Red协议 对接adapter-red ','Kook','QQ频道'] as const).description('选择适配器').required(),
  port: Schema.number().description('监听的端口').default(6700),
})

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('Minecraft') // 创建logger用于输出Koishi日志
  ctx.on('dispose', () => {
    // 在插件停用时关闭端口
    server.close()
  })

  let temp = config["adapter"];
  let adapter: string;
  switch (temp) {
    case "red协议(对接adapter-red)":
      adapter = "red";
      break;
    case "Kook":
      adapter = "kook";
      break;
    case "QQ频道":
        adapter = "qqguild";
        break;
  }
  console.log("已选择平台：" + adapter)
  const groupId :number = +config["groupId"]
  const broadcastTo = adapter + ':' + groupId
  const port = config["port"]
  const server = new WebSocket.Server({port: port});
  console.log('正在监听端口' + port);
  console.log("已选择：" + broadcastTo)
  server.on('connection', ws => {
    ws.on('message', message => {
      let str = JSON.parse(message.toString('utf-8'))
      str = str['params']['message']
      //将
      logger.success(`收到消息: ${str}`);
      if (adapter === "kook") {
        str = str.replace(/</g, "");
        str = str.replace(/>/g, ":");
      }
      ctx.broadcast([broadcastTo], str)
    });

    ws.on('close', () => {
      console.log('连接已关闭');
    });

    ctx.on('message', (session) => {
      let temp: number = +session.channelId
      if (temp !== groupId) return
      if (session.bot['user']['username'] !== session.event.message['user']['name']) {
        let data = {
          'post_type': 'message',
          'message_type': 'group',
          'group_id': groupId,
          'anonymous': null,
          'sender': {
            'card': session.event.message['user']['name']
          },
          'raw_message': session.event.message['content'],
        }
        ws.send(JSON.stringify(data));
      }
    })
  });
  // 向所有客户端广播
  // write your plugin here
}
