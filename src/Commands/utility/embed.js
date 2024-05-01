const { MessageActionRow, MessageButton } = require('discord.js');
const parse = require('parse-ms');

module.exports = {
    name: 'verifiedembed',
    category: 'Utility',
    botOwner: true,
    run: async (client, message, args, users, botData) => {

        const timeout = 604800000;
        const time = parse(timeout - (Date.now() - parseInt(botData.last_refresh)));

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setLabel('✅ Doğrulama için tıkla')
                    .setURL('https://discord.com/api/oauth2/authorize?client_id=1165770917864018022&redirect_uri=http%3A%2F%2F193.106.196.249%3A8080&response_type=code&scope=identify%20guilds.join')
            );

        await message.channel.send({ embeds: [
            {
                color: 'ff0000',
                description: `${users.size == 0 ? "" : ('💫 ** Kendini Doğrula ** ')}\n\n\n\n\n`,
                fields: [client.joins.map(m => {
                    return {
                        name: `${client.guilds.cache.get(m.guildID).name}`,
                        value: ` Auteur : <@>\n Membres : \n Date : <t:${Math.round(m.at / 1000)}:R>\n \`/\``
                    }
                })],
                image: {
                    url: "https://cdn.discordapp.com/attachments/1165573983517818903/1165582381248434186/altC4B1n1332020150351.png?ex=6547602f&is=6534eb2f&hm=60b5db957eb7319c5fd2d516d56f42197747fd58f1c4328da4ef7201917fdc2c&",
                    size: "full"
                },
                footer: {
                    text: ``
                }
            }
        ], components: [row] });

    }
}