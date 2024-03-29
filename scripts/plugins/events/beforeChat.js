import { system, world } from "@minecraft/server";
import config from "../../config/main.js";
import { Vera } from "../../API/Vera.js";
import { Commands } from "../../API/handlers/command.js";

Vera.JAR.getPackage(Vera.Engine.new.commandPackage).unpack((cmd) => {
    cmd.setName('hi')
    .execute((sender) => {
        sender.response.send('hi')
    })
})

Vera.JAR.getPackage(Vera.Engine.new.eventPackage).unpack((event) => {
    event.subscribe({ event: 'chatSend', eventType: 'beforeEvents' }, (data) => {
        let message = data.message;
        const sender = Vera.JAR.getRawPackage(Vera.Engine.raw.playerPackage).type(data.sender);
        data.cancel = true;
        if (!message.startsWith(config.prefix)) {
            if (config.login && !sender.hasTag('logged')) return
            system.run(() => {
                if (sender.chat.muted && !sender.permission.hasPermission('admin'))
                    return sender.response.error('You can\'t send messages since your muted');
                if (message.trim() == '')
                    return;
                for (const w of config.chatFilteredWords) {
                    if (!sender.permission.hasPermission('admin') && message.match(/[\S]+/g).includes(w))
                        return sender.response.error('You cant say that');
                }
                if (!sender.permission.hasPermission('admin')) {
                    if (sender.score.getScore('sents') >= 3) {
                        data.cancel = true;
                        return sender.response.error('Slow down, your sending messages too quickly');
                    }
                }
                const msg = message = Object.keys(config.emojis).forEach(key => message = message.replaceAll(key, config.emojis[key])) ?? message[0].toUpperCase() + message.slice(1);
                const ranks = (plr) => `§r§8[§r${plr.chat.getRanks}§r§8]`;
                const chat = config.chatStyle.replace('$team', `${sender.getTags().find(tag => tag.startsWith('factionOwner:')) ? sender.getTags().find(tag => tag.startsWith('faction-'))?.replace('faction-', '§a') + ' §r§7- §eLeader' : sender.getTags().find(tag => tag.startsWith('faction-'))?.replace('faction-', '§a') ?? ''}`).replace('$ranks', `${config.ranks ? ranks(sender) : ''}§r`).replace('$name', `${sender.chat.getNickname ?? sender.chat.hasColor('name') ? sender.chat.colorize(sender.chat.getNickname ?? sender.name, sender.chat.getColor('name')) : sender.name}`).replace('$time', `§r§7${new Date().toLocaleTimeString().replace('-', 1)}`).replace('$msg', `${sender.chat.hasColor('chat') ? sender.chat.colorize(msg, sender.chat.getColor('chat')) : msg}`);
                if (sender.chat.inStaffChat) {
                    for (const player of world.getPlayers({ tags: ['staffChat'] })) {
                        player.response.send(`§8(§cStaff Chat§8) ${chat}`, false, false);
                    }
                }
                else if (sender.hasTag(`factionchat:${Vera.JAR.getRawPackage(Vera.Engine.raw.factionsPackage).getPlayersFaction(sender)}`)) {
                    for (const player of world.getPlayers({ tags: [`factionchat:${Vera.JAR.getRawPackage(Vera.Engine.raw.factionsPackage).getPlayersFaction(sender)}`] })) {
                        player.response.send(`§8(§aTeam Chat§8) ${chat}`, false, false);
                    }
                }
                else {
                    world.sendMessage(chat);
                }
                sender.score.addScore('sents', 1);
            });
        }
        else {
            const args = message.substring(config.prefix.length).replace(/@(?=\w{2})|@(?!s)/g, '').trim().replace(/ {2,}/g, ' ').match(/".*?"|[\S]+/g)?.map(item => item.replaceAll('"', '')) ?? [], cmd = args.shift()?.toLowerCase(), cmdData = Commands.registeredCommands.find(c => c.name === cmd || c.aliases.includes(cmd));
            system.run(() => {
                if (!cmdData)
                    return sender.response.error(`Unknown command: ${message.substring(config.prefix.length).match(/[\S]+/g)?.[0] ?? []}. Please check that the command exists and that you have permission to use it.`);
                if (config.login && !sender.hasTag('logged') && !(cmdData.name == 'login' || cmdData.name == 'register')) return
                // new CX.log({
                //     from: sender.name,
                //     translate: 'command',
                //     reason: cmdData.name,
                //     warn: false
                // });
                new Vera.Engine.new.commandPackage().runCommand(cmdData, sender, args, message)
            });
        }
    })
})