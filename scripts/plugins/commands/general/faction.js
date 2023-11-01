import { Player, world } from "@minecraft/server";
import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";
import { Area } from "../../../API/handlers/protect";
import config from "../../../config/main";

const playerRequest = {};

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('faction')
    .setDescription('Create a faction and invite players')
    .setCategory('general')
    .setAliases(['fac'])
    .firstArguments(['create', 'list', 'view', 'disband', 'kick', 'leave', 'invite', 'decline', 'accept', 'chat', 'ally', 'enemy', 'allies', 'enemies', 'top', 'sethome', 'home', 'removehome', 'claim', 'unclaim', 'bank'], false)
    .addDynamicArgument('create', [], 'create', 'name')
    .addDynamicArgument('list', [], 'list', null)
    .addDynamicArgument('view', [], 'view', 'name')
    .addDynamicArgument('disband', [], 'disband', null)
    .addDynamicArgument('kick', [], 'kick', 'player')
    .addDynamicArgument('leave', [], 'leave', null)
    .addDynamicArgument('invite', [], 'invite', 'player')
    .addDynamicArgument('decline', [], 'decline', null)
    .addDynamicArgument('accept', [], 'accept', null)
    .addDynamicArgument('chat', [], 'chat', null)
    .addDynamicArgument('ally', [], 'ally', 'faction')
    .addDynamicArgument('enemy', [], 'enemy', 'faction')
    .addDynamicArgument('allies', [], 'allies', null)
    .addDynamicArgument('enemies', [], 'enemies', null)
    .addDynamicArgument('top', [], 'top', null)
    .addDynamicArgument('sethome', [], 'sethome', null)
    .addDynamicArgument('home', [], 'home', null)
    .addDynamicArgument('removehome', [], 'removehome', null)
    .addDynamicArgument('claim', [], 'claim', null)
    .addDynamicArgument('unclaim', [], 'unclaim')
    .addDynamicArgument('bank', [], 'bank', ['withdraw', 'total', 'deposit', 'settings'])
    .addDynamicArgument('withdraw', [], 'withdraw', ['amount'])
    .addDynamicArgument('total', [{ type: 'dyn', name: 'bank' }], 'total')
    .addDynamicArgument('deposit', [], 'deposit', ['amount'])
    .addDynamicArgument('settings', [{ type: 'dyn', name: 'bank' }], 'settings')
    .addNumberArgument('amount', [{ type: 'dyn', name: 'bank' }, { type: 'dyn', name: '<withdraw | deposit>'}])
    .addPlayerArgument('player', [{ name: '<kick | invite>', type: 'dyn'}], true, null, { self: false })
    .addAnyArgument('name', [{ name: '<create | view>', type: 'dyn'}], 1)
    .addAnyArgument('faction', [{ name: '<ally | enemy>', type: 'dyn' }], 1),
    executes(ctx) {
        ctx.execute((sender, args) => {
            if (!args.length) {
                sender.response.send('Close the chat in 10 seconds')
                new CX.actionForm()
                .setTitle('Faction')
                .setBody('Choose an option:')
                .addButton('Create')
                .addButton('List')
                .addButton('View')
                .addButton('Leave')
                .addButton('Disband')
                .addButton('Invite')
                .addButton('Kick')
                .addButton('Chat')
                .addButton('Ally')
                .addButton('Enemy')
                .addButton('Enemies')
                .addButton('Allies')
                .addButton('Bank')
                .force(sender, (res) => {
                    if (res.canceled) return
                    if (res.selection == 0) {
                        new CX.modalForm()
                        .setTitle('Faction Create')
                        .addTextField('The name of the faction', 'Gooods')
                        .show(sender, (result) => {
                            if (result.canceled) return
                            if (!result.formValues[0]) return sender.response.error('You must provide a name for the faction');
                            if (CX.factions.isFactionOwner(sender)) return sender.response.error('You already created a faction');
                            if (CX.factions.isInFaction(sender)) return sender.response.error('You cant create a faction when your in a faction');
                            if (Databases.factions.has(result.formValues[0])) return sender.response.error('That faction already exists');
                            CX.factions.newFaction(result.formValues[0], sender.name);
                            sender.response.send(`Successfully created the faction §6${result.formValues[0]}`);
                            sender.addTag(`factionOwner:${result.formValues[0]}`);
                            sender.addTag(`faction-${result.formValues[0]}`);
                        })
                    } else if (res.selection == 1) {
                        const form = new CX.messageForm()
                        .setTitle('Faction List')
                        const facs = []
                        for (const fac of Databases.factions.values()) facs.push(fac)
                        if (!facs.length) return sender.response.error('There are no factions that have been created yet')
                        form.setBody(`§c----------------\nAvailable factions:\n${facs.map(f => `${f.name} - Owner: ${f.owner}`).join('\n')}\n§c----------------`)
                        .setButton1('§aOk')
                        .setButton2('§cClose')
                        .show(sender)
                    } else if (res.selection == 2) {
                        new CX.modalForm()
                        .setTitle('Faction View')
                        .addTextField('Enter the name of the faction to view:', 'Gooods')
                        .show(sender, (result) => {
                            if (result.canceled) return
                            if (!result.formValues[0]) return sender.response.error('You must type the faction name to view')
                            if (!Databases.factions.has(result.formValues[0])) return sender.response.error('That faction dosent exist');
                            const Data = Databases.factions.read(result.formValues[0]);
                            let text = '\n';
                            text += `§cName: ${Data.name} \n§r§cOwner: ${Data.owner} \n§r§cCreated at: ${Data.createdAt} \n§cMembers online: ${CX.factions.getAllMembersOnlineInAFaction(result.formValues[0])}`;
                            new CX.messageForm()
                            .setTitle(`Faction View ${result.formValues[0]}`)
                            .setBody(`§cViewing the faction §6${result.formValues[0]}:${text}`)
                            .setButton1('§aOk')
                            .setButton2('§cClose')
                            .show(sender)
                        })
                    } else if (res.selection == 3) {
                        if (CX.factions.isFactionOwner(sender)) return sender.response.error('You cant leave your own faction');
                        if (!CX.factions.isInFaction(sender)) return sender.response.error('You arent in a faction');
                        sender.response.send(`You have left the faction §6${CX.factions.getPlayersFaction(sender)}`);
                        sender.removeTag(`faction-${CX.factions.getPlayersFaction(sender)}`);
                    } else if (res.selection == 4) {
                        if (!CX.factions.isInFaction(sender)) return sender.response.error('You arent in a faction');
                        if (!CX.factions.isFactionOwner(sender)) return sender.response.error('You cant disband this faction');
                        sender.response.send(`You have disbanded the faction §6${CX.factions.getPlayersFaction(sender)}`);
                        Databases.claims.keys().forEach((k) => {
                            if (Databases.claims.read(k).owner == sender.name) Databases.claims.delete(k)
                        })
                        Databases.factions.delete(CX.factions.getPlayersOwnerFaction(sender));
                        sender.removeTag(`factionOwner:${CX.factions.getPlayersOwnerFaction(sender)}`);
                        sender.removeTag(`faction-${CX.factions.getPlayersFaction(sender)}`);
                    } else if (res.selection == 5) {
                        const players = world.getAllPlayers().filter((plr) => plr.id !== sender.id)
                        if (!players.length) return sender.response.error('There are no players to invite')
                        new CX.modalForm()
                        .setTitle('Faction Invite')
                        .addDropDown('Choose a player to invite:', players)
                        .show(sender, (result) => {
                            if (result.canceled) return
                            const { id, name } = sender;
                            const player = players[result.formValues[0]];
                            if (!player) return;
                            if (!CX.factions.isInFaction(sender)) return sender.response.error('You arent in a faction');
                            if (CX.factions.isInFaction(player)) return sender.response.error(`§6${player.name} is already in a faction`);
                            if (CX.factions.getPlayersFaction(player) == CX.factions.getPlayersFaction(sender)) return sender.response.error(`§6${player.name} is already in your faction`);
                            playerRequest[player.id] = { name, id };
                            sender.response.send(`You have sent a invite request to the player §6${player.name}`);
                            player.response.send(`§6${sender.name} §chas sent you a invite request to their faction`);
                        })
                    } else if (res.selection == 6) {
                        const players = world.getAllPlayers().filter((plr) => plr.id !== sender.id)
                        if (!players.length) return sender.response.error('There are no players online')
                        new CX.modalForm()
                        .setTitle('Faction Kick')
                        .addDropDown('Choose a player to kick from your faction:', players)
                        .show(sender, (result) => {
                            if (result.canceled) return
                            if (!CX.factions.isFactionOwner(sender)) return sender.response.error('You arent the faction owner to kick anyone');
                            const player = players[result.formValues[0]];
                            if (!player) return;
                            if (player.name == sender.name) return sender.response.error('You cant kick yourself');
                            if (CX.factions.getPlayersFaction(player) !== CX.factions.getPlayersFaction(sender)) return sender.response.error('That player isnt in your faction')
                            sender.response.send(`You have kicked the player §6${player.name} §cfrom the faction`);
                            player.removeTag(`faction-${CX.factions.getPlayersFaction(sender)}`);
                            player.response.send('You have been kicked from the faction');
                        })
                    } else if (res.selection == 7) {
                        if (!CX.factions.isInFaction(sender)) return sender.response.error('Your not in a faction');
                        if (sender.hasTag(`factionchat:${CX.factions.getPlayersFaction(sender)}`)) {
                            sender.removeTag(`factionchat:${CX.factions.getPlayersFaction(sender)}`);
                            sender.response.send('You have left your factions chat');
                        } else {
                            sender.addTag(`factionchat:${CX.factions.getPlayersFaction(sender)}`);
                            sender.response.send('You have joined your factions chat');
                        }
                    } else if (res.selection == 8) {
                        const facs = []
                        for (const fac of Databases.factions.keys()) facs.push(fac)
                        facs.filter((k) => k !== CX.factions.getPlayersFaction(sender))
                        if (!facs.length) return sender.response.error('There are no factions that have been created')
                        new CX.modalForm()
                        .setTitle('Faction Ally')
                        .addDropDown('Choose a faction to add as an ally:', facs)
                        .show(sender, (result) => {
                            if (result.canceled) return
                            const fac = facs[result.formValues[0]]
                            if (!CX.factions.isFactionOwner(sender)) return sender.response.error('You arent the faction owner to add an ally');
                            if (!fac) return sender.response.error('You must type a factions name to add as an ally')
                            const faction = CX.factions.getPlayersFaction(sender)
                            if (Databases.factions.read(faction).enemies.includes(args[0])) return sender.response.error('You cant add this faction as an ally since its an enemy')
                            if (Databases.factions.read(faction).allies.includes(args[0])) {
                                const data = Databases.factions.read(faction)
                                data.allies.forEach((f, i) => {
                                    if (f == fac) data.allies.splice(i) 
                                })
                                Databases.factions.write(data.name, {
                                    name: data.name,
                                    createdAt: data.createdAt,
                                    owner: data.owner,
                                    allies: data.allies,
                                    enemies: data.enemies,
                                    home: data.home,
                                    bank: {
                                        total: data.bank.total,
                                        withdrawPerDay: data.bank.withdrawPerDay,
                                        withrdawlTimeOut: data.bank.withrdawlTimeOut,
                                        timedOutMembers: data.bank.timedOutMembers
                                    }
                                });
                                sender.response.send(`Successfully removed ${fac} from the allies`)
                            } else {
                                const data = Databases.factions.read(faction)
                                data.allies.push(fac)
                                Databases.factions.write(data.name, {
                                    name: data.name,
                                    createdAt: data.createdAt,
                                    owner: data.owner,
                                    allies: data.allies,
                                    enemies: data.enemies,
                                    home: data.home,
                                    bank: {
                                        total: data.bank.total,
                                        withdrawPerDay: data.bank.withdrawPerDay,
                                        withrdawlTimeOut: data.bank.withrdawlTimeOut,
                                        timedOutMembers: data.bank.timedOutMembers
                                    }
                                });
                                sender.response.send(`Successfully added ${fac} as an ally`)
                            }
                        })
                    } else if (res.selection == 9) {
                        const facs = []
                        for (const fac of Databases.factions.keys()) facs.push(fac)
                        facs.filter((k) => k !== CX.factions.getPlayersFaction(sender))
                        if (!facs.length) return sender.response.error('There are no factions that have been created')
                        new CX.modalForm()
                        .setTitle('Faction Enemy')
                        .addDropDown('Choose a faction to add as an enemy:', facs)
                        .show(sender, (result) => {
                            if (result.canceled) return
                            const fac = facs[result.formValues[0]]
                            if (!CX.factions.isFactionOwner(sender)) return sender.response.error('You arent the faction owner to add an enemy');
                            if (!fac) return sender.response.error('You must type a factions name to add as an enemy')
                            const faction = CX.factions.getPlayersFaction(sender)
                            if (Databases.factions.read(faction).allies.includes(fac)) return sender.response.error('You cant add this faction as an enemy since its an ally')
                            if (Databases.factions.read(faction).enemies.includes(fac)) {
                                const data = Databases.factions.read(faction)
                                data.enemies.splice(data.allies.indexOf(fac), data.allies.indexOf(fac))
                                Databases.factions.write(data.name, {
                                    name: data.name,
                                    createdAt: data.createdAt,
                                    owner: data.owner,
                                    allies: data.allies,
                                    enemies: data.enemies,
                                    home: data.home,
                                    bank: {
                                        total: data.bank.total,
                                        withdrawPerDay: data.bank.withdrawPerDay,
                                        withrdawlTimeOut: data.bank.withrdawlTimeOut,
                                        timedOutMembers: data.bank.timedOutMembers
                                    }
                                });
                                sender.response.send(`Successfully removed ${fac} from the enemies`)
                            } else {
                                const data = Databases.factions.read(faction)
                                data.enemies.push(fac)
                                Databases.factions.write(data.name, {
                                    name: data.name,
                                    createdAt: data.createdAt,
                                    owner: data.owner,
                                    allies: data.allies,
                                    enemies: data.enemies,
                                    home: data.home,
                                    bank: {
                                        total: data.bank.total,
                                        withdrawPerDay: data.bank.withdrawPerDay,
                                        withrdawlTimeOut: data.bank.withrdawlTimeOut,
                                        timedOutMembers: data.bank.timedOutMembers
                                    }
                                });
                                sender.response.send(`Successfully added ${fac} as an enemy`)
                            }
                        })
                    } else if (res.selection == 10) {
                        if (!CX.factions.isInFaction(sender)) return sender.response.error('You are not in a faction')
                        const enemies = []
                        for (const fac of Databases.factions.read(CX.factions.getPlayersFaction(sender)).enemies) enemies.push(fac)
                        if (!enemies.length) return sender.response.error('There are no enemies that are in your faction')
                        new CX.messageForm()
                        .setTitle('Faction Enemies')
                        .setBody(`§c----------------\nFaction Enemies:\n${enemies.map(f => `${f}`).join('\n')}\n§c----------------`)
                        .setButton1('§aOk')
                        .setButton2('§cClose')
                        .show(sender)
                    } else if (res.selection == 11) {
                        if (!CX.factions.isInFaction(sender)) return sender.response.error('You are not in a faction')
                        const allies = []
                        for (const fac of Databases.factions.read(CX.factions.getPlayersFaction(sender)).allies) allies.push(fac)
                        if (!allies.length) return sender.response.error('There are no allies that are in your faction')
                        new CX.messageForm('Faction Allies')
                        .setBody(`§c----------------\nFaction Allies:\n${allies.map(f => `${f}`).join('\n')}\n§c----------------`)
                        .setButton1('§aOk')
                        .setButton2('§cClose')
                        .show(sender)
                    } else if (res.selection == 12) {
                        new CX.actionForm()
                        .setTitle('Faction Bank')
                        .setBody('Choose an option:')
                        .addButton('Withdraw')
                        .addButton('Total')
                        .addButton('Deposit')
                        .addButton('Settings')
                        .show(sender, (result) => {
                            if (result.canceled) return
                            if (result.selection == 0) {
                                new CX.modalForm()
                                .setTitle('Faction Bank Withdraw')
                                .addTextField('The amount to withdraw:', '100')
                                .show(sender, (ress) => {
                                    if (!CX.factions.isInFaction(sender)) return sender.response.error('You are not in a faction')
                                    const data = Databases.factions.read(CX.factions.getPlayersFaction(sender))
                                    if (!ress.formValues[0] || isNaN(ress.formValues[0])) return sender.response.error('The amount must be a number') 
                                    for (let i = 0; i < data.bank.timedOutMembers.length; i++) {
                                        let dta = data.bank.timedOutMembers[i]
                                        if (dta.id == sender.id) {
                                            if ((parseInt(dta.expires, 16)) < Date.now()) data.bank.timedOutMembers.splice(i, i)
                                            else return sender.response.error(`You must wait: ${CX.extra.parseTime(parseInt(dta.expires, 16) - new Date().getTime())}, before withdrawing again`)
                                        }
                                    }
                                    if (ress.formValues[0] > data.bank.withdrawPerDay) return sender.response.error(`You cannot withdraw over ${data.bank.withdrawPerDay}`)
                                    if (data.bank.total < ress.formValues[0]) return sender.response.error('The ban dosent have enough balance to withdraw that amount')
                                    sender.score.addScore(config.currency, args[0])
                                    sender.response.send(`You have withdrawed ${args[0]} from your factions bank`)
                                    if (!CX.factions.isFactionOwner(sender)) data.bank.timedOutMembers.push({ id: sender.id, expires: (new Date().getTime() + (data.bank.withrdawlTimeOut * 3.6e+6)).toString(16) })
                                    Databases.factions.write(data.name, {
                                        name: data.name,
                                        createdAt: data.createdAt,
                                        owner: data.owner,
                                        allies: data.allies,
                                        enemies: data.enemies,
                                        home: data.home,
                                        bank: {
                                            total: data.bank.total - ress.formValues[0],
                                            withdrawPerDay: data.bank.withdrawPerDay,
                                            withrdawlTimeOut: data.bank.withrdawlTimeOut,
                                            timedOutMembers: data.bank.timedOutMembers
                                        }
                                    });
                                })
                            } else if (result.selection == 1) {
                                if (!CX.factions.isInFaction(sender)) return sender.response.error('You are not in a faction')
                                sender.response.send(`Bank Balanace: $${CX.extra.parseNumber(Databases.factions.read(CX.factions.getPlayersFaction(sender)).bank.total)}`)
                            } else if (result.selection == 2) {
                                new CX.modalForm()
                                .setTitle('Faction Bank Deposit')
                                .addTextField('The amount to deposit:', '2144')
                                .show(sender, (ress) => {
                                    if (ress.canceled) return
                                    if (!ress.formValues[0] || isNaN(ress.formValues[0])) return sender.response.error('The amount must be a number')
                                    if (!CX.factions.isInFaction(sender)) return sender.response.error('You are not in a faction')
                                    if (!CX.factions.isFactionOwner(sender)) return sender.response.error('Your not the faction owner to deposit to the bank');
                                    const data = Databases.factions.read(CX.factions.getPlayersFaction(sender))
                                    if (ress.formValues[0] > sender.score.getScore(config.currency)) return sender.response.error(`You do not have enough ${config.currency} to deposit to the bank`)
                                    Databases.factions.write(data.name, {
                                        name: data.name,
                                        createdAt: data.createdAt,
                                        owner: data.owner,
                                        allies: data.allies,
                                        enemies: data.enemies,
                                        home: data.home,
                                        bank: {
                                            total: data.bank.total + ress.formValues[0],
                                            withdrawPerDay: data.bank.withdrawPerDay,
                                            withrdawlTimeOut: data.bank.withrdawlTimeOut,
                                            timedOutMembers: data.bank.timedOutMembers
                                        }
                                    });
                                    sender.score.removeScore(config.currency, ress.formValues[0])
                                    sender.response.send(`You have deposited ${CX.extra.parseNumber(ress.formValues[0])} to the bank`)
                                })
                            } else if (result.selection == 3) {
                                if (!CX.factions.isInFaction(sender)) return sender.response.error('You are not in a faction')
                                if (!CX.factions.isFactionOwner(sender)) return sender.response.error('Your not the faction owner to edit the bank settings');
                                const data = Databases.factions.read(CX.factions.getPlayersFaction(sender))
                                new CX.modalForm()
                                .setTitle('Faction Bank Settings')
                                .addTextField('The amount that the player can withdraw each time:', `100`, `${data.bank.withdrawPerDay}`)
                                .addDropDown(`The timeout of the withdrawl once a member withdraws: (current: ${data.bank.withrdawlTimeOut} hours)`, ['None', '24 hours', '48 hours'])
                                .show(sender, (ress) => {
                                    if (ress.canceled) return
                                    if (isNaN(ress.formValues[0])) return sender.response.error('The amount must be a number')
                                    if (ress.formValues[0] < 100) return sender.response.error('The amount cant be less than 100')
                                    if (ress.formValues[1] == 1) {
                                        Databases.factions.write(data.name, {
                                            name: data.name,
                                            createdAt: data.createdAt,
                                            owner: data.owner,
                                            allies: data.allies,
                                            enemies: data.enemies,
                                            home: data.home,
                                            bank: {
                                                total: data.bank.total,
                                                withdrawPerDay: Number(ress.formValues[0]),
                                                withrdawlTimeOut: 24,
                                                timedOutMembers: data.bank.timedOutMembers
                                            }
                                        });
                                    } else if (ress.formValues[1] == 2) {
                                        Databases.factions.write(data.name, {
                                            name: data.name,
                                            createdAt: data.createdAt,
                                            owner: data.owner,
                                            allies: data.allies,
                                            enemies: data.enemies,
                                            home: data.home,
                                            bank: {
                                                total: data.bank.total,
                                                withdrawPerDay: Number(ress.formValues[0]),
                                                withrdawlTimeOut: 48,
                                                timedOutMembers: data.bank.timedOutMembers
                                            }
                                        });
                                    } else {
                                        Databases.factions.write(data.name, {
                                            name: data.name,
                                            createdAt: data.createdAt,
                                            owner: data.owner,
                                            allies: data.allies,
                                            enemies: data.enemies,
                                            home: data.home,
                                            bank: {
                                                total: data.bank.total,
                                                withdrawPerDay: Number(ress.formValues[0]),
                                                withrdawlTimeOut: data.bank.withrdawlTimeOut,
                                                timedOutMembers: data.bank.timedOutMembers
                                            }
                                        });
                                    }
                                    sender.response.send('Successfully edited the factions bank settings')
                                })
                            }
                        })
                    }
                }, 220)
            }
        });
        ctx.executeArgument('create', (sender, _, args) => {
            if (!args[0]) return sender.response.error('You must provide a name for the faction');
            if (CX.factions.isFactionOwner(sender)) return sender.response.error('You already created a faction');
            if (CX.factions.isInFaction(sender)) return sender.response.error('You cant create a faction when your in a faction');
            if (Databases.factions.has(args[0])) return sender.response.error('That faction already exists');
            CX.factions.newFaction(args[0], sender.name);
            sender.response.send(`Successfully created the faction §6${args[0]}`);
            sender.addTag(`factionOwner:${args[0]}`);
            sender.addTag(`faction-${args[0]}`);
        });
        ctx.executeArgument('list', (sender) => {
            const facs = []
            for (const fac of Databases.factions.values()) facs.push(fac)
            if (!facs.length) return sender.response.error('There are no factions that have been created yet')
            sender.response.send(`§c----------------\nAvailable factions:\n${facs.map(f => `${f.name} - Owner: ${f.owner}`).join('\n')}\n§c----------------`, true, false);
        });
        ctx.executeArgument('view', (sender, _, args) => {
            if (!Databases.factions.has(args[0])) return sender.response.error('That faction dosent exist');
            const Data = Databases.factions.read(args[0]);
            let text = '\n';
            text += `§cName: ${Data.name} \n§r§cOwner: ${Data.owner} \n§r§cCreated at: ${Data.createdAt} \n§cMembers online: ${CX.factions.getAllMembersOnlineInAFaction(args[0])}`;
            sender.response.send(`§cViewing the faction §6${args[0]}:${text}`, true, false);
        });
        ctx.executeArgument('leave', (sender) => {
            if (CX.factions.isFactionOwner(sender)) return sender.response.error('You cant leave your own faction');
            if (!CX.factions.isInFaction(sender)) return sender.response.error('You arent in a faction');
            sender.response.send(`You have left the faction §6${CX.factions.getPlayersFaction(sender)}`);
            sender.removeTag(`faction-${CX.factions.getPlayersFaction(sender)}`);
        });
        ctx.executeArgument('disband', (sender) => {
            if (!CX.factions.isInFaction(sender)) return sender.response.error('You arent in a faction');
            if (!CX.factions.isFactionOwner(sender)) return sender.response.error('You cant disband this faction');
            sender.response.send(`You have disbanded the faction §6${CX.factions.getPlayersFaction(sender)}`);
            Databases.claims.keys().forEach((k) => {
                if (Databases.claims.read(k).owner == sender.name) Databases.claims.delete(k)
            })
            Databases.factions.delete(CX.factions.getPlayersOwnerFaction(sender));
            sender.removeTag(`factionOwner:${CX.factions.getPlayersOwnerFaction(sender)}`);
            sender.removeTag(`faction-${CX.factions.getPlayersFaction(sender)}`);
        });
        ctx.executeArgument('invite', (sender, _, args) => {
            const { id, name } = sender;
            const player = args[0];
            if (!player) return;
            if (!CX.factions.isInFaction(sender)) return sender.response.error('You arent in a faction');
            if (CX.factions.isInFaction(player)) return sender.response.error(`§6${player.name} is already in a faction`);
            if (CX.factions.getPlayersFaction(player) == CX.factions.getPlayersFaction(sender)) return sender.response.error(`§6${player.name} is already in your faction`);
            playerRequest[player.id] = { name, id };
            sender.response.send(`You have sent a invite request to the player §6${player.name}`);
            player.response.send(`§6${sender.name} §chas sent you a invite request to their faction`);
        });
        ctx.executeArgument('accept', (sender) => {
            const { id, name } = sender;
            if (!playerRequest.hasOwnProperty(id)) return sender.response.error('You dont have any requests');
            const { id: requesterId, name: requesterName } = playerRequest[id];
            const requester = world.getAllPlayers().find(({ id }) => id === requesterId);
            if (!requester) return sender.response.error(`Cant find the player: ${requesterName}`);
            requester.response.send(`§6${name}§c has accepted your invite`);
            delete playerRequest[id];
            sender.addTag(`faction-${CX.factions.getPlayersFaction(requester)}`);
            sender.response.send(`You have joined §6${name}'s §cfaction`);
        });
        ctx.executeArgument('decline', (sender) => {
            const { id } = sender;
            if (!playerRequest.hasOwnProperty(id)) return sender.response.error('You dont have any requests');
            const { id: requesterId, name: requesterName } = playerRequest[id];
            const requester = world.getAllPlayers().find(({ id }) => id === requesterId);
            if (!requester) return sender.response.error(`Cant find the player: ${requesterName}`);
            requester.response.send(`§6${sender.name} §chas declined your invite`);
            sender.response.send(`You have declined §6${requesterName}'s §cinvite`);
            delete playerRequest[id];
        });
        ctx.executeArgument('kick', (sender, _, args) => {
            if (!CX.factions.isFactionOwner(sender)) return sender.response.error('You arent the faction owner to kick anyone');
            const player = args[0];
            if (!player) return;
            if (player.name == sender.name) return sender.response.error('You cant kick yourself');
            if (CX.factions.getPlayersFaction(player) !== CX.factions.getPlayersFaction(sender)) return sender.response.error('That player isnt in your faction')
            sender.response.send(`You have kicked the player §6${player.name} §cfrom the faction`);
            player.removeTag(`faction-${CX.factions.getPlayersFaction(sender)}`);
            player.response.send('You have been kicked from the faction');
        });
        ctx.executeArgument('chat', (sender) => {
            if (!CX.factions.isInFaction(sender)) return sender.response.error('Your not in a faction');
            if (sender.hasTag(`factionchat:${CX.factions.getPlayersFaction(sender)}`)) {
                sender.removeTag(`factionchat:${CX.factions.getPlayersFaction(sender)}`);
                sender.response.send('You have left your factions chat');
            } else {
                sender.addTag(`factionchat:${CX.factions.getPlayersFaction(sender)}`);
                sender.response.send('You have joined your factions chat');
            }
        });
        ctx.executeArgument('ally', (sender, _, args) => {
            if (!CX.factions.isFactionOwner(sender)) return sender.response.error('You arent the faction owner to add an ally');
            if (!args[0]) return sender.response.error('You must type a factions name to add as an ally')
            const faction = CX.factions.getPlayersFaction(sender)
            if (faction == args[0]) return sender.response.error('You cant add your own faction as an ally')
            if (!Databases.factions.has(args[0])) return sender.response.error('You must type in a an actual faction')
            if (Databases.factions.read(faction).enemies.includes(args[0])) return sender.response.error('You cant add this faction as an ally since its an enemy')
            if (Databases.factions.read(faction).allies.includes(args[0])) {
                const data = Databases.factions.read(faction)
                data.allies.forEach((f, i) => {
                    if (f == args[0]) data.allies.splice(i) 
                })
                Databases.factions.write(data.name, {
                    name: data.name,
                    createdAt: data.createdAt,
                    owner: data.owner,
                    allies: data.allies,
                    enemies: data.enemies,
                    home: data.home,
                    bank: {
                        total: data.bank.total,
                        withdrawPerDay: data.bank.withdrawPerDay,
                        withrdawlTimeOut: data.bank.withrdawlTimeOut,
                        timedOutMembers: data.bank.timedOutMembers
                    }
                });
                sender.response.send(`Successfully removed ${args[0]} from the allies`)
            } else {
                const data = Databases.factions.read(faction)
                data.allies.push(args[0])
                Databases.factions.write(data.name, {
                    name: data.name,
                    createdAt: data.createdAt,
                    owner: data.owner,
                    allies: data.allies,
                    enemies: data.enemies,
                    home: data.home,
                    bank: {
                        total: data.bank.total,
                        withdrawPerDay: data.bank.withdrawPerDay,
                        withrdawlTimeOut: data.bank.withrdawlTimeOut,
                        timedOutMembers: data.bank.timedOutMembers
                    }
                });
                sender.response.send(`Successfully added ${args[0]} as an ally`)
            }
        })
        ctx.executeArgument('enemy', (sender, _, args) => {
            if (!CX.factions.isFactionOwner(sender)) return sender.response.error('You arent the faction owner to add an enemy');
            if (!args[0]) return sender.response.error('You must type a factions name to add as an enemy')
            const faction = CX.factions.getPlayersFaction(sender)
            if (faction == args[0]) return sender.response.error('You cant add your own faction as an enemy')
            if (!Databases.factions.has(args[0])) return sender.response.error('You must type in a an actual faction')
            if (Databases.factions.read(faction).allies.includes(args[0])) return sender.response.error('You cant add this faction as an enemy since its an ally')
            if (Databases.factions.read(faction).enemies.includes(args[0])) {
                const data = Databases.factions.read(faction)
                data.enemies.splice(data.allies.indexOf(args[0]), data.allies.indexOf(args[0]))
                Databases.factions.write(data.name, {
                    name: data.name,
                    createdAt: data.createdAt,
                    owner: data.owner,
                    allies: data.allies,
                    enemies: data.enemies,
                    home: data.home,
                    bank: {
                        total: data.bank.total,
                        withdrawPerDay: data.bank.withdrawPerDay,
                        withrdawlTimeOut: data.bank.withrdawlTimeOut,
                        timedOutMembers: data.bank.timedOutMembers
                    }
                });
                sender.response.send(`Successfully removed ${args[0]} from the enemies`)
            } else {
                const data = Databases.factions.read(faction)
                data.enemies.push(args[0])
                Databases.factions.write(data.name, {
                    name: data.name,
                    createdAt: data.createdAt,
                    owner: data.owner,
                    allies: data.allies,
                    enemies: data.enemies,
                    home: data.home,
                    bank: {
                        total: data.bank.total,
                        withdrawPerDay: data.bank.withdrawPerDay,
                        withrdawlTimeOut: data.bank.withrdawlTimeOut,
                        timedOutMembers: data.bank.timedOutMembers
                    }
                });
                sender.response.send(`Successfully added ${args[0]} as an enemy`)
            }
        })
        ctx.executeArgument('enemies', (sender) => {
            if (!CX.factions.isInFaction(sender)) return sender.response.error('You are not in a faction')
            const enemies = []
            for (const fac of Databases.factions.read(CX.factions.getPlayersFaction(sender)).enemies) enemies.push(fac)
            if (!enemies.length) return sender.response.error('There are no enemies that are in your faction')
            sender.response.send(`§c----------------\nFaction Enemies:\n${enemies.map(f => `${f}`).join('\n')}\n§c----------------`, true, false);
        })
        ctx.executeArgument('allies', (sender) => {
            if (!CX.factions.isInFaction(sender)) return sender.response.error('You are not in a faction')
            const allies = []
            for (const fac of Databases.factions.read(CX.factions.getPlayersFaction(sender)).allies) allies.push(fac)
            if (!allies.length) return sender.response.error('There are no allies that are in your faction')
            sender.response.send(`§c----------------\nFaction Allies:\n${allies.map(f => `${f}`).join('\n')}\n§c----------------`, true, false);
        })
        ctx.executeArgument('top', (sender) => {
            const facs = []
            let lb = []
            for (const fac of Databases.factions.values()) facs.push(fac)
            if (!facs.length) return sender.response.error('There are no factions that have been created yet')
            facs.forEach((fac) => {
                let kills = 0
                world.scoreboard.getObjective('kills').getParticipants().forEach((p) => {
                    if (!p.getEntity() instanceof Player) return
                    if (CX.factions.getPlayersFaction(p.getEntity()) == fac.name) kills += CX.scoreboard.get(p.getEntity(), 'kills')
                })
                lb.push({ fac: fac.name, owner: fac.owner, kills: kills })
            })
            lb = lb.sort((a, b) => b.kills - a.kills).map((s, i) => `§b#${++i} §c${s.fac} - Owner: ${s.owner}`)
            if (!lb.length) return sender.response.error('There are no top factions yet')
            lb = lb.slice(0, 5);
            sender.response.send(`§c----------------\nTop Factions:\n${lb.join('\n')}\n§c----------------`, true, false);
        })
        ctx.executeArgument('sethome', (sender) => {
            if (!config.factionHomes) return sender.response.error('Faction homes arent enabled in this server')
            if (!CX.factions.isFactionOwner(sender)) return sender.response.error('You arent the faction owner to set the home of the faction');
            const data = Databases.factions.read(CX.factions.getPlayersFaction(sender))
            if (data.home) return sender.response.error('The home of the faction is already set')
            Databases.factions.write(data.name, {
                name: data.name,
                createdAt: data.createdAt,
                owner: data.owner,
                allies: data.allies,
                enemies: data.enemies,
                home: { location: sender.location, dimension: sender.dimension.id },
                bank: {
                    total: data.bank.total,
                    withdrawPerDay: data.bank.withdrawPerDay,
                    withrdawlTimeOut: data.bank.withrdawlTimeOut,
                    timedOutMembers: data.bank.timedOutMembers
                }
            });
            sender.response.send('Successfully set the home of the faction at your location')
        })
        ctx.executeArgument('home', (sender) => {
            if (!config.factionHomes) return sender.response.error('Faction homes arent enabled in this server')
            if (!CX.factions.isInFaction(sender)) return sender.response.error('You are not in any faction')
            const data = Databases.factions.read(CX.factions.getPlayersFaction(sender))
            if (!data.home) return sender.response.error('The faction does not have a home set yet')
            sender.teleport(data.home.location, { dimension: world.getDimension(data.home.dimension) })
            sender.response.send('You have been teleported to your factions home')
        })
        ctx.executeArgument('removehome', (sender) => {
            if (!config.factionHomes) return sender.response.error('Faction homes arent enabled in this server')
            if (!CX.factions.isFactionOwner(sender)) return sender.response.error('You arent the faction owner to remove the home of the faction');
            const data = Databases.factions.read(CX.factions.getPlayersFaction(sender))
            if (!data.home) return sender.response.error('There isnt a home set for the faction')
            Databases.factions.write(data.name, {
                name: data.name,
                createdAt: data.createdAt,
                owner: data.owner,
                allies: data.allies,
                enemies: data.enemies,
                home: undefined,
                bank: {
                    total: data.bank.total,
                    withdrawPerDay: data.bank.withdrawPerDay,
                    withrdawlTimeOut: data.bank.withrdawlTimeOut,
                    timedOutMembers: data.bank.timedOutMembers
                }
            });
            sender.response.send('Successfully removed the factions home')
        })
        ctx.executeArgument('claim', (sender) => {
            if (!config.claims) return sender.response.error('Claims arent enabled in this server');
            if (!CX.factions.isInFaction(sender)) return sender.response.error('You arent even in a faction');
            if (!CX.factions.isFactionOwner(sender)) return sender.response.error('Your not the faction owner to set the claim of the faction');
            if (sender.score.getScore(config.currency) < config.claimCost) return sender.response.error(`You need ${config.claimCost - sender.score.getScore(config.currency)} ${config.currency} to buy a claim`);
            if (Area.as(sender, [sender.location.x, sender.location.z]).isInArea) return sender.response.error('You cannot set a claim here');
            const chunk = CX.factions.getChunk(sender);
            if (sender.name == CX.factions.getClaimOwner(`${chunk[0]}_${chunk[1]}`)) return sender.response.error('This chunk is already claimed by your faction');
            if (CX.factions.isChunkClaimed(`${chunk[0]}_${chunk[1]}`)) return sender.response.error(`This chunk is already claimed by: ${CX.factions.getClaimOwner(CX.factions.getChunk(sender))}`);
            const spawn = Databases.server.read('spawn');
            if (Databases.server.has('spawn') && Array.from(sender.dimension.getEntities({ type: 'minecraft:player', location: spawn.location, maxDistance: Number(config.spawnRaduis) })).some(plr => plr.id === sender.id)) return sender.response.error(`You have to be further than ${config.spawnRaduis} blocks from spawn`);
            CX.factions.newClaim(sender, `${chunk[0]}_${chunk[1]}`);
            sender.response.send('Successfully claimed this chunk');
        });
        ctx.executeArgument('unclaim', (sender) => {
            if (!config.claims) return sender.response.error('Claims arent enabled in this server');
            if (!CX.factions.isInFaction(sender)) return sender.response.error('You arent even in a faction');
            if (!CX.factions.isFactionOwner(sender)) return sender.response.error('Your not the faction owner unclaim a claim of the faction');
            const chunk = CX.factions.getChunk(sender);
            if (sender.name != CX.factions.getClaimOwner(`${chunk[0]}_${chunk[1]}`) && !sender.permission.hasPermission('admin')) return sender.response.error('This chunk is not claimed by your faction');
            if (!CX.factions.isChunkClaimed(`${chunk[0]}_${chunk[1]}`)) return sender.response.error('That chunk is already not claimed');
            CX.factions.unclaim(`${chunk[0]}_${chunk[1]}`);
            sender.response.send('Successfully unclaimed this chunk');
        });
        ctx.executeArgument('withdraw', (sender, _, args) => {
            if (!CX.factions.isInFaction(sender)) return sender.response.error('You are not in a faction')
            const data = Databases.factions.read(CX.factions.getPlayersFaction(sender))
            for (let i = 0; i < data.bank.timedOutMembers.length; i++) {
                let dta = data.bank.timedOutMembers[i]
                if (dta.id == sender.id) {
                    if ((parseInt(dta.expires, 16)) < Date.now()) data.bank.timedOutMembers.splice(i, i)
                    else return sender.response.error(`You must wait: ${CX.extra.parseTime(parseInt(dta.expires, 16) - new Date().getTime())}, before withdrawing again`)
                }
            }
            if (args[0] > data.bank.withdrawPerDay) return sender.response.error(`You cannot withdraw over ${data.bank.withdrawPerDay}`)
            if (data.bank.total < args[0]) return sender.response.error('The ban dosent have enough balance to withdraw that amount')
            sender.score.addScore(config.currency, args[0])
            sender.response.send(`You have withdrawed ${args[0]} from your factions bank`)
            if (!CX.factions.isFactionOwner(sender)) data.bank.timedOutMembers.push({ id: sender.id, expires: (new Date().getTime() + (data.bank.withrdawlTimeOut * 3.6e+6)).toString(16) })
            Databases.factions.write(data.name, {
                name: data.name,
                createdAt: data.createdAt,
                owner: data.owner,
                allies: data.allies,
                enemies: data.enemies,
                home: data.home,
                bank: {
                    total: data.bank.total - args[0],
                    withdrawPerDay: data.bank.withdrawPerDay,
                    withrdawlTimeOut: data.bank.withrdawlTimeOut,
                    timedOutMembers: data.bank.timedOutMembers
                }
            });
        })
        ctx.executeArgument('total', (sender) => {
            if (!CX.factions.isInFaction(sender)) return sender.response.error('You are not in a faction')
            sender.response.send(`Bank Balanace: $${CX.extra.parseNumber(Databases.factions.read(CX.factions.getPlayersFaction(sender)).bank.total)}`)
        })
        ctx.executeArgument('deposit', (sender, _, args) => {
            if (!CX.factions.isInFaction(sender)) return sender.response.error('You are not in a faction')
            if (!CX.factions.isFactionOwner(sender)) return sender.response.error('Your not the faction owner to deposit to the bank');
            const data = Databases.factions.read(CX.factions.getPlayersFaction(sender))
            if (args[0] > sender.score.getScore(config.currency)) return sender.response.error(`You do not have enough ${config.currency} to deposit to the bank`)
            Databases.factions.write(data.name, {
                name: data.name,
                createdAt: data.createdAt,
                owner: data.owner,
                allies: data.allies,
                enemies: data.enemies,
                home: data.home,
                bank: {
                    total: data.bank.total + args[0],
                    withdrawPerDay: data.bank.withdrawPerDay,
                    withrdawlTimeOut: data.bank.withrdawlTimeOut,
                    timedOutMembers: data.bank.timedOutMembers
                }
            });
            sender.score.removeScore(config.currency, args[0])
            sender.response.send(`You have deposited ${CX.extra.parseNumber(args[0])} to the bank`)
        })
        ctx.executeArgument('settings', (sender) => {
            if (!CX.factions.isInFaction(sender)) return sender.response.error('You are not in a faction')
            if (!CX.factions.isFactionOwner(sender)) return sender.response.error('Your not the faction owner to edit the bank settings');
            const data = Databases.factions.read(CX.factions.getPlayersFaction(sender))
            sender.response.send('Close the chat within 10 seconds')
            new CX.modalForm()
            .setTitle('Faction Bank Settings')
            .addTextField('The amount that the player can withdraw each time:', `100`, `${data.bank.withdrawPerDay}`)
            .addDropDown(`The timeout of the withdrawl once a member withdraws: (current: ${data.bank.withrdawlTimeOut} hours)`, ['None', '24 hours', '48 hours'])
            .force(sender, (res) => {
                if (res.canceled) return
                if (isNaN(res.formValues[0])) return sender.response.error('The amount must be a number')
                if (res.formValues[0] < 100) return sender.response.error('The amount cant be less than 100')
                if (res.formValues[1] == 1) {
                    Databases.factions.write(data.name, {
                        name: data.name,
                        createdAt: data.createdAt,
                        owner: data.owner,
                        allies: data.allies,
                        enemies: data.enemies,
                        home: data.home,
                        bank: {
                            total: data.bank.total,
                            withdrawPerDay: Number(res.formValues[0]),
                            withrdawlTimeOut: 24,
                            timedOutMembers: data.bank.timedOutMembers
                        }
                    });
                } else if (res.formValues[1] == 2) {
                    Databases.factions.write(data.name, {
                        name: data.name,
                        createdAt: data.createdAt,
                        owner: data.owner,
                        allies: data.allies,
                        enemies: data.enemies,
                        home: data.home,
                        bank: {
                            total: data.bank.total,
                            withdrawPerDay: Number(res.formValues[0]),
                            withrdawlTimeOut: 48,
                            timedOutMembers: data.bank.timedOutMembers
                        }
                    });
                } else {
                    Databases.factions.write(data.name, {
                        name: data.name,
                        createdAt: data.createdAt,
                        owner: data.owner,
                        allies: data.allies,
                        enemies: data.enemies,
                        home: data.home,
                        bank: {
                            total: data.bank.total,
                            withdrawPerDay: Number(res.formValues[0]),
                            withrdawlTimeOut: data.bank.withrdawlTimeOut,
                            timedOutMembers: data.bank.timedOutMembers
                        }
                    });
                }
                sender.response.send('Successfully edited the factions bank settings')
            }, 220)
        })
    }
});