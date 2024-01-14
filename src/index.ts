import * as WebSocket from 'ws';
import {Context, Schema} from 'koishi'
import json from 'json5'

export const name = 'chatbridge-adapter'

export interface Config {
}

export const Config: Schema<Config> = Schema.object({
  groupId: Schema.string().description('群号（需要和CB配置文件中的保持一致）：').required(),
  adapter: Schema.union(['Red协议(对接adapter-red)', 'Kook'] as const).description('选择适配器').required(),
  port: Schema.number().description('监听的端口').default(6700),
})

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('Minecraft') // 创建logger用于输出Koishi日志
  const logger_log = ctx.logger('Log') // 创建logger用于输出Koishi日志
  const logger_qq = ctx.logger('QQ') // 创建logger用于输出Koishi日志
  ctx.on('dispose', () => {
    // 在插件停用时关闭端口
    server.close()
  })

  let temp = config["adapter"];
  let adapter: string;
  switch (temp) {
    case "Red协议(对接adapter-red)":
      adapter = "red";
      break;
    case "Kook":
      adapter = "kook";
      break;
    case "QQ频道":
      adapter = "qqguild";
      break;
  }
  logger_log.success("已选择平台：" + adapter)
  const groupId: number = +config["groupId"]
  const broadcastTo = adapter + ':' + groupId
  const port = config["port"]
  const server = new WebSocket.Server({port: port});
  logger_log.success('正在监听端口' + port);
  logger_log.success("已选择：" + broadcastTo)
  server.on('connection', ws => {
    ws.on('message', message => {
      let str = JSON.parse(message.toString('utf-8'))
      str = str['params']['message']
      //将
      logger.info(`收到消息: ${str}`);
      str = str.replace(/</g, "&lt;");
      str = str.replace(/>/g, "&gt;");
      ctx.broadcast([broadcastTo], str)
    });

    ws.on('close', () => {
      logger_log.warn('连接已关闭');
    });

    ctx.on('message', (session) => {
      if (adapter === "kook") {
        let temp: number = +session.channelId
        logger_qq.info(`收到消息: ${session.event.message}`)
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
      }



      if (adapter === "red") {
        let temp: number = +session.channelId
        console.log(session.channelId,'这是频道id')
        console.log(session.event)
        let person = session.event['user']['name']
        let message = session.event['message']['content']
        logger_qq.info(`收到消息: <${person}>: ${message}`)
        if (temp !== groupId) return
          let data = {
            'post_type': 'message',
            'message_type': 'group',
            'group_id': groupId,
            'anonymous': null,
            'sender': {
              'card': person
            },
            'raw_message': message,
          }
        ws.send(JSON.stringify(data));
      }
    })
  });
  // 向所有客户端广播
  // write your plugin here
}
