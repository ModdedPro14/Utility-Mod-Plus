import { world } from "@minecraft/server";
import { Vera } from "../Vera.js";
import config from "../../config/main.js";
const forceQ = {};
export class Commands {
    /**
     * Commands service manager
     */
    constructor() {
        this.list = Commands.registeredCommands;
        this.endQ = {};
        this.info = {
            name: '',
            category: 'uncategorized',
            permissions: { 
                admin: false, 
                mod: false 
            },
            aliases: [],
            description: 'No description',
            developers: ["MP09"],
            argNames: [[], false],
            args: {},
            cb: {},
            usage: []
        };
    }
    /**
     * Finds the type of an argument
     * @param {any} command The command
     * @param {any} nextArgs The nextArgs
     * @param {any} args The arguments 
     * @param {any} sender The sender
     * @returns 
     */
    findArgumentType(command, nextArgs, args, sender) {
        for (const arg of nextArgs) {
            if (!['dyn'].includes(command.args[arg].type))
                continue;
            const res = command.args[arg].tv[0].find((v) => args.slice(0, v.split(' ').length).join(' ') === v);
            if (res)
                return { arn: arg, tv: command.args[arg].tv[1] ? args.slice(0, command.args[arg].tv[2]) : args[0], na: command.args[arg].tv[1] ? args.slice(command.args[arg].tv[2]) : args.slice(res.split(' ').length) };
        }
        const argTypes = {};
        nextArgs.filter(a => !['dyn'].includes(command.args[a].type))?.forEach(a => Object.assign(argTypes, { [command.args[a].type]: a }));
        const allTypes = Object.keys(argTypes);
        if (allTypes.includes('plr')) {
            if (args[0] === '@s' || args[0].toLowerCase() === sender.name.toLowerCase())
                if (command.args[argTypes['plr']].tv[0]?.self ?? true)
                    return { arn: argTypes['plr'], tv: command.args[argTypes['plr']].tv[1] ? sender : Vera.JAR.getRawPackage(Vera.Engine.raw.playerPackage).offline(sender.name), na: args.slice(1) };
                else
                    return;
            const val = command.args[argTypes['plr']].tv[1] ? Vera.JAR.getRawPackage(Vera.Engine.raw.playerPackage).type(world.getAllPlayers().find(p => p.name.toLowerCase() === args[0].toLowerCase())) :  Vera.JAR.getRawPackage(Vera.Engine.raw.playerPackage).offline(args[0])
            if (val)
                return { arn: argTypes['plr'], tv: val, na: args.slice(1) };
        }
        if (allTypes.includes('num') && !isNaN(Number(args[0])) && (command.args[argTypes['num']].tv?.float ? true : !`${Number(args[0])}`.includes('.')))
            return { arn: argTypes['num'], tv: Number(args[0]), na: args.slice(1) };
        if (allTypes.includes('any') && args.length) {
            const text = command.args[argTypes['any']].tv[0] === 1 ? args[0] : args.slice(0, command.args[argTypes['any']].tv[0]);
            if (command.args[argTypes['any']].tv[1] && [].concat(text).join(' ').replace(/[\w!#$&*',.-_~§ ]/g, '') !== '')
                return;
            return { arn: argTypes['any'], tv: text, na: args.slice(command.args[argTypes['any']].tv[0]) };
        }
    }
    /**
     * Runs a command
     * @param {any} command The command to run
     * @param {any} sender The sender of the command
     * @param {any} args The arguments that the sender entred
     * @param {any} msg The message 
     * @returns 
     */
    runCommand(command, sender, args, msg) {
        if (command.permissions.mod && !sender.permission.hasPermission('mod') && !sender.permission.hasPermission('admin')) 
            return sender.response.error(`Unknown command: ${msg.substring(config.prefix.length).match(/[\S]+/g)?.[0] ?? []}. Please check that the command exists and that you have permission to use it.`);
        else if (command.permissions.admin && !sender.permission.hasPermission('admin') && !command.permissions.mod)
            return sender.response.error(`Unknown command: ${msg.substring(config.prefix.length).match(/[\S]+/g)?.[0] ?? []}. Please check that the command exists and that you have permission to use it.`);
        if (!command.argNames[0].length && args.length)
            return sender.response.error(`The command has no arguments, try removing ${args[args.length - 1]}`);
        if (command.argNames[1] && !args.length)
            if (command.argNames[0].some(a => command.args[a].type === 'plr' && (command.args[a].tv[0]?.self ?? true)))
                args = ['@s'];
            else
                return sender.response.error('There are arguments that are missing');
        const cls = {}, output = args;
        let fetchCLs = true, tries = 0, nextArgs = output;
        while (fetchCLs) {
            if (!nextArgs?.length)
                fetchCLs = false;
            if (!fetchCLs)
                continue;
            const nar = !tries ? command.argNames[0] : command.args[Object.keys(cls).reverse()[0]]?.na;
            if (!nar.length && nextArgs.length)
                return sender.response.error(`To many arguments added, try removing ${args[args.length - 1]}`);
            const type = this.findArgumentType(command, nar, nextArgs, sender), arg = type?.arn ? command.args[type.arn] : null;
            if (!arg)
                return sender.response.error(`The value you entered is incorrect`);
            if (arg.nn && !type.na.length)
                if (command.args[type.arn].na.some(a => command.args[a].type === 'plr' && (command.args[a].tv[0]?.self ?? true)))
                    Object.assign(type, { na: ['@s'] });
                else
                    return sender.response.error('There are arguments that are missing');
            if (['dyn'].includes(arg.type) && !type.tv?.length && arg.tv[1])
                return sender.response.error('You need to type a name');
            Object.assign(cls, { [type.arn]: type.tv });
            nextArgs = type.na;
            tries++;
        }
        try {
            const keys = Object.keys(cls), values = keys.map(k => cls[k]);
            if (command?.cb['callback']?.cb)
                command?.cb['callback']?.cb(sender, values);
            values.splice(0, 1);
            if (Object.keys(forceQ).includes(command.name))
                command.args[forceQ[command.name][0]].cb(sender, forceQ[command.name][1], []);
            for (let i = 0; i < keys.length; i++) {
                if (Object.keys(this.endQ).includes(command.name))
                    return this.endQ[command.name] && this.endQ[command.name](sender);
                if (command.args[keys[i]].cb)
                    command.args[keys[i]].cb(sender, cls[keys[i]], values);
                if (Object.keys(forceQ).includes(command.name))
                    command.args[forceQ[command.name][0]].cb && command.args[forceQ[command.name][0]].cb(sender, forceQ[command.name][1], values);
                values.splice(0, 1);
            }
        }
        catch (e) {
            console.warn(`${e}:${e.stack}`);
        }
        delete forceQ[command.name];
        delete this.endQ[command.name];
    }
    /**
     * Sets the name of the command
     * @param {any} name The name
     * @returns 
     */
    setName(name) {
        this.info.name = name;
        return this;
    }
    /**
     * Sets the description of the command
     * @param {*} description The description
     * @returns 
     */
    setDescription(description) {
        this.info.description = description;
        return this;
    }
    /**
     * Sets the command permissions
     * @param {{ admin: boolean | false, mod: boolean | false}} permission The permissions for the command
     * @returns 
     */
    setPermissions(permission = { admin: false, mod: false }) {
        this.info.permissions = permission;
        return this;
    }
    /**
     * Sets the aliases of the command
     * @param {any[]} aliases The aliases
     * @returns 
     */
    setAliases(aliases) {
        this.info.aliases = aliases;
        return this;
    }
    /**
     * Sets the category of the command
     * @param {any} category The category
     * @returns 
     */
    setCategory(category) {
        this.info.category = category;
        return this;
    }
    /**
     * Sets the developers of the command
     * @param {any[]} developers The developers
     * @returns 
     */
    setDevelopers(developers) {
        this.info.developers = developers;
        return this;
    }
    /**
     * Execute a callback
     * @param {any} callback The callback to execute
     * @returns 
     */
    execute(callback) {
        Object.assign(this.info.cb, { ['callback']: {
                cb: callback,
            } });
        return this;
    }
    /**
     * Forces an argument to be a value
     * @param {any} argument The argument to force 
     * @param {any} value The value
     * @returns 
     */
    forceValue(argument, value) {
        Object.assign(forceQ, { [this.info.name]: [argument, value] });
        return this;
    }
    /**
     * Sets the first arguemnts of the command
     * @param {any[]} args The arguments
     * @param {boolean} nextArgs Nextargs
     * @returns 
     */
    firstArguments(args, nextArgs) {
        let arg = [].concat(args), t = [];
        arg.forEach(a => !t.includes(a) && t.push(a));
        if (arg.length !== t.length) return;
        this.info.argNames = [arg, nextArgs ?? true];
        return this;
    }
    /**
     * Adds a dynamic type argument
     * @param {any} name The name of the argument
     * @param {any} value The value of the argument 
     * @param {any} nextArgs Nextargs
     * @param {any} needValue If the value is needed
     * @param {any} length Length
     * @param {any} needNextArgs NeedNextArgs
     * @param {{ name: string, type: 'dyn' | 'number' | 'player' | 'any'}[]?} beforeArgs The arguments before this argument
     * @returns 
     */
    addDynamicArgument() {
        const info = {
            name: '',
            beforeArgs: [],
            value: [] || '',
            nextArgs: [],
            needValue: true,
            length: 0,
            needNextArgs: true,
            callback: null
        }
        data({
            /**
             * Sets the name of the argument
             * @param {any} name The name of the argument 
             */
            setName: (name) => {
                info.name = name
            },
            /**
             * Sets the before arguments of the argument
             * @param {{ name: string, type: 'dyn' | 'number' | 'player' | 'any'}[]?} args The arguments
             */
            setBeforeArgs: (args) => {
                info.beforeArgs = args
                
            },
            /**
             * Sets value(s) of the argument
             * @param {any} value The value(s) of the argument
             */
            setValue: (value) => {
                info.value = value
            },
            /**
             * Sets the next arguments of the argument
             * @param {any[]} nextArgs The next arguments
             */
            setNextArgs: (nextArgs) => {
                info.nextArgs = nextArgs
            },
            /**
             * Sets the need next args of the argument
             * @param {boolean} needNextArgs The need next args
             */
            setNeedNextArg: (needNextArgs) => {
                info.needNextArgs = needNextArgs
                
            },
            /**
             * Sets wether the value(s) are needed or not
             * @param {boolean} needValue 
             */
            setNeedValue: (needValue) => {
                info.needValue = needValue
            },
            /**
            * Sets the length of the argument
            * @param {number} length The length
            */
            setLength: (length) => {
                info.length = length
            },
            /**
             * Sets the callback of the argument
             * @param {any} cb The callback to set
             */
            setCallback: (cb) => {
                info.callback = cb
            }
        })
        if (Object.keys(this.info.args).includes(info.name)) return;
        const v = [].concat(info.value);
        const na = [].concat(info.nextArgs ?? []);
        Object.assign(this.info.args, { [info.name]: {
                type: 'dyn',
                tv: [v, info.needValue, info.length ?? 1],
                cb: info.callback,
                na: na,
                nn: na.length ? info.needNextArgs ?? Boolean(na?.length) : false,
        }});
        if (!info.nextArgs?.length) this.info.usage.push({ name: info.name, beforeArgs: info.beforeArgs ?? [], type: 'dyn' })
        return this;
    }
    /**
     * Adds an any type argument
     * @param {any} data The data of the argument
     * @returns 
     */
    addNumberArgument(data) {
        const info = {
            name: '',
            beforeArgs: [],
            nextArgs: [],
            data: null,
            needNextArgs: true,
            callback: null
        }
        data({
            /**
             * Sets the name of the argument
             * @param {any} name The name of the argument 
             */
            setName: (name) => {
                info.name = name
            },
            /**
             * Sets the before arguments of the argument
             * @param {{ name: string, type: 'dyn' | 'number' | 'player' | 'any'}[]?} args The arguments
             */
            setBeforeArgs: (args) => {
                info.beforeArgs = args
            },
            /**
             * Sets the data of the argument
             * @param {any} dta The data
             */
            setData: (dta) => {
                info.data = dta
            },
            /**
             * Sets the next arguments of the argument
             * @param {any[]} nextArgs The next arguments
             */
            setNextArgs: (nextArgs) => {
                info.nextArgs = nextArgs
            },
            /**
             * Sets the need next args of the argument
             * @param {boolean} needNextArgs The need next args
             */
            setNeedNextArg: (needNextArgs) => {
                info.needNextArgs = needNextArgs
            },
            /**
             * Sets the callback of the argument
             * @param {any} cb The callback to set
             */
            setCallback: (cb) => {
                info.callback = cb
            }
        })
        if (Object.keys(this.info.argNames).includes(info.name)) return;
        if (info.data && info.data.min > info.data.max)
            throw console.warn(`Argument "${info.name}" from command "${this.info.name}" cannot have a min value greater than the max.`);
        const na = [].concat(info.nextArgs ?? []);
        Object.assign(this.info.args, { [info.name]: {
                type: 'num',
                tv: info.data ?? null,
                cb: info.callback,
                na: na,
                nn: na.length ? info.needNextArgs ?? Boolean(na?.length) : false
        }});
        if (!info.nextArgs?.length) this.info.usage.push({ name: info.name, beforeArgs: info.beforeArgs ?? [], type: 'number' })
        return this;
    }
     /**
     * Adds a player type argument
     * @param {any} data The data of the argument
     * @returns 
     */
    addPlayerArgument(data) {
        const info = {
            name: '',
            beforeArgs: [],
            online: true,
            nextArgs: [],
            data: {},
            needNextArg: true,
            callback: null
        }
        data({
            /**
             * Sets the name of the argument
             * @param {any} name The name of the argument 
             */
            setName: (name) => {
                info.name = name
            },
            /**
             * Sets the before arguments of the argument
             * @param {{ name: string, type: 'dyn' | 'number' | 'player' | 'any'}[]?} args The arguments
             */
            setBeforeArgs: (args) => {
                info.beforeArgs = args
            },
            /**
            * Sets if the player needs to be online
            * @param {boolean} online 
            */
            setOnline: (online) => {
                info.online = online
            },
            /**
             * Sets the data of the argument
             * @param {any} dta The data
             */
            setData: (dta) => {
                info.data = dta
            },
            /**
             * Sets the next arguments of the argument
             * @param {any[]} nextArgs The next arguments
             */
            setNextArgs: (nextArgs) => {
                info.nextArgs = nextArgs
            },
            /**
             * Sets the need next arg of the argument
             * @param {boolean} needNextArg The need next arg
             */
            setNeedNextArg: (needNextArg) => {
                info.needNextArg = needNextArg
            },
            /**
             * Sets the callback of the argument
             * @param {any} cb The callback to set
             */
            setCallback: (cb) => {
                info.callback = cb
            }
        })
        if (Object.keys(this.info.args).includes(info.name)) return;
        const na = [].concat(info.nextArgs ?? []);
        Object.assign(this.info.args, { [info.name]: {
                type: 'plr',
                tv: [info.data ?? {}, info.online ?? true],
                cb: info.callback,
                na: na,
                nn: na.length ? info.needNextArg ?? Boolean(na?.length) : false
        }});
        if (!info.nextArgs?.length) this.info.usage.push({ name: info.name, beforeArgs: info.beforeArgs ?? [], type: 'player' })
        return this;
    }
    /**
     * Adds an any type argument
     * @param {any} data The data of the argument
     * @returns 
     */
    addAnyArgument(data) {
        const info = {
            name: '',
            beforeArgs: [],
            length: 0,
            filter: {},
            nextArgs: [],
            needNextArg: true,
            callback: null
        }
        data({
            /**
             * Sets the name of the argument
             * @param {any} name The name of the argument 
             */
            setName: (name) => {
                info.name = name
            },
            /**
             * Sets the before arguments of the argument
             * @param {{ name: string, type: 'dyn' | 'number' | 'player' | 'any'}[]?} args The arguments
             */
            setBeforeArgs: (args) => {
                info.beforeArgs = args
            },
            /**
            * Sets the length of the argument
            * @param {number} length The length
            */
            setLength: (length) => {
                info.length = length
            },
            /**
             * Sets the filter of the argument
             * @param {any} filter The filter
             */
            setFilter: (filter) => {
                info.filter = filter
            },
            /**
             * Sets the next arguments of the argument
             * @param {any[]} nextArgs The next arguments
             */
            setNextArgs: (nextArgs) => {
                info.nextArgs = nextArgs
            },
            /**
             * Sets the need next arg of the argument
             * @param {boolean} needNextArg The need next arg
             */
            setNeedNextArg: (needNextArg) => {
                info.needNextArg = needNextArg
            },
            /**
             * Sets the callback of the argument
             * @param {any} cb The callback to set
             */
            setCallback: (cb) => {
                info.callback = cb
            }
        })
        if (Object.keys(this.info.args).includes(info.name)) return;
        const na = [].concat(info.nextArgs ?? []);
        Object.assign(this.info.args, { [info.name]: {
                type: 'any',
                tv: [info.length ?? 256, info.filter ?? true],
                cb: info.callback,
                na: na,
                nn: na.length ? info.needNextArg ?? Boolean(na?.length) : false,
        }});
        if (!info.nextArgs?.length) this.info.usage.push({ name: info.name, beforeArgs: info.beforeArgs ?? [], type: 'any' })
        return this
    }
    /**
     * Execute an argument callback
     * @param {any} argument The arguemnt to execute
     * @param {any} callback The callback
     * @returns 
     */
    executeArgument(argument, callback) {
        this.info.args[argument].cb = callback;
        return this;
    }
    /**
     * Register a command
     * @param {any} command The command to register 
     */
    register(command) {
        Commands.registeredCommands.push({
            name: command.info.name.toLowerCase().split(' ')[0],
            category: command.info.category[0].toUpperCase() + command.info.category.slice(1).toLowerCase(),
            permissions: command.info.permissions,
            aliases: command.info.aliases,
            description: command.info.description,
            developers: command.info.developers,
            argNames: command.info.argNames,
            args: command.info.args,
            cb: command.info.cb,
            usage: command.info.usage
        });
        return this
    }
}
Commands.registeredCommands = [];
