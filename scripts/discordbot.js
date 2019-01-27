(function () {
  'use strict';

  const Discord = require('discord.js')  // Module to control Discord bot.
  const GitHub = require('github-api')   // Module to Github API wrapper.
  const crypto = require('crypto')       // Module to secret token converter.

  const client = new Discord.Client()

  const encryptedTokenForDiscord =
    '7562a6b378447432510dc22b3bebe1ea67252de9531905cbd580146d58e6fd07298635103333639ff2ad5527c3dd76569c30cf4851c3ed4c00f4b8fbffe9290b'
  const encryptedTokenForGithub =
    '8015587811c8d4ba91b6817a9061083f3d0fd69f38e61592824307391bbfd9ac013cd142adaa8c0ba573593714c9c239'

  const BLOKEN_ADDON_REPORT_PREFIX = 'BrokenAddonReport'

  client.on('ready', () => {
    console.log(`Logged in Discord-bot as ${client.user.tag}.`)
  })

  client.on('message', (message) => {
    let content = message.content
    if (!content.startsWith(BLOKEN_ADDON_REPORT_PREFIX)) {
      return
    }
    let reportObj = JSON.parse(content.replace(BLOKEN_ADDON_REPORT_PREFIX, ''))
    console.log(reportObj)

    let decipher = crypto.createDecipher('aes256', process.type)
    let text = decipher.update(encryptedTokenForGithub, 'hex', 'utf8')
    text += decipher.final('utf8')

    let issueObj = {
      "title": 'Broken-Addon Report: ' + reportObj.name,
      "body": `"name": "${reportObj.version}", "version": "${reportObj.version}", "author": "${reportObj.author}"`
    }

    let gh = new GitHub({
      token: text
    })
    gh.getIssues('JToSAddon', 'Addons').listIssues().then((issues) => {
      let isCreateIssue = true
      for (let i = 0; i < issues.data.length; i++) {
        let issue = issues.data[i]
        if (issue.title.indexOf(reportObj.name) > 0) {
          isCreateIssue = false
          break
        }
      }
      if (!isCreateIssue) {
        // Add +1 reaction to target issue.
        console.log('Already created.')
        return
      }
      gh.getIssues('JToSAddon', 'Addons').createIssue(issueObj).then(() => {
        console.log('Successfully created an issue.')
      })
    })
  })

  exports.discordbot = {
    login: () => {
      let decipher = crypto.createDecipher('aes256', process.type)
      let text = decipher.update(encryptedTokenForDiscord, 'hex', 'utf8')
      text += decipher.final('utf8')
      client.login(text)
    },
    report: (addon, callback) => {
      const channel = client.channels.find(c => c.name == 'broken-addon-report')
      if (!channel) {
        console.error('Couldnt find target channel for reporting.')
        return
      }
      const reportObj = {
        "name": addon.name,
        "file": addon.file,
        "version": addon.fileVersion.replace('v', ''),  // we do not need the first "v"...
        "author": addon.author,
      }
      channel.send(`${BLOKEN_ADDON_REPORT_PREFIX} ${JSON.stringify(reportObj)}`).then(() => {
        console.log(`Successfully reported addon [${addon.name}].`)
        callback(reportObj)
      })
    }
  }
})();