const fetch = require('node-fetch');
const { reply, updateBot, updateUser, deleteUser, logErr, success } = require('../../Structures/Functions');
const parse = require('parse-ms');

module.exports = {
	name: 'refresh',
	category: 'Utility',
	ownerOnly: true,
	run: async (client, message, args, users, botData) => {

		if (client.refresh.get(client.user.id)) {
			return reply(client, message, 'error', "Yenileme zaten yapılıyor...");
		}

		const num = users.length;
		const div = Math.round(1000 / 65)

		const eta = parse(Math.round((Math.round(num / div)) * 1000));

		let error = 0;
		let succ = 0;
		let progress = 0;

		async function refresh(token, userID) {

			const details = {
				"client_id": client.config.clientID,
				"client_secret": client.config.clientSecret,
				"grant_type": "refresh_token",
				"refresh_token": token
			}

			const url = Object.keys(details).map(function (k) {
				return encodeURIComponent(k) + '=' + encodeURIComponent(details[k])
			}).join('&');

			const refreshRequest = await fetch(`https://discordapp.com/api/v9/oauth2/token`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
				body: url,
			});

			const responseRefreshRequest = await refreshRequest.json();
			if (!responseRefreshRequest) return;



			if (responseRefreshRequest.error === "invalid_grant") {
				deleteUser({ id: userID });
				error++
				logErr(`Refresh : ${responseRefreshRequest.error}`)
				return;
			} else {
				const userResult = await fetch('https://discordapp.com/api/users/@me', {
					headers: {
						authorization: `Bearer ${responseRefreshRequest.access_token}`,
					},
				});

				const userInfo = await userResult.json();

				updateUser({ id: userID }, {
					access_token: responseRefreshRequest.access_token,
					refresh_token: responseRefreshRequest.refresh_token,
					lang: userInfo.locale,
					flags: userInfo.flags
				});
				success(`Refresh : ${responseRefreshRequest.access_token} | ${responseRefreshRequest.refresh_token}`)
				succ++
			}

		}

		client.joins.clear();

		updateBot(client.user, {
			last_refresh: Date.now()
		})

		const msg = await message.channel.send({
			content: `**${client.emoji.load} Yenileme devam ediyor!** : \`${progress}/${users.length}\``, embeds: [
        //			content: `**${client.emoji.load} Refresh en cours** : \`${progress}/${client.config.ez}${users.length}\``, embeds: [

				{
					description: `${client.emoji.check} Basarili! : \`${succ}\`\n${client.emoji.error} Error : \`${error}\``,
					color: client.color.default,
					footer: {
						text: `ETA : ${eta.hours} heure(s), ${eta.minutes} minute(s)`
					}
				},
			]
		});

		const inter = setInterval(() => {
			msg.edit({
				content: `**${client.emoji.load} Yenileme devam ediyor!** : \`${progress}/${users.length}\``, embeds: [
					{
						description: `${client.emoji.check} Basarili : \`${succ}\`\n${client.emoji.error} Error : \`${error}\``,
						color: client.color.default,
						footer: {
							text: `ETA : ${eta.hours} heure(s), ${eta.minutes} minute(s)`
						}
					},
				]
			});
		}, 10000);


		client.refresh.set(client.user.id, true)

		for (const user of users) {
			refresh(user.refresh_token, user.id);
			progress++
			await new Promise((resolve) => setTimeout(resolve, 65));
		}

		clearInterval(inter);


		client.refresh.delete(client.user.id);

		message.channel.send({
			content: `**${client.emoji.check} Yenileme tamamlandı! **`, embeds: [
				{
					"description": `${client.emoji.check} Succès : \`${succ}\`\n${client.emoji.error} Error : \`${error}\``,
					color: client.color.green
				},
			]
		});


	}
}