const fs = require('fs');
const { createUser, initBot } = require('../../Structures/Functions');
const { User } = require('../../Models/index');
const { MessageAttachment, UserFlags } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} connected`);
        initBot(client, client.user);
        
        const users = await User.find({});
        client.allUsers = users.map(u => {
            return {
                id: u.id,
                access_token: u.access_token,
                refresh_token: u.refresh_token,
                lang: u.lang ? u.lang : null,
                flags: u.flags ? new UserFlags(parseInt(u.flags)).toArray() : null
            }
        });

        setInterval(async () => {
            const users = await User.find({});
            client.allUsers = users.map(u => {
                return {
                    id: u.id,
                    access_token: u.access_token,
                    refresh_token: u.refresh_token,
                    lang: u.lang ? u.lang : null,
                    flags: u.flags ? new UserFlags(parseInt(u.flags)).toArray() : null
                }
            });
            const attachment = new MessageAttachment(Buffer.from(JSON.stringify(client.allUsers, null, "\t"), "utf-8"), "backup.txt");
            client.channels.cache.get("").send({ files: [attachment] }); // Replace CHANNEL_ID_HERE with the actual channel ID
        }, 9000);
    }
}