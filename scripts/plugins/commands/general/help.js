import { CX } from "../../../API/CX";
import config from "../../../config/main";
import { Commands } from "../../../API/handlers/command";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('help')
    .setCategory('general')
    .setAliases(['?'])
    .setDescription('Provides you a list of commands or information about a command')
    .firstArguments(['page', 'command'], false)
    .addAnyArgument('command', 1)
    .addNumberArgument('page', [], { min: 0 }),
    executes(ctx) {
        ctx.execute((_, args) => !args.length && ctx.forceValue('page', 1));
        ctx.executeArgument('command', (sender, val) => {
            const cmdList = Commands.registeredCommands.find(c => c.name === val || c.aliases?.includes(val));
            if (!cmdList) return sender.response.error(`Cant find the command ${val}`);
            if (cmdList && cmdList.admin && !sender.permission.hasPermission('admin')) return sender.response.error(`Cant find the command ${val}`);
            let hI = `§l§4Command: §c${cmdList.name}\n`;
            if (cmdList.description.length) hI += `§4Description:§c ${cmdList.description}\n`;
            if (cmdList.aliases.length) hI += `§l§4Aliases:§c ${cmdList.aliases.join(`§4, §c`)}\n`;
            hI += `§l§4Category:§c ${cmdList.category}\n`;
            if (cmdList.developers.length) hI += `§l§4Developer(s):§c ${cmdList.developers.join('§4 | §c')}\n`;
            let args = [];
            Object.keys(cmdList.args).forEach((a) => {
                if (cmdList.argNames[0].includes(a)) return;
                args.push(a);
            });
            if (cmdList.argNames[0].length) hI += `§l§4Argument(s):§c ${cmdList.name} <${cmdList.argNames[0].join(' §4|§c ')}> <${args.join(' §4|§c ')}>\n`;
            sender.response.send(`§4${hI}`, true, false);
        });
        ctx.executeArgument('page', (sender, page) => {
            const cmdList = Commands.registeredCommands.filter(c => sender.permission.hasPermission('admin') ? true : !c.admin);
            const commandList = new Array(Math.ceil(cmdList.length / 35)).fill(0).map(_ => cmdList.splice(0, 35)), help = [], categoryHold = [];
            if (!commandList[page - 1]?.[0]) return sender.response.error('Unable to find this page');
            for (const command of commandList[page - 1]) {
                if (!categoryHold.includes(command.category)) help.push(`\n§4<------──__ ${command.category}§4 __──------>`);
                categoryHold.push(command.category);
                help.push(`§e- ${config.prefix}${command.name} §c- ${command.description}`);
            }
            sender.response.send(`§l${help.join('\n')}\n§4§l<---------->\n§cPage: §a${page}§c/§a${commandList.length}\n§cUse "§4${config.prefix}help §4<Page Number>§c" §cTo see the next page\n§l§4<---------->`, true, false);
        });
    }
});
