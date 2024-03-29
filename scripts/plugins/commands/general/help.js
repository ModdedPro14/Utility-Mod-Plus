import config from "../../../config/main";
import { Commands } from "../../../API/handlers/command";
import { Vera } from "../../../API/Vera";

Vera.JAR.getPackage(Vera.Engine.new.commandPackage).unpack((cmd) => {
    cmd.setName('help')
    .setCategory('general')
    .setAliases(['?'])
    .setDescription('Provides you a list of commands or information about a command')
    .firstArguments(['page', 'command'], false)
    .addAnyArgument((arg) => {
        arg.setName('command')
        arg.setLength(1)
        arg.setCallback((sender, val) => {
            const cmdList = Commands.registeredCommands.find(c => c.name === val || c.aliases?.includes(val));
            if (!cmdList) return sender.response.error(`Cant find the command ${val}`);
            if (cmdList.permissions.mod && !sender.permission.hasPermission('mod') && !sender.permission.hasPermission('admin')) return sender.response.error(`Cant find the command ${val}`);
            else if (cmdList.permissions.admin && !sender.permission.hasPermission('admin') && !cmdList.permissions.mod) return sender.response.error(`Cant find the command ${val}`);
            let hI = `§l§4Command: §c${cmdList.name}\n`;
            if (cmdList.description.length) hI += `§4Description:§c ${cmdList.description}\n`;
            if (cmdList.aliases.length) hI += `§l§4Aliases:§c ${cmdList.aliases.join(`§4, §c`)}\n`;
            hI += `§l§4Category:§c ${cmdList.category}\n`;
            if (cmdList.developers.length) hI += `§l§4Developer(s):§c ${cmdList.developers.join('§4 | §c')}\n`;
            let args = [];
            cmdList.usage.forEach(arg => {
                if (arg.type == 'dyn') {
                    if (arg.beforeArgs.length) args.push(`${config.prefix}${cmdList.name} ${arg.beforeArgs.map((barg) => barg.type == 'dyn' ? barg.name : `<${barg.name}: ${barg.type}>`).join(' ')} ${arg.name}`)
                    else args.push(`${config.prefix}${cmdList.name} ${arg.name}`)
                } else {
                    if (arg.beforeArgs.length) args.push(`${config.prefix}${cmdList.name} ${arg.beforeArgs.map((barg) => barg.type == 'dyn' ? barg.name : `<${barg.name}: ${barg.type}>`).join(' ')} <${arg.name}: ${arg.type}>`)
                    else args.push(`${config.prefix}${cmdList.name} <${arg.name}: ${arg.type}>`)
                }
            })
            if (cmdList.argNames[0].length) hI += `§l§4Usage:§4 [\n§c${args.join('\n')}\n§4]`;
            sender.response.send(`§4${hI}`, true, false);
        })
    })
    .addNumberArgument((arg) => {
        arg.setName('page')
        arg.setData({ min: 0 })
        arg.setCallback((sender, page) => {
            const cmdList = Commands.registeredCommands.filter(c => sender.permission.hasPermission('admin') ? true : sender.permission.hasPermission('mod') ? c.permissions.mod + !c.permissions.admin : !c.permissions.admin);
            const commandList = new Array(Math.ceil(cmdList.length / 35)).fill(0).map(_ => cmdList.splice(0, 35)), help = [], categoryHold = [];
            if (!commandList[page - 1]?.[0]) return sender.response.error('Unable to find this page');
            for (const command of commandList[page - 1]) {
                if (!categoryHold.includes(command.category)) help.push(`\n§4<------──__ ${command.category}§4 __──------>`);
                categoryHold.push(command.category);
                help.push(`§e- ${config.prefix}${command.name} §c- ${command.description}`);
            }
            sender.response.send(`§l${help.join('\n')}\n§4§l<---------->\n§cPage: §a${page}§c/§a${commandList.length}\n§cUse "§4${config.prefix}help §4<Page Number>§c" §cTo see the next page\n§l§4<---------->`, true, false);
        })
    })
    .execute((_, args) => !args.length && cmd.forceValue('page', 1))
})