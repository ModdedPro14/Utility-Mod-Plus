import { CX } from "../../../API/CX";
import { ItemTypes } from "@minecraft/server";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('settings')
    .setDescription('Edit the files config without going thorugh the config file')
    .setCategory('management')
    .setPermissions({ admin: true }),
    executes(ctx) {
        ctx.execute((sender) => {
            sender.response.send('Close the chat within 10 secondes');
            new CX.actionForm()
            .setTitle('Settings')
            .setBody('§aAll that settings the can be edited:')
            .addButton('General Settings\n§7[Click to show]')
            .addButton('Anti Cheat Settings\n§7[Click to show]')
            .addButton('Faction Settings\n§7[Click to show]')
            .addButton('Vault Settings\n§7[Click to show]')
            .addButton('Report Settings\n§7[Click to show]')
            .force(sender, (res) => {
                if (res.canceled) return;
                if (res.selection == 0) {
                    new CX.modalForm()
                    .setTitle('General Settings')
                    .addTextField('Admin Tag:', `${Databases.settings.read('adminTag')}`, `${Databases.settings.read('adminTag')}`)
                    .addTextField('Mod Tag', `${Databases.settings.read('modTag')}`, `${Databases.settings.read('modTag')}`)
                    .addTextField('Trust Tag:', `${Databases.settings.read('trustTag')}`, `${Databases.settings.read('trustTag')}`)
                    .addTextField('Default Rank:', `${Databases.settings.read('defaultRank')}`, `${Databases.settings.read('defaultRank')}`)
                    .addTextField('Command Prefix:', `${Databases.settings.read('prefix')}`, `${Databases.settings.read('prefix')}`)
                    .addTextField('Chat Style:', `${Databases.settings.read('chatStyle')}`, `${Databases.settings.read('chatStyle')}`)
                    .addTextField('Currency:', `${Databases.settings.read('currency')}`, `${Databases.settings.read('currency')}`)
                    .addTextField('Max Player Auctions:', `${Databases.settings.read('maxAuctions')}`, `${Databases.settings.read('maxAuctions')}`)
                    .addToggle('Ranks', Databases.settings.read('ranks'))
                    .addToggle('Item Names Display', Databases.settings.read('itemNamesDisplay'))
                    .addToggle('Damage Indicators', Databases.settings.read('damageIndicators'))
                    .addToggle('Tree Capitator', Databases.settings.read('treeCapitator'))
                    .addToggle('Vein Miner', Databases.settings.read('veinMiner'))
                    .addToggle('Betting System', Databases.settings.read('betting'))
                    .addToggle('Ender Pearl Timer', Databases.settings.read('enderPearlT'))
                    .addToggle('Login/register system', Databases.settings.read('login'))
                    .addToggle('Teleport a player to spawn once joining', Databases.settings.read('tpToSpawnOnSpawn'))
                    .show(sender, (result) => {
                        if (result.canceled) return;
                        if (result.formValues[0] == result.formValues[1]) return sender.response.error('The trust tag cant be the same as the admin tag');
                        if (result.formValues[3].startsWith('/')) return sender.response.error('The command prefix cant be a /');
                        if (result.formValues[3].trim() == '') return sender.response.error('The prefix cant be nothing');
                        CX.overRide('adminTag', result.formValues[0]);
                        CX.overRide('modTag', result.formValues[1])
                        CX.overRide('trustTag', result.formValues[2]);
                        CX.overRide('defaultRank', result.formValues[3]);
                        if (result.formValues[4]) CX.overRide('prefix', result.formValues[4]);
                        CX.overRide('chatStyle', result.formValues[5]);
                        CX.overRide('currency', result.formValues[6]);
                        CX.overRide('maxAuctions', result.formValues[7]);
                        CX.overRide('ranks', result.formValues[8]);
                        CX.overRide('itemNamesDisplay', result.formValues[9]);
                        CX.overRide('damageIndicators', result.formValues[10]);
                        CX.overRide('treeCapitator', result.formValues[11]);
                        CX.overRide('veinMiner', result.formValues[12]);
                        CX.overRide('betting', result.formValues[13]);
                        CX.overRide('enderPearlT', result.formValues[14])
                        CX.overRide('login', result.formValues[15])
                        CX.overRide('tpToSpawnOnSpawn', result.formValues[16])
                        sender.response.send('Successfully updated general settings data');
                    });
                } else if (res.selection == 1) {
                    new CX.modalForm()
                    .setTitle('Anti Cheat Settings')
                    .addToggle("Anti CBE's", Databases.settings.read('cbes'))
                    .addToggle('Anti Nuker', Databases.settings.read('nuker'))
                    .addToggle('Anti Illegal Enchantments', Databases.settings.read('illegalEnchantments'))
                    .addToggle('Anti Auto Clicker', Databases.settings.read('AAC'))
                    .addToggle('Anti Kill Aura', Databases.settings.read('AKA'))
                    .addToggle('Anti Speed', Databases.settings.read('speed'))
                    .addToggle('Anti Fly', Databases.settings.read('fly'))
                    .addToggle('Anti Scaffold', Databases.settings.read('scaffold'))
                    .addDropDown('CBE\'s that cant be used from anyone: §c(Select to remove)', ['None', ...Databases.settings.read('allCbes')])
                    .addDropDown('CBE\'s that can only be used by trusted people: §c(Select to remove)', ['None', ...Databases.settings.read('trustedCbes')])
                    .addTextField('Add a CBE to all CBE\'s: §c(Only blocks)', 'None')
                    .addTextField('Add a CBE to trusted CBE\'s: §c(Only Blocks)', 'None')
                    .show(sender, (result) => {
                        if (result.canceled) return;
                        CX.overRide('cbes', result.formValues[0], 'AntiCheat');
                        CX.overRide('nuker', result.formValues[1], 'AntiCheat');
                        CX.overRide('illegalEnchantments', result.formValues[2], 'AntiCheat')
                        CX.overRide('AAC', result.formValues[3], 'AntiCheat')
                        CX.overRide('AKA', result.formValues[4], 'AntiCheat');
                        CX.overRide('speed', result.formValues[5], 'AntiCheat');
                        CX.overRide('fly', result.formValues[6], 'AntiCheat');
                        CX.overRide('scaffold', result.formValues[7], 'AntiCheat');
                        if (!result.formValues[8] == 'None') {
                            const cbes = Databases.settings.read('allCbes');
                            cbes.splice(cbes.indexOf(cbes[result.formValues[8] - 1]), cbes.indexOf(cbes[result.formValues[8] - 1]));
                            CX.overRide('allCbes', cbes);
                        }
                        if (!result.formValues[9] == 'None') {
                            const Tcbes = Databases.settings.read('trustedCbes');
                            Tcbes.splice(Tcbes.indexOf(Tcbes[result.formValues[9] - 1]), Tcbes.indexOf(Tcbes[result.formValues[9] - 1]));
                            CX.overRide('trustedCbes', Tcbes);
                        }
                        if (result.formValues[10]) {
                            if (typeof ItemTypes.get(result.formValues[10]) == 'undefined') return sender.response.error('The cbe you tried to add was invalid');
                            if (Databases.settings.read('allCbes').includes(result.formValues[10].replace('minecraft:', ''))) return sender.response.error('That cbe already exists in the list');
                            const cbes = Databases.settings.read('allCbes');
                            cbes.push(result.formValues[10].replace('minecraft:', ''));
                            CX.overRide('allCbes', cbes);
                        }
                        if (result.formValues[11]) {
                            if (typeof ItemTypes.get(result.formValues[11]) == 'undefined') return sender.response.error('The cbe you tried to add was invalid');
                            if (Databases.settings.read('trustedCbes').includes(result.formValues[11].replace('minecraft:', ''))) return sender.response.error('That cbe already exists in the list');
                            const Tcbes = Databases.settings.read('trustedCbes');
                            Tcbes.push(result.formValues[11].replace('minecraft:', ''));
                            CX.overRide('trustedCbes', Tcbes);
                        }
                        sender.response.send('Successfully updated Anti Cheat settings data');
                    });
                } else if (res.selection == 2) {
                    new CX.modalForm()
                    .setTitle('Faction Settings')
                    .addToggle('Claims', Databases.settings.read('claims'))
                    .addToggle('Allows others to use doors, switches etc. in claims', Databases.settings.read('toggleAblePermissions'))
                    .addToggle('Faction homes', Databases.settings.read('factionHomes'))
                    .addTextField('The raduis from spawn for claims: §c(Only numbers)', 'None')
                    .addTextField('The cost of a claim: §c(Only numbers)', 'None')
                    .show(sender, (result) => {
                        if (result.canceled) return;
                        CX.overRide('claims', result.formValues[0]);
                        CX.overRide('toggleAblePermissions', result.formValues[1]);
                        CX.overRide('factionHomes', result.formValues[2])
                        if (isNaN(result.formValues[3])) return sender.response.error('The amount you entered isnt a number');
                        CX.overRide('spawnRaduis', result.formValues[3]);
                        if (isNaN(result.formValues[4])) return sender.response.error('The amount you entered isnt a number');
                        CX.overRide('claimCost', result.formValues[4]);
                        sender.response.send('Successfully updated Faction settings data');
                    });
                } else if (res.selection == 3) {
                    new CX.modalForm()
                    .setTitle('Vault Settings')
                    .addTextField('The cost of a vault page:', `${Databases.settings.read('vaultCost')}`, `${Databases.settings.read('vaultCost')}`)
                    .addTextField('Max vault pages in a vault:', `${Databases.settings.read('vaultMaxPages')}`, `${Databases.settings.read('vaultMaxPages')}`)
                    .show(sender, (result) => {
                        if (result.canceled) return;
                        if (isNaN(result.formValues[0] || isNaN(result.formValues[1]))) return sender.response.error('All data must be a number')
                        CX.overRide('vaultCost', result.formValues[0])
                        CX.overRide('vaultMaxPages', result.formValues[1])
                        sender.response.send('Successfully updated Vault settings data');
                    });
                } else if (res.selection == 4) {
                    new CX.modalForm()
                    .setTitle('Report Settings')
                    .addTextField('Add report reason:', 'Hacking..')
                    .addDropDown('Remove a report reason:', ['None', ...Databases.reportSettings.values()])
                    .show(sender, (result) => {
                        if (result.canceled) return
                        const reasons = ['None', ...Databases.reportSettings.keys()]
                        if (Databases.reportSettings.has(result.formValues[0])) return sender.response.error('That report reason already exists')
                        if (result.formValues[0]) Databases.reportSettings.write(result.formValues[0], result.formValues[0])
                        if (reasons[result.formValues[1]] != 'None') Databases.reportSettings.delete(reasons[result.formValues[1]])
                        sender.response.send('Successfully edited the Report Settings')
                    })
                }
            }, 220);
        });
    }
})