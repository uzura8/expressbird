import AWS from 'aws-sdk'
import awsConfig from '@/config/aws-config'
import boom from '@hapi/boom'
import { ChatComment } from '@/models'

const LEX_BOT_NAME = process.env.LEX_BOT_NAME || awsConfig.lex.bots.initialSupport
const LEX_CREDENTIAL = {
  accessKeyId: process.env.AWS_ACCESS_KEY || awsConfig.lex.credential.accessKeyId,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || awsConfig.lex.credential.secretAccessKey,
  region: process.env.AWS_REGION || awsConfig.lex.credential.region,
}

export default {
  talkToChatBot: (req, res, next) => {
    if (req.gcBot == null) {
      return next()
    }
    let sesAttrs = req.gcBot.sesAttrs != null ? req.gcBot.sesAttrs : null
    const comment = req.gcBot.comment

    const botAlias = '$LATEST'
    const botName = LEX_BOT_NAME
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

