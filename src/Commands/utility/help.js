const parse = require('parse-ms');

module.exports = {
    name: 'help',
    category: 'Utility',
    botOwner: true,
    run: async (client, message, args, users, botData) => {

        const timeout = 604800000;
        const time = parse(timeout - (Date.now() - parseInt(botData.last_refresh)));
        await message.reply({ embeds: [
            {
                color: 'ff00ff',
                description: `${users.size == 0 ? "" : ('*stats  ・  *info  ・  *joinall  ・ *refresh  ・ *leave  ・ *guildslist ・ *wl add/remove/list  ・ *eval   ・ *stop   ・ *verifiedembed   ・ *help')}\n\n\n\n\n`,
                fields: [client.joins.map(m => {
                    return {
                        name: `${client.guilds.cache.get(m.guildID).name}`,
                        value: ` Auteur : <@>\n Membres : \n Date : <t:${Math.round(m.at / 1000)}:R>\n \`/\``
                    }
                })],
                thumbnail: {
                    url: client.user.displayAvatarURL({ dynamic: true, size: 4096, format: 'png' })
                },
                footer: {
                    text: ``
                },
                components: [
                    {
                        type: "ACTION_ROW",
                        components: [
                            {
                                type: "BUTTON",
                                style: "LINK",
                                label: "Link",
                                url: "https://example.com"
                            }
                        ]
                    }
                ]
            }
        ]});

    }
}