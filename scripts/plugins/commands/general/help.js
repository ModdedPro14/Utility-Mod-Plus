import { Vera } from "../../../API/Vera";
import { commands } from "../../../API/handlers/command";

Vera.JAR.getPackage(Vera.Engine.new.commandPackage).unpack((cmd) => {
    cmd.setName('help')
    .setCategory('general')
    .setAliases(['?'])
    .setDescription('Provides you a list of commands or information about a command')
    .addAnyArgument((arg) => {
        arg.setName('command | page')
        .setOptional(true)
        .setCallback((sender, val) => {
            if (isNaN(val)) {
                const cmdList = commands.find(cmd => cmd.name == val || cmd.aliases.includes(val))
                if (!cmdList) return sender.sendMessage(`Cant find the command ${val}`);
                if (cmdList.permissions.mod && !sender.hasTag('mod') && !sender.hasTag('admin')) return sender.response.error(`Cant find the command ${val}`);
                else if (cmdList.permissions.admin && !sender.hasTag('admin') && !cmdList.permissions.mod) return sender.response.error(`Cant find the command ${val}`);
                let hI = `§l§4Command: §c${cmdList.name}\n`;
                if (cmdList.description.length) hI += `§4Description:§c ${cmdList.description}\n`;
                if (cmdList.aliases.length) hI += `§l§4Aliases:§c ${cmdList.aliases.join(`§4, §c`)}\n`;
                hI += `§l§4Category:§c ${cmdList.category}\n`;
                if (cmdList.developers.length) hI += `§l§4Developer(s):§c ${cmdList.developers.join('§4 | §c')}\n`;
                hI += `§l§4Usage:§4 [\n§c${cmdList.usage.join('\n')}\n§4]`;
                sender.sendMessage(`§4${hI}`);   
            } else {
                const cmdList = commands.filter(c => sender.permission.hasPermission('admin') ? true : sender.permission.hasPermission('mod') ? c.permissions.mod + !c.permissions.admin : !c.permissions.admin);
                const commandList = new Array(Math.ceil(cmdList.length / 35)).fill(0).map(_ => cmdList.splice(0, 35)), help = [], categoryHold = [];
                if (!commandList[val - 1]?.[0]) return sender.sendMessage('Unable to find this page');
                for (const command of commandList[val - 1]) {
                    if (!categoryHold.includes(command.category)) help.push(`\n§4<------──__ ${command.category[0].toUpperCase() + command.category.slice(1).toLowerCase()}§4 __──------>`);
                    categoryHold.push(command.category);
                    help.push(`§e- !${command.name} §c- ${command.description}`);
                }
                sender.sendMessage(`§l${help.join('\n')}\n§4§l<---------->\n§cPage: §a${val}§c/§a${commandList.length}\n§cUse "§4!help §4<Page Number>§c" §cTo see the next page\n§l§4<---------->`);
            }
        })
    })
    .execute((sender, args) => !args.length && cmd.executeArgument('command | page', sender, 1))  
})