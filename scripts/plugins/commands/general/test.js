import { Player, system } from "@minecraft/server";
import { Vera } from "../../../API/Vera";

export class Command {
    constructor() {
        this.name = "";
        this.description = "";
        this.category = 'uncategorized';
        this.permissions = { admin: false, mod: false };
        this.developers = [];
        this.usage = [];
        this.arguments = [];
        this.executeCallback = null;
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setDescription(description) {
        this.description = description;
        return this;
    }
    setCategory(category) {
        this.category = category;
        return this;
    }
    setPermissions(permissions) {
        this.permissions = permissions;
        return this;
    }
    setDevelopers(developers) {
        this.developers = developers;
        return this;
    }
    execute(callback) {
        this.executeCallback = callback;
        return this;
    }
    addAnyArgument(callback) {
        const argument = new Argument();
        callback(argument);
        this.arguments.push(argument);
        return this;
    }
    addNumberArgument(callback) {
        const argument = new Argument().setType("number");
        callback(argument);
        this.arguments.push(argument);
        return this;
    }
    addBooleanArgument(callback) {
        const argument = new Argument().setType("boolean");
        callback(argument);
        this.arguments.push(argument);
        return this;
    }
    addDynamicArgument(callback) {
        const argument = new Argument().setType("dynamic")
        callback(argument);
        this.arguments.push(argument);
        return this;
    }
    addPlayerArgument(callback) {
        const argument = new Argument().setType("player")
        callback(argument);
        this.arguments.push(argument);
        return this;
    }
    buildUsage() {
        const argumentUsages = this.arguments.map(argument => {
            if (argument.type === 'dynamic') {
                const dynamicUsage = argument.optional ? `<${argument.name}: optional>` : `${argument.name}`;
                if (argument.subArguments && argument.subArguments.length > 0) {
                    return `${dynamicUsage} ${argument.subArguments.map(subArg => {
                        if (subArg.type === 'dynamic') return subArg.optional ? `<${subArg.name}: optional>` : `${subArg.name}`
                        else return subArg.optional ? `[${subArg.name}: ${subArg.type}]` : `<${subArg.name}: ${subArg.type}>`;
                    }).join(" ")}`;
                } else return dynamicUsage;
            } else {
                if (argument.optional) return `[${argument.name}: ${argument.type}]`;
                else return `<${argument.name}: ${argument.type}>`;
            }
        });
        this.usage.push(`!${this.name}` + " " + argumentUsages.join(" "));
    }
    addSubArguments(parentArgumentName, callback) {
        const parentArgument = this.arguments.find(arg => arg.name === parentArgumentName), subArguments = [], subCommand = new Command(); 
        subCommand.arguments = subArguments;
        callback(subCommand);
        parentArgument.subArguments = subArguments;
        return this;
    }
    executeCommand(sender, args) {
        sender = Vera.JAR.getRawPackage(Vera.Engine.raw.playerPackage).type(sender)
        const parsedArgsObj = {}, processedIndices = new Set(), cleanedArgs = args
        let dynProcessed = false
        for (const argument of this.arguments) {
            if (argument.type === 'dynamic') {
                const dynamicArgIndex = cleanedArgs.findIndex(arg => argument.values.includes(arg));
                if (dynamicArgIndex !== -1) {
                    dynProcessed = true;
                    const subArgs = {}, subArguments = argument.subArguments ?? [];
                    for (const subArg of subArguments) {
                        const subArgIndex = dynamicArgIndex + 1 + subArguments.indexOf(subArg);
                        if (cleanedArgs[subArgIndex] && !argument.subArguments.find(sa => sa.name === cleanedArgs[subArgIndex])) {
                            let val = cleanedArgs[subArgIndex]
                            if (subArg.type == 'player') {
                                const player = world.getAllPlayers().filter(p => p.name.toLowerCase() == val.toLowerCase())[0] ?? val
                                if (!subArg.data.self && player == sender) return sender.sendMessage('The player argument cannot be yourself')
                                val = player
                            }
                            subArgs[subArg.name] = val
                        }
                    }
                    for (const subArg of subArguments) {
                        if (!subArgs[subArg.name] && !subArg.optional) return sender.sendMessage(`No value provided for sub-argument "${subArg.name}".`);
                        if (subArgs[subArg.name] && !this.checkArgumentType(subArg.type, subArgs[subArg.name], subArg)) return sender.sendMessage(`Invalid type for sub-argument "${subArg.name}".`);
                    }
                    parsedArgsObj[argument.name] = subArgs;
                    processedIndices.add(dynamicArgIndex);
                    for (const subArgName in subArgs) {
                        const subArgIndex = cleanedArgs.findIndex(arg => arg === subArgs[subArgName]);
                        processedIndices.add(subArgIndex);
                    }
                }
            } else {
                if (!dynProcessed) {
                    const argIndex = cleanedArgs.findIndex(arg => this.checkArgumentType(argument.type, arg, argument));
                    if (argIndex !== -1) {
                        let val = cleanedArgs[argIndex];
                        if (argument.type == 'player') {
                            const player = world.getAllPlayers().filter(p => p.name.toLowerCase() == val.toLowerCase())[0] ?? val
                            if (!argument.data.self && player == sender) return sender.sendMessage('The player argument cannot be yourself')
                            val = player
                        }
                        parsedArgsObj[argument.name] = val;
                        processedIndices.add(argIndex);
                    } else if (!argument.optional) return sender.sendMessage(`No value provided for required argument "${argument.name}".`);
                }
            }
        }
        if (cleanedArgs.length > processedIndices.size) return sender.sendMessage("Invalid command syntax. Extra arguments provided.");
        for (const argument of this.arguments) {
            if (argument.type === 'dynamic') {
                const dynamicArgValue = cleanedArgs.find(arg => argument.values.includes(arg));
                if (dynamicArgValue !== undefined) {
                    dynProcessed = true
                    if (argument.callback) argument.callback(sender, dynamicArgValue, parsedArgsObj);
                    if (argument.subArguments) {
                        if (Object.keys(parsedArgsObj[argument.name]).length > 0) {
                            for (const subArgName in parsedArgsObj[argument.name]) {
                                const subArgValue = parsedArgsObj[argument.name][subArgName], subArgument = argument.subArguments.find(subArg => subArg.name === subArgName);
                                if (subArgument && subArgument.callback) subArgument.callback(sender, subArgValue, args);
                            }
                        }
                    }
                }
            }
        }
        for (const argument of this.arguments) {
            if (dynProcessed) continue;
            if (argument.type !== 'dynamic' && parsedArgsObj.hasOwnProperty(argument.name)) {
                let argValue = parsedArgsObj[argument.name];
                if (argument.callback) argument.callback(sender, argValue, parsedArgsObj);
                if (argument.subArguments) {
                    if (Object.keys(parsedArgsObj[argument.name]).length > 0) {
                        for (const subArgName in parsedArgsObj[argument.name]) {
                            const subArgValue = parsedArgsObj[argument.name][subArgName], subArgument = argument.subArguments.find(subArg => subArg.name === subArgName);
                            if (subArgument && subArgument.callback) subArgument.callback(sender, subArgValue, args);
                        }
                    }
                }
            } else if (!dynProcessed && !argument.optional) return sender.sendMessage(`No value provided for required argument "${argument.name}".`);
        }
        this.executeCallback(sender, args);
    }
    executeArgument(argument, sender, value) {
        for (const arg of this.arguments) if (arg.name == argument) arg.callback(sender, value)
    }
    checkArgumentType(type, value, argument) {
        switch (type) {
            case "dynamic":
                return argument.values && argument.values.includes(value);
            case "number":
                return !isNaN(Number(value));
            case "boolean":
                return value?.toLowerCase() === "true" || value?.toLowerCase() === "false";
            case "player":
                if (value instanceof Player) return true
                return false
            default:
                return true;
        }
    }    
}

class CommandHandler {
    constructor(prefix) {
        this.prefix = prefix;
        this.commands = [];
    }
    register(command) {
        command.buildUsage();
        this.commands.push(command);
    }

    handle(sender, message, data) {
        if (!message.startsWith(this.prefix)) return;
        data.cancel = true
        const args = message.substring(this.prefix.length).replace(/@(?=\w{2})|@(?!s)/g, '').trim().replace(/ {2,}/g, ' ').match(/".*?"|[\S]+/g)?.map(item => item.replaceAll('"', '')) ?? [], commandName = args.shift().toLowerCase(), command = this.commands.find(cmd => cmd.name == commandName);
        if (!command) return sender.sendMessage('wrong shitty command, ur dumb');
        if (command.permissions.mod && !sender.hasTag('mod') && !sender.hasTag('admin')) return sender.sendMessage(`YOUR STUPID U CANT RUN THIS SHIT!`);
        else if (command.permissions.admin && !sender.hasTag('admin') && !command.permissions.mod) return  sender.sendMessage(`YOUR STUPID U CANT RUN THIS SHIT!`);
        command.executeCommand(sender, args);
    }
}

class Argument {
    constructor() {
        this.name = "";
        this.description = "";
        this.optional = false;
        this.type = "any"; 
        this.values = [];
        this.callback = null;
        this.data = { self: true }
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setDescription(description) {
        this.description = description;
        return this;
    }
    setOptional(optional) {
        this.optional = optional;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setValues(values) {
        this.values = values;
        return this;
    }
    setCallback(callback) {
        this.callback = callback;
        return this;
    }
    setData(data) {
        this.data = data
        return this
    }
}

import { world } from "@minecraft/server";
export const handler = new CommandHandler("!");

handler.register(
    new Command()
    .setName('test')
    .setDescription('test command')
    .addDynamicArgument((arg) => {
        arg.setName('dyn')
        .setValues(['sus'])
        .setCallback((sender) => {
            sender.sendMessage('sus')
        })
    })
    .addSubArguments('dyn', (args) => {
        args.addDynamicArgument((arg) => {
            arg.setName('sub-dyn')
            .setValues(['sub-sus'])
            .setCallback((sender) => {
                sender.sendMessage('sub-sus')
            })
        })
    })
    .execute((sender) => {
        sender.sendMessage('test')
    })
)


world.beforeEvents.chatSend.subscribe((data) => {
    system.run(() => {
        handler.handle(data.sender, data.message, data)
    })
})




const cmd = new Command()
.setName('help')
.setCategory('general')
.setDescription('Provides you a list of commands or information about a command')
.addAnyArgument((arg) => {
    arg.setName('command | page')
    .setOptional(true)
    .setCallback((sender, val) => {
        if (isNaN(val)) {
            const cmdList = handler.commands.find(cmd => cmd.name == val)
            if (!cmdList) return sender.sendMessage(`Cant find the command ${val}`);
            if (cmdList.permissions.mod && !sender.hasTag('mod') && !sender.hasTag('admin')) return sender.response.error(`Cant find the command ${val}`);
            else if (cmdList.permissions.admin && !sender.hasTag('admin') && !cmdList.permissions.mod) return sender.response.error(`Cant find the command ${val}`);
            let hI = `§l§4Command: §c${cmdList.name}\n`;
            if (cmdList.description.length) hI += `§4Description:§c ${cmdList.description}\n`;
            // if (cmdList.aliases.length) hI += `§l§4Aliases:§c ${cmdList.aliases.join(`§4, §c`)}\n`;
            hI += `§l§4Category:§c ${cmdList.category}\n`;
            if (cmdList.developers.length) hI += `§l§4Developer(s):§c ${cmdList.developers.join('§4 | §c')}\n`;
            // let args = [];
            // cmdList.usage.forEach(arg => {
            //     if (arg.type == 'dyn') {
            //         if (arg.beforeArgs.length) args.push(`${config.prefix}${cmdList.name} ${arg.beforeArgs.map((barg) => barg.type == 'dyn' ? barg.name : `<${barg.name}: ${barg.type}>`).join(' ')} ${arg.name}`)
            //         else args.push(`${config.prefix}${cmdList.name} ${arg.name}`)
            //     } else {
            //         if (arg.beforeArgs.length) args.push(`${config.prefix}${cmdList.name} ${arg.beforeArgs.map((barg) => barg.type == 'dyn' ? barg.name : `<${barg.name}: ${barg.type}>`).join(' ')} <${arg.name}: ${arg.type}>`)
            //         else args.push(`${config.prefix}${cmdList.name} <${arg.name}: ${arg.type}>`)
            //     }
            // })
            // if (cmdList.argNames[0].length)
            hI += `§l§4Usage:§4 [\n§c${cmdList.usage.join('\n')}\n§4]`;
            sender.sendMessage(`§4${hI}`);   
        } else {
            const cmdList = handler.commands.filter(c => sender.hasTag('admin') ? c.permissions.admin : !c.permissions.admin);
            const commandList = new Array(Math.ceil(cmdList.length / 35)).fill(0).map(_ => cmdList.splice(0, 35)), help = [], categoryHold = [];
            if (!commandList[val - 1]?.[0]) return sender.sendMessage('Unable to find this page');
            for (const command of commandList[val - 1]) {
                if (!categoryHold.includes(command.category)) help.push(`\n§4<------──__ ${command.category}§4 __──------>`);
                categoryHold.push(command.category);
                help.push(`§e- !${command.name} §c- ${command.description}`);
            }
            sender.sendMessage(`§l${help.join('\n')}\n§4§l<---------->\n§cPage: §a${val}§c/§a${commandList.length}\n§cUse "§4!help §4<Page Number>§c" §cTo see the next page\n§l§4<---------->`);
        }
    })
})
.execute((sender, args) => !args.length && cmd.executeArgument('command | page', sender, 1))
handler.register(cmd)