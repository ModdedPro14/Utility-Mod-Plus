import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('enchantment')
    .setDescription('A custom enchantment system')
    .setCategory('miscellaneous')
    .setAdmin(true)
    .firstArguments(['create', 'apply', 'delete', 'list', 'view'])
    .addDynamicArgument('create', [], 'create')
    .addDynamicArgument('apply', [], 'apply', 'name')
    .addDynamicArgument('delete', [], 'delete', 'enchantment')
    .addDynamicArgument('list', [], 'list')
    .addDynamicArgument('view', [], 'view', 'enchantment')
    .addAnyArgument('name', [], 1, null, 'level')
    .addAnyArgument('enchantment', ['delete | view'], 1)
    .addNumberArgument('level', ['apply', 'name']),
    executes(ctx) {
        ctx.executeArgument('create', (sender) => {
            sender.response.send('Close the chat in 10 secondes');
            const eqipiedList = ['Helmet', 'Chestplate', 'Leggings', 'Boot', 'Sword', 'Axe', 'Pickaxe', 'Shovel', 'Hoe'];
            const eventList = ['System', 'OnHit'];
            const tierList = ['§r§7common', '§r§auncommon', '§r§depic', '§r§6legendary', '§r§4mythical'];
            new CX.modalForm()
            .setTitle('Create an enchantment')
            .addTextField('Enchantment name:', 'None')
            .addTextField('Enchantment description:', 'None')
            .addDropDown('Equpied on:', eqipiedList)
            .addSlider('Max level', 1, 255, 1, 1)
            .addDropDown('Event: \n §r- §8System - Always running\n §r- §8OnHit - Runs when hitting an entity', eventList)
            .addDropDown('Tier:', tierList)
            .addTextField('What will it do: §c(Commands only)\n§r- §8$level - level of the enchantment\n§r- §8$hitEntity - the entity that has been damaged §c(Only OnHit event)', 'effect @s jump_boost 1 $level true')
            .force(sender, (res) => {
                if (res.cancelled) return;
                if (!res.formValues[0]) return sender.response.error('You must provide a name for the enchantment');
                let equpiment;
                if (eqipiedList[res.formValues[2]] == 'Helmet') equpiment = 'head';
                else if (eqipiedList[res.formValues[2]] == 'Chestplate') equpiment = 'chest';
                else if (eqipiedList[res.formValues[2]] == 'Leggings') equpiment = 'legs';
                else if (eqipiedList[res.formValues[2]] == 'Boot') equpiment = 'feet';
                else equpiment = eqipiedList[res.formValues[2]].toLowerCase();
                let tier;
                if (tierList[res.formValues[5]] == '§r§7common') tier = 'common';
                else if (tierList[res.formValues[5]] == '§r§auncommon') tier = 'uncommon';
                else if (tierList[res.formValues[5]] == '§r§depic') tier = 'epic';
                else if (tierList[res.formValues[5]] == '§r§6legendary') tier = 'legendary';
                else if (tierList[res.formValues[5]] == '§r§4mythical') tier = 'mythical';
                if (res.formValues[3] > 255) return sender.response.error('The max level must be under 255');
                if (Databases.enchantments.has(res.formValues[0].replaceAll(' ', '_'))) return sender.response.error('That enchantment already exists');
                if (res.formValues[0] && res.formValues[6]) {
                    CX.enchantment.create({
                        name: res.formValues[0].replaceAll(' ', '_'),
                        description: res.formValues[1] ?? 'No description',
                        equpiedOn: equpiment,
                        maxLevel: res.formValues[3],
                        event: eventList[res.formValues[4]],
                        tier: tier,
                        command: res.formValues[6]
                    });
                    sender.response.send(`Successfully created the enchantment: ${res.formValues[0].replaceAll(' ', '_')}`);
                }
            }, 220);
        });
        ctx.executeArgument('apply', (sender, _, args) => {
            if (!Databases.enchantments.has(args[0])) return sender.response.error('That enchantment dosent exist');
            const inv = sender.getComponent('inventory').container;
            const selectedItem = inv.getItem(sender.selectedSlot);
            if (!selectedItem) return sender.response.error('You must hold an item');
            const Data = Databases.enchantments.read(args[0]);
            if (Data.equpiedOn == 'head' && !selectedItem.typeId.endsWith('helmet')) return sender.response.error('This enchantment can only be applied on helmets');
            if (Data.equpiedOn == 'chest' && !selectedItem.typeId.endsWith('chestplate')) return sender.response.error('This enchantment can only be applied on chestplates');
            if (Data.equpiedOn == 'legs' && !selectedItem.typeId.endsWith('leggings')) return sender.response.error('This enchantment can only be applied on leggings');
            if (Data.equpiedOn == 'feet' && !selectedItem.typeId.endsWith('boots')) return sender.response.error('This enchantment can only be applied on boots');
            if (Data.equpiedOn != 'head' && Data.equpiedOn != 'chest' && Data.equpiedOn != 'legs' && Data.equpiedOn != 'feet' && !selectedItem.typeId.endsWith(Data.equpiedOn)) return sender.response.error(`This enchantment can only be applied on ${Data.equpiedOn}`);
            if (args[1] > Data.maxLevel) return sender.response.error('The amount u entered is above the max level of the enchantment');
            const lore = `${selectedItem.getLore()}`.trim().split(/\s+/g);
            if (lore.includes(CX.enchantment.getTierColor(Data.tier) + Data.name)) return sender.response.error('This enchantment is already applied on the item ur holding');
            selectedItem.setLore([`${CX.enchantment.getTierColor(Data.tier)}${Data.name} ${CX.extra.convertToRoman(args[1])}\n${selectedItem.getLore().join('')}\n`]);
            inv.setItem(sender.selectedSlot, selectedItem);
            sender.response.send(`Successfully applied the enchantment ${Data.name}`);
        });
        ctx.executeArgument('delete', (sender, _, args) => {
            if (!Databases.enchantments.has(args[0]))return sender.response.error('That enchantment dosent exist');
            sender.response.send(`Successfully deleted the enchantment: ${args[0]}`);
            Databases.enchantments.delete(args[0]);
        });
        ctx.executeArgument('list', (sender) => {
            const enchList = Databases.enchantments.values();
            if (!enchList.length) return sender.response.error('There are no enchantments that have been made yet');
            const enchantments = [];
            for (const enchantment of enchList) enchantments.push(`§c${enchantment.name} §a- ${enchantment.description}`);
            sender.response.send(`§l§6<---------------------->\n${enchantments.join('\n')}\n§6<---------------------->`, true, false);
        });
        ctx.executeArgument('view', (sender, _, args) => {
            if (!Databases.enchantments.has(args[0])) return sender.response.error('That enchantment dosent exist');
            const Data = Databases.enchantments.read(args[0]);
            let hI = `§l§6Name: §c${Data.name}\n`;
            if (Data.description.length) hI += `§6Description:§c ${Data.description}\n`;
            hI += `§l§6Tier:§c ${CX.enchantment.getTierColor(Data.tier)}§l${Data.tier}\n`;
            hI += `§l§6MaxLevel: §c${Data.maxLevel}\n`;
            hI += `§l§6Equpied On: §c${Data.equpiedOn}\n`;
            hI += `§l§6Event: §c${Data.event}\n`;
            sender.response.send(`§6${hI}`, true, false);
        });
    }
})