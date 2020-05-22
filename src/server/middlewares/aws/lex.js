import AWS from 'aws-sdk'
import awsConfig from '@/config/aws-config'
import boom from '@hapi/boom'
import { ChatComment } from '@/models'

const AWS_LEX_BOT_NAME = process.env.AWS_LEX_BOT_NAME || awsConfig.lex.bots.initialSupport
const LEX_CREDENTIAL = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || awsConfig.credential.accessKeyId,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || awsConfig.credential.secretAccessKey,
  region: process.env.AWS_LEX_REGION || awsConfig.lex.region,
}

export default {
  talkToChatBot: (req, res, next) => {
    if (req.gcBot == null) {
      return next()
    }
    let sesAttrs = req.gcBot.sesAttrs != null ? req.gcBot.sesAttrs : null
    const comment = req.gcBot.comment

    const botAlias = '$LATEST'
    const botName = AWS_LEX_BOT_NAME
    const lexruntime = new AWS.LexRuntime(LEX_CREDENTIAL)

    try {
      const params = {
        botAlias: botAlias,
        botName: botName,
        inputText: comment.body,
        userId: 'userId-' + comment.userId, // set sessionId
        sessionAttributes: sesAttrs,
      }
      lexruntime.postText(params, (err, data) => {
        if (err) {
          throw err
        }
        if (data) {
          req.gcBot.sesAttrs = data.sessionAttributes
          ChatComment.create({
            chatId: comment.chatId,
            userId: req.gcBot.adminUser.id,
            body: data.message,
          }).then((chatComment) => {
            const result = {
              id: chatComment.id,
              chatId: chatComment.chatId,
              userId: chatComment.userId,
              body: chatComment.body,
              user: { name:req.gcBot.adminUser.name }
            }
            res.io.emit(`CHAT_COMMENT_${chatComment.chatId}`, result)
          })
        } else {
          next()
        }
      })
    } catch (err) {
      return next(boom.badRequest(err))
    }
  }
}

