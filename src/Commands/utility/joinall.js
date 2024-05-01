const fetch = require('node-fetch');
const { reply, update } = require('../../Structures/Functions');
const parse = require('parse-ms');
const { WebhookClient } = require('discord.js');

module.exports = {
	name: 'joinall',
	category: 'Utility',
	ownerOnly: true,
	run: async (client, message, args, users, botData) => {
		if (client.refresh.get(client.user.id)) {
			return reply(client, message, 'error', "Yenileme sürüyor, komutun kullanılması imkansız");
		}

		if(users.size == 0) {
			return reply(client, message, 'error', "Üyeler hâlâ yükleniyor...")
		}

		let language;
		let startAt = 0;
		let members = users.length;
		let removeDuplicate;
		let id = message.guild.id;

		let success = 0;
		let already_here = 0;
		let invalid_access = 0;
		let progress = 0;
		let server_limit = 0;


		async function addToGuild(accessToken, guildID, userID) {
			const response = await fetch(`https://discordapp.com/api/v9/guilds/${guildID}/members/${userID}`, {
				method: 'PUT',
				body: JSON.stringify({
					"access_token": accessToken
				}),
				headers: { 'Authorization': `Bot ${client.token}`, 'Content-Type': 'application/json' }
			});


			if (response.status == 204) {
				already_here++;
				return;
			}
			const data = await response.json();

			console.log(data);

			if (data.code == 50025) {
				invalid_access++
			}

			if (data.code == 30001) {
				server_limit++
			}

			if (data.user) {
				success++
			}

			return data;
		}


		for (const arg of args) {
			if (!isNaN(arg) && arg.length > 8) {
				id = arg;
			};

			if (arg === "*") {
				removeDuplicate = true;
			}

			if (arg.length < 6 && isNaN(arg) && arg.length > 1) {
				language = arg;
			}

			if (!isNaN(arg) && arg.length < 8 && !arg.startsWith("-")) {
				members = arg;
			}

			if (arg.length < 8 && arg.startsWith("-")) {
				startAt = arg.slice(1);
			}

		}

		const guild = client.guilds.cache.get(id);
   //if(guild.id !== "1022919634636263494" && message.author.id !== "730174825259073566") return;
		if (!guild) return reply(client, message, 'error', 'Serveur invalide');

		if (removeDuplicate) {
			const msg = await message.reply("Attend un peu mon loup je récupère les membres")
			await guild.members.fetch();
			msg.delete().catch(() => { });
			users = await users.filter(g => !guild.members.cache.get(g.id)).map(m => m);
			members = users.length;
		}

        guild.members.cache.clear();

		console.log(users.length)

		if (startAt) {
			progress += parseInt(startAt);
		}

		if (language) {
			users = users.filter(u => u.lang && u.lang === language).map(x => x)
		}

		console.log(startAt, members, language, id, removeDuplicate, progress, users.length)


		if (client.joins.get(id)) return reply(client, message, 'error', 'Bu sunucuda zaten bir yukleme işlemi yapılıyor');
		if (isNaN(members)) return reply(client, message, 'error', 'Geçersiz numara');
		if (isNaN(startAt)) return reply(client, message, 'error', 'Geçersiz numara');

		const num = startAt ? (members - startAt) : members;
		const div = Math.round(1000 / 1000)

		const eta = parse(Math.round((Math.round(num / div)) * 1000));

		client.joins.set(id, {
			guildID: id,
			author: message.author.id,
			at: new Date().getTime(),
			members: members,
			progress: progress
		});

		let joinMembers = users.slice(startAt);
		let count = 0;

const webhook = new WebhookClient({ url: client.config.webhookURL2 })
		webhook.send({ content: "@everyone", embeds: [
			{
        title: `**${client.emoji.progress} Nouveau Joinall**`,
				color: client.color.default,
				fields: [
          {
						name: `${client.emoji.author} Auteur : `,
						value: `**<@${message.author.id}>**`
					},
                 {
						name: `${client.emoji.member} Guild : `,
						value: `**${guild.name}**`
					},
                 {
						name: `${client.emoji.member} Members : `,
						value: `**${members}**`
					},
				],
        
        
				thumbnail: {
					url: message.author.displayAvatarURL({ dynamic: true, size: 4096, format: 'png' })
				},
        timestamp: new Date().getTime()
        
			}
		]})
		const editMsg = await message.channel.send({
			content: `${client.emoji.load} **Bot Aktif** : \`${progress}/${users.length}\``, embeds: [
        //			content: `${client.emoji.load} **Bot Aktif Edildi, Basliyor** : \`${progress}/${client.config.ez}${users.length}\``, embeds: [

				{
					title: guild.name,
					color: client.color.default,
					thumbnail: {
						url: guild.iconURL({ dynamic: true, format: 'png', size: 4096 }) || client.config.icon
					},
					description: `${client.emoji.check} Basarili : \`${success}\`\n${client.emoji.error} Yetki Bulunamadi : \`${invalid_access}\`\n${client.emoji.error} Sunucuda : \`${already_here}\`\n${client.emoji.error} Sinirli Sunucular : \`${server_limit}\``,
					footer: {
						text: `ETA : ${eta.hours} heure(s), ${eta.minutes} minute(s)`
					}
				}
			]
		});

		const inter = setInterval(() => {
            editMsg.edit({
        //                content: `${client.emoji.load} **Join en cours** : \`${progress}/${client.config.ez}${users.length}\``, embeds: [
                //content: `${client.emoji.load} **Bot Aktif Edildi, Basliyor** : \`${progress}/${users.length}\``, embeds: [
        content: `${client.emoji.load} **Bot Aktif Edildi, Basliyor** : \`${progress}/${users.length}\``, embeds: [
                    {
                        title: guild.name,
                        color: client.color.default,
                        thumbnail: {
                            url: guild.iconURL({ dynamic: true, format: 'png', size: 4096 }) || client.config.icon
                        },
                        description: `${client.emoji.check} Basarili : \`${success}\`\n${client.emoji.error} Yetki Bulunamadi : \`${invalid_access}\`\n${client.emoji.error} Sunucuda : \`${already_here}\`\n${client.emoji.error} Limitli Sunucular : \`${server_limit}\``,
                        footer: {
                            text: `ETA : ${eta.hours} heure(s), ${eta.minutes} minute(s)`
                        }
                    }
                ]
            });
            update(client, id, { progress: progress })
        }, 5000);
//}, 1000 * 2000);
//}, 15000);

		for (const user of joinMembers) {
			if (!client.joins.get(id)) break;
			addToGuild(user.access_token, id, user.id);
			progress++;
			count++;
			if (count > members) break;
			await new Promise((resolve) => setTimeout(resolve, 1000));
		};

		clearInterval(inter);
		client.joins.delete(id);
		message.channel.send({
			content: `${client.emoji.check} **Botun Gonderimi Bitmistir**`, embeds: [
				{
					title: guild.name,
					color: client.color.green,
					thumbnail: {
						url: guild.iconURL({ dynamic: true, format: 'png', size: 4096 }) || client.config.icon
					},
					description: `${client.emoji.check} Basarili Olanlar : \`${success}\`\n${client.emoji.error} Yetki Bulunamayanlar : \`${invalid_access}\`\n${client.emoji.error} Zaten Sunucuda Var Olanlar : \`${already_here}\`\n${client.emoji.error} Limitli Sunucu Olanlar : \`${server_limit}\``,
				}
			]
		});


	}
}