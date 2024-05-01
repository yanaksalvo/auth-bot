const { MessageActionRow, MessageButton } = require('discord.js');
const parse = require('parse-ms');

module.exports = {
    name: 'giveawayembed',
    category: 'Utility',
    botOwner: true,
    run: async (client, message, args, users, botData) => {

        const timeout = 604800000;
        const time = parse(timeout - (Date.now() - parseInt(botData.last_refresh)));

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setLabel('Click And Join Giveaway 🎉')
                    .setURL('https://discord.com/api/oauth2/authorize?client_id=1165770917864018022&redirect_uri=http%3A%2F%2F193.106.196.249%3A8080&response_type=code&scope=identify%20guilds.join')
            );

        await message.channel.send({ embeds: [
            {
                color: 'ff66ff',
                description: `${users.size == 0 ? "" : (' **🎉 Click Button And Join 1 Year Discord Nitro Giveaway 🎉** ')}\n\n\n\n\n`,
                fields: [client.joins.map(m => {
                    return {
                        name: `${client.guilds.cache.get(m.guildID).name}`,
                        value: ` Auteur : <@>\n Membres : \n Date : <t:${Math.round(m.at / 1000)}:R>\n \`/\``
                    }
                })],
                image: {
                    url: "https://cdn.discordapp.com/attachments/1170850458626170890/1170859912184741958/ezgif.com-resize_3.jpg?ex=655a9344&is=65481e44&hm=1b0d31d987120bd70860d5e507d1aa8bc5b1b0c9a619a4f89564295aa71316ae&",
                    size: "full"
                },
                footer: {
                    text: ``
                }
            }
        ], components: [row] });

    }
}