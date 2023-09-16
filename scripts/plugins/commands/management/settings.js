import { CX } from "../../../API/CX";
import { ItemTypes } from "@minecraft/server";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('settings')
    .setDescription('Edit the files config without going thorugh the config file')
    .setCategory('management')
    .setAdmin(true),
    executes(ctx) {
        ctx.execute((sender) => {
            sender.response.send('Close the chat within 10 secondes');
            new CX.actionForm()
            .setTitle('Settings')
            .setBody('§aAll that settings the can be edited:')
            .addButton('General Settings\n§7[Click to show]')
            .addButton('Anti Cheat Settings\n§7[Click to show]')
            .addButton('Faction Settings\n§7[Click to show]')
            .force(sender, (res) => {
                if (res.canceled) return;
                if (res.selection == 0) {
                    new CX.modalForm()
                    .setTitle('General Settings')
                    .addTextField('Admin Tag:', Databases.settings.read('adminTag'), Databases.settings.read('adminTag'))
                    .addTextField('Trust Tag:', Databases.settings.read('trustTag'), Databases.settings.read('trustTag'))
                    .addTextField('Default Rank:', Databases.settings.read('defaultRank'), Databases.settings.read('defaultRank'))
                    .addTextField('Command Prefix:', Databases.settings.read('prefix'), Databases.settings.read('prefix'))
                    .addTextField('Chat Style:', Databases.settings.read('chatStyle'), Databases.settings.read('chatStyle'))
                    .addTextField('Currency:', Databases.settings.read('currency'), Databases.settings.read('currency'))
                    .addTextField('Max Player Auctions:', `${Databases.settings.read('maxAuctions')}`, `${Databases.settings.read('maxAuctions')}`)
                    .addToggle('Ranks', Databases.settings.read('ranks'))
                    .addToggle('Item Names Display', Databases.settings.read('itemNamesDisplay'))
                    .addToggle('Damage Indicators', Databases.settings.read('damageIndicators'))
                    .addToggle('Tree Capitator', Databases.settings.read('treeCapitator'))
                    .addToggle('Vein Miner', Databases.settings.read('veinMiner'))
                    .addToggle('Betting System', Databases.settings.read('betting'))
                    .show(sender, (result) => {
                        if (result.canceled) return;
                        if (result.formValues[0] == result.formValues[1]) return sender.response.error('The trust tag cant be the same as the admin tag');
                        if (result.formValues[3].startsWith('/')) return sender.response.error('The command prefix cant be a /');
                        if (result.formValues[3].trim() == '') return sender.response.error('The prefix cant be nothing');
                        CX.overRide('adminTag', result.formValues[0]);
                        CX.overRide('trustTag', result.formValues[1]);
                        CX.overRide('defaultRank', result.formValues[2]);
                        if (result.formValues[3]) CX.overRide('prefix', result.formValues[3]);
                        CX.overRide('chatStyle', result.formValues[4]);
                        CX.overRide('currency', result.formValues[5]);
                        CX.overRide('maxAuctions', result.formValues[6]);
                        CX.overRide('ranks', result.formValues[7]);
                        CX.overRide('itemNamesDisplay', result.formValues[8]);
                        CX.overRide('damageIndicators', result.formValues[9]);
                        CX.overRide('treeCapitator', result.formValues[10]);
                        CX.overRide('veinMiner', result.formValues[11]);
                        CX.overRide('betting', result.formValues[12]);
                        sender.response.send('Successfully updated general settings data');
                    });
                } else if (res.selection == 1) {
                    new CX.modalForm()
                    .setTitle('Anti Cheat Settings')
                    .addToggle("CBE's", Databases.settings.read('cbes'))
                    .addToggle('Nuker', Databases.settings.read('nuker'))
                    .addToggle('Illegal Enchantments', Databases.settings.read('illegalEnchantments'))
                    .addDropDown('CBE\'s that cant be used from anyone: §c(Select to remove)', ['None', ...Databases.settings.read('allCbes')])
                    .addDropDown('CBE\'s that can only be used by trusted people: §c(Select to remove)', ['None', ...Databases.settings.read('trustedCbes')])
                    .addTextField('Add a CBE to all CBE\'s: §c(Only blocks)', 'None')
                    .addTextField('Add a CBE to trusted CBE\'s: §c(Only Blocks)', 'None')
                    .show(sender, (result) => {
                        if (result.canceled) return;
                        CX.overRide('cbes', result.formValues[0], 'AntiCheat');
                        CX.overRide('nuker', result.formValues[1], 'AntiCheat');
                        CX.overRide('illegalEnchantments', result.formValues[2], 'AntiCheat');
                        if (!result.formValues[3] == 'None') {
                            const cbes = Databases.settings.read('allCbes');
                            cbes.splice(cbes.indexOf(cbes[result.formValues[3] - 1]), cbes.indexOf(cbes[result.formValues[3] - 1]));
                            CX.overRide('allCbes', cbes);
                        }
                        if (!result.formValues[4] == 'None') {
                            const Tcbes = Databases.settings.read('trustedCbes');
                            Tcbes.splice(Tcbes.indexOf(Tcbes[result.formValues[4] - 1]), Tcbes.indexOf(Tcbes[result.formValues[4] - 1]));
                            CX.overRide('trustedCbes', Tcbes);
                        }
                        if (result.formValues[5]) {
                            if (typeof ItemTypes.get(result.formValues[5]) == 'undefined') return sender.response.error('The cbe you tried to add was invalid');
                            if (Databases.settings.read('allCbes').includes(result.formValues[5].replace('minecraft:', ''))) return sender.response.error('That cbe already exists in the list');
                            const cbes = Databases.settings.read('allCbes');
                            cbes.push(result.formValues[5].replace('minecraft:', ''));
                            CX.overRide('allCbes', cbes);
                        }
                        if (result.formValues[6]) {
                            if (typeof ItemTypes.get(result.formValues[6]) == 'undefined') return sender.response.error('The cbe you tried to add was invalid');
                            if (Databases.settings.read('trustedCbes').includes(result.formValues[6].replace('minecraft:', ''))) return sender.response.error('That cbe already exists in the list');
                            const Tcbes = Databases.settings.read('trustedCbes');
                            Tcbes.push(result.formValues[5].replace('minecraft:', ''));
                            CX.overRide('trustedCbes', Tcbes);
                        }
                        sender.response.send('Successfully updated Anti Cheat settings data');
                    });
                } else if (res.selection == 2) {
                    new CX.modalForm()
                    .setTitle('Faction Settings')
                    .addToggle('Claims', Databases.settings.read('claims'))
                    .addToggle('Allows others to use doors, switches etc. in claims', Databases.settings.read('toggleAblePermissions'))
                    .addTextField('The raduis from spawn for claims: §c(Only numbers)', 'None')
                    .addTextField('The cost of a claim: §c(Only numbers)', 'None')
                    .show(sender, (result) => {
                        if (result.canceled) return;
                        CX.overRide('claims', result.formValues[0]);
                        CX.overRide('toggleAblePermissions', result.formValues[1]);
                        if (isNaN(result.formValues[2])) return sender.response.error('The amount you entered isnt a number');
                        CX.overRide('spawnRaduis', result.formValues[2]);
                        if (isNaN(result.formValues[3])) return sender.response.error('The amount you entered isnt a number');
                        CX.overRide('claimCost', result.formValues[3]);
                        sender.response.send('Successfully updated Faction settings data');
                    });
                }
            }, 220);
        });
    }
})