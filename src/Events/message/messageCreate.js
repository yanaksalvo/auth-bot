const { User, Bot, WL } = require('../../Models/index');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {

        const prefix = client.config.prefix;
        if (message.author.bot) return;
        if (!message.content.startsWith(prefix)) return;
        const users = await client.allUsers;
        const botData = (await Bot.find({ id: client.user.id }))[0];
        const wlData = (await WL.find({ id: message.author.id }))[0] ? true : false;
       
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();
        if (commandName.length == 0) return;
        let command = client.commands.get(commandName);
        if(command && command.ownerOnly && !client.config.owners.includes(message.author.id)) return;
        if(command && command.botOwner && !wlData) return;
        if (!command || !command.run) return;

        if (command) command.run(client, message, args, users, botData, wlData);
    }
}