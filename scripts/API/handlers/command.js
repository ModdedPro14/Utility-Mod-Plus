import { Player, world } from "@minecraft/server";
import { Vera } from "../Vera";

export class Command {
    constructor() {
        this.name = "";
        this.description = "";
        this.category = 'uncategorized';
        this.permissions = { admin: false, mod: false };
        this.developers = ["MP09"];
        this.usage = [];
        this.arguments = [];
        this.executeCallback = null;
        this.aliases = []
    }
    /**
     * Set the name of the command
     * @param {any} name The name to set
     * @returns {this}
     */
    setName(name) {
        this.name = name;
        return this;
    }
    /**
     * Set the description of the command
     * @param {any} description The description to set
     * @returns {this}
     */
    setDescription(description) {
        this.description = description;
        return this;
    }
    /**
     * Set the category of the command
     * @param {any} category The category to set
     * @returns {this}
     */
    setCategory(category) {
        this.category = category;
        return this;
    }
    /**
     * Set the permissions of the command
     * @param {{ admin: boolean, mod: boolean}} permissions The permissions to set
     * @returns {this}
     */
    setPermissions(permissions) {
        this.permissions = permissions;
        return this;
    }
    /**
     * Set the developers of the command
     * @param {any[]} developers The developers to set
     * @returns {this}
     */
    setDevelopers(developers) {
        this.developers = developers;
        return this;
    }
    /**
     * Set the aliases of the command
     * @param {any[]} aliases The aliases to set
     * @returns {this}
     */
    setAliases(aliases) {
        this.aliases = aliases
        return this
    }
    /**
     * Set the callback of the command
     * @param {(player: Player, args: any[]) => void} callback The callback to set
     * @returns {this}
     */
    execute(callback) {
        this.executeCallback = callback;
        return this;
    }
    /**
     * Adds an argument with an any type
     * @param {any} callback The callback to build the argument
     * @returns {this}
     */
    addAnyArgument(callback) {
        const argument = new Argument();
        callback(argument);
        this.arguments.push(argument);
        return this;
    }
    /**
     * Adds an argument with a number type
     * @param {any} callback The callback to build the argument
     * @returns {this}
     */
    addNumberArgument(callback) {
        const argument = new Argument().setType("number");
        callback(argument);
        this.arguments.push(argument);
        return this;
    }
    /**
     * Adds an argument with a boolean type
     * @param {any} callback The callback to build the argument
     * @returns {this}
     */
    addBooleanArgument(callback) {
        const argument = new Argument().setType("boolean");
        callback(argument);
        this.arguments.push(argument);
        return this;
    }
    /**
     * Adds an argument with a dynamic type
     * @param {any} callback The callback to build the argument
     * @returns {this}
     */
    addDynamicArgument(callback) {
        const argument = new Argument().setType("dynamic")
        callback(argument);
        this.arguments.push(argument);
        return this;
    }
    /**
     * Adds an argument with a player type
     * @param {any} callback The callback to build the argument
     * @returns {this}
     */
    addPlayerArgument(callback) {
        const argument = new Argument().setType("player")
        callback(argument);
        this.arguments.push(argument);
        return this;
    }
    /**
     * Build the usage of the command
     */
    buildUsage() {
        const dynamicArguments = this.arguments.filter(argument => argument.type === 'dynamic'), staticArguments = this.arguments.filter(argument => argument.type !== 'dynamic');
        if (staticArguments.every(argument => argument.optional)) this.usage.push(`!${this.name}`);
        const dynamicUsages = dynamicArguments.flatMap(dynamicArg => {
            const dynamicUsage = dynamicArg.optional ? `<${dynamicArg.name}: optional>` : `${dynamicArg.name}`;
            if (dynamicArg.subArguments && dynamicArg.subArguments.length > 0) {
                return dynamicArg.subArguments.map(subArg => {
                    if (subArg.type === 'dynamic') return subArg.optional ? `<${subArg.name}: optional>` : `${subArg.name}`;
                    else return subArg.optional ? `[${subArg.name}: ${subArg.type}]` : `<${subArg.name}: ${subArg.type}>`;
                }).map(subArgUsage => `${dynamicUsage} ${subArgUsage}`);
            } else return [dynamicUsage];
        });
        const staticUsages = staticArguments.flatMap(argument => {
            const staticUsage = argument.optional ? `[${argument.name}: ${argument.type}]` : `<${argument.name}: ${argument.type}>`;
            if (argument.subArguments && argument.subArguments.length > 0) return argument.subArguments.map(subArg => { return subArg.optional ? `[${subArg.name}: ${subArg.type}]` : `<${subArg.name}: ${subArg.type}>`; }).map(subArgUsage => `${staticUsage} ${subArgUsage}`);
            else return [staticUsage];
        });
        [...dynamicUsages, ...staticUsages].forEach(usage => this.usage.push(`!${this.name} ${usage}`));
    }
    /**
     * Adds sub arguments to an argument
     * @param {any} parentArgumentName The name of the parent argument to add sub arguments to
     * @param {any} callback The callback of the sub arguments
     * @returns {this}
     */
    addSubArguments(parentArgumentName, callback) {
        const parentArgument = this.arguments.find(arg => arg.name === parentArgumentName), subArguments = [], subCommand = new Command(); 
        subCommand.arguments = subArguments;
        callback(subCommand);
        parentArgument.subArguments = subArguments;
        return this;
    }
    /**
     * Executes this command
     * @param {Player} sender The sender of the command
     * @param {any[]} args The args of the command
     * @returns 
     */
    executeCommand(sender, args) {
        const parsedArgsObj = {}, processedIndices = new Set(), cleanedArgs = args;
        let dynProcessed = false, processed = 0
        for (const argument of this.arguments) {
            if (argument.type === 'dynamic') {
                const dynamicArgIndex = cleanedArgs.findIndex(arg => argument.values.includes(arg));
                processed += 1
                if (dynamicArgIndex !== -1) {
                    const subArgs = {}, subArguments = argument.subArguments ?? [];
                    for (const subArg of subArguments) {
                        const subArgIndex = dynamicArgIndex + 1 + subArguments.indexOf(subArg);
                        if (cleanedArgs[subArgIndex] && !argument.subArguments.find(sa => sa.name === cleanedArgs[subArgIndex])) {
                            let val = cleanedArgs[subArgIndex];
                            if (subArg.type === 'player') {
                                let player = Vera.JAR.getRawPackage(Vera.Engine.raw.playerPackage).type(world.getAllPlayers().filter(p => p.name.toLowerCase() == val.toLowerCase())[0]) ?? val;
                                if (val == '@s') player = sender;
                                if (!subArg.data.self && player == sender) return sender.response.error('The player argument cannot be yourself!')
                                val = player;
                            }
                            subArgs[subArg.name] = val;
                            processedIndices.add(subArgIndex);
                        }
                        if (!subArgs[subArg.name] && !subArg.optional) return sender.response.error(`No value provided for sub argument ${subArg.name}!`);
                        if (subArgs[subArg.name] && !this.checkArgumentType(subArg.type, subArgs[subArg.name], subArg, sender)) return sender.response.error(`Invalid value for sub argument ${subArg.name}!`);
                    }
                    parsedArgsObj[argument.name] = subArgs;
                    processedIndices.add(dynamicArgIndex);
                    dynProcessed = true;
                    break;
                } else if (processed >= this.arguments.length && !argument.optional) return sender.response.error(`No value provided for required argument ${argument.name}!`);
            }
        }
        if (!dynProcessed) {
            let processed = 0
            for (const argument of this.arguments) {
                if (argument.type !== 'dynamic') {
                    const argIndex = cleanedArgs.findIndex(arg => this.checkArgumentType(argument.type, arg, argument, sender));
                    processed += 1
                    if (argIndex !== -1) {
                        const subArgs = {}
                        let val = cleanedArgs[argIndex]
                        if (argument.type === 'player') {
                            let player = Vera.JAR.getRawPackage(Vera.Engine.raw.playerPackage).type(world.getAllPlayers().filter(p => p.name.toLowerCase() == val.toLowerCase())[0]) ?? val;
                            if (val == '@s') player = sender;
                            val = player;
                        }
                        const subArguments = argument.subArguments ?? [];
                        for (const subArg of subArguments) {
                            const subArgIndex = argIndex + 1 + subArguments.indexOf(subArg);
                            if (cleanedArgs[subArgIndex] && !argument.subArguments.find(sa => sa.name === cleanedArgs[subArgIndex])) {
                                let val = cleanedArgs[subArgIndex];
                                if (subArg.type === 'player') {
                                    let player = Vera.JAR.getRawPackage(Vera.Engine.raw.playerPackage).type(world.getAllPlayers().filter(p => p.name.toLowerCase() == val.toLowerCase())[0]) ?? val;
                                    if (val == '@s') player = sender;
                                    if (!subArg.data.self && player == sender) return sender.response.error('The player argument cannot be yourself!')
                                    val = player;
                                }
                                subArgs[subArg.name] = val;
                                processedIndices.add(subArgIndex)
                            }
                            if (!subArgs[subArg.name] && !subArg.optional) return sender.response.error(`No value provided for sub argument ${subArg.name}!`);
                            if (subArgs[subArg.name] && !this.checkArgumentType(subArg.type, subArgs[subArg.name], subArg, sender)) return sender.response.error(`Invalid value for sub argument ${subArg.name}!`);
                        }
                        parsedArgsObj[argument.name] = { val: val, subArgs: subArgs };
                        processedIndices.add(argIndex);
                        break;
                    } else if (processed >= this.arguments.length && !argument.optional) return sender.response.error(`No value provided for required argument ${argument.name}!`);
                }
            }
        }
        if (cleanedArgs.length > processedIndices.size) return sender.response.error(`Invaild command syntax, maybe try removing "${cleanedArgs.filter((_, index) => !processedIndices.has(index)).join(" ")}"!`);
        for (const argument of this.arguments) {
            if (argument.type === 'dynamic') {
                const dynamicArgValue = cleanedArgs.find(arg => argument.values.includes(arg));
                if (dynamicArgValue !== undefined) {
                    if (argument.callback) argument.callback(sender, dynamicArgValue, cleanedArgs.slice(cleanedArgs.indexOf(dynamicArgValue) + 1));
                    if (argument.subArguments) {
                        const subArgs = parsedArgsObj[argument.name];
                        if (subArgs && Object.keys(subArgs).length > 0) {
                            for (const subArgName in subArgs) {
                                const subArgument = argument.subArguments.find(subArg => subArg.name === subArgName);
                                if (subArgument && subArgument.callback) subArgument.callback(sender, subArgs[subArgName], cleanedArgs.slice(cleanedArgs.indexOf(subArgs[subArgName]) + 1));
                            }
                        }
                    }
                }
            } else if (parsedArgsObj.hasOwnProperty(argument.name)) {
                if (argument.callback) argument.callback(sender, parsedArgsObj[argument.name].val, cleanedArgs.slice(cleanedArgs.indexOf(parsedArgsObj[argument.name].val) + 1));
                if (argument.subArguments) {
                    const subArgs = parsedArgsObj[argument.name].subArgs;
                    if (subArgs && Object.keys(subArgs).length > 0) {
                        for (const subArgName in subArgs) {
                            const subArgument = argument.subArguments.find(subArg => subArg.name === subArgName);
                            if (subArgument && subArgument.callback) subArgument.callback(sender, subArgs[subArgName], cleanedArgs.slice(cleanedArgs.indexOf(subArgs[subArgName]) + 1));
                        }
                    }
                }
            }
        }
        if (this.executeCallback) this.executeCallback(sender, args);
    }
    /**
     * Force execute an argument in this command
     * @param {any} argument The name of the argument to execute
     * @param {Player} sender The sender of the argument
     * @param {any} value The value to force execute the argument with
     */
    executeArgument(argument, sender, value) {
        for (const arg of this.arguments) if (arg.name == argument) arg.callback(sender, value)
    }
    /**
     * Check an argument type
     * @param {"dynamic" | "number" | "boolean" | "player"} type The type of the argument
     * @param {any} value The value of the argument
     * @param {any} argument The argument
     * @returns {boolean}
     */
    checkArgumentType(type, value, argument, sender) {
        switch (type) {
            case "dynamic":
                return argument.values && argument.values.includes(value);
            case "number":
                return !isNaN(Number(value));
            case "boolean":
                return value?.toLowerCase() === "true" || value?.toLowerCase() === "false";
            case "player":
                let player = world.getAllPlayers().find(p => p.name.toLowerCase() === value.toLowerCase());
                if (value == '@s') player = sender
                if (!player) return false;                 
                if (!argument.data.self && player === sender) return false;
                return true;
            default:
                return true;
        }
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
    /**
     * Sets the name of the argument
     * @param {any} name The name to set
     * @returns {this}
     */
    setName(name) {
        this.name = name;
        return this;
    }
    /**
     * Sets the requirement of the argument 
     * @param {boolean} optional The requirement to set
     * @returns {this}
     */
    setOptional(optional) {
        this.optional = optional;
        return this;
    }
    /**
     * Sets the type of the argument
     * @param {"dynamic" | "number" | "boolean" | "player"} type The type to set
     * @returns {this}
     */
    setType(type) {
        this.type = type;
        return this;
    }
    /**
     * Sets the values of the argument (only for dynamic arguments)
     * @param {any[]} values The values to set 
     * @returns {this}
     */
    setValues(values) {
        this.values = values;
        return this;
    }
    /**
     * Sets the callback of the argument
     * @param {void} callback The callback to set 
     * @returns 
     */
    setCallback(callback) {
        this.callback = callback;
        return this;
    }
    /**
     * Sets the data of the argument (only for player arguments)
     * @param {{ self: boolean }} data The data to set
     * @returns {this}
     */
    setData(data) {
        this.data = data
        return this
    }
}
export const commands = []