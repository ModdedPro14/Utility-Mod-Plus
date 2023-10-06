import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";
import { EquipmentSlot } from "@minecraft/server";
import config from "../../../config/main";
import { ItemDB } from "../../../API/database/IDB";

const kits = new ItemDB('kits');

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('kit')
    .setDescription('A simple kit system')
    .setCategory('miscellaneous')
    .firstArguments(['create', 'remove', 'set', 'buy', 'view', 'reset', 'list'], true)
    .addDynamicArgument('create', [], 'create', 'name')
    .addDynamicArgument('remove', [], 'remove', 'name')
    .addDynamicArgument('set', [], 'set', 'kit')
    .addDynamicArgument('buy', [], 'buy', 'name')
    .addDynamicArgument('view', [], 'view', 'name')
    .addDynamicArgument('reset', [], 'reset', 'name')
    .addDynamicArgument('list', [], 'list')
    .addAnyArgument('name', [{ name: '<create | remove | buy | view | reset>', type: 'dyn'}], 1)
    .addAnyArgument('kit', [], 1, {}, 'permission')
    .addAnyArgument('permission', [], 1, {}, 'price')
    .addNumberArgument('price', [{ name: 'set', type: 'dyn'}, { name: 'kit', type: 'any'}, { name: 'permission', type: 'any'}]),
    executes(ctx) {
        ctx.execute((sender) => sender.management.jailed && sender.response.error('You cant use this command while your jailed'));
        ctx.executeArgument('create', (sender, _, args) => {
            if (!sender.permission.hasPermission('admin')) return sender.response.error(`You need admin permissions to use this argument`);
            if (Databases.kit.has(args[0])) return sender.response.error('That kit already exists');
            Databases.kit.write(args[0], args[0]);
            sender.response.send(`Created the kit with the name §6${args[0]}`);
        });
        ctx.executeArgument('remove', (sender, _, args) => {
            if (!sender.permission.hasPermission('admin')) return sender.response.error(`You need admin permissions to use this argument`);
            if (!Databases.kit.has(args[0])) return sender.response.error('That kit dosent exist');
            const data = Databases.kit.read(args[0]);
            if (data.items) data.items.forEach((i) => kits.deleteID(i));
            Databases.kit.delete(args[0]);
            sender.response.send(`You have removed the kit §6${args[0]} §csuccessfuly`);
        });
        ctx.executeArgument('set', (sender, _, args) => {
            if (!sender.permission.hasPermission('admin')) return sender.error(`You need admin permissions to use this argument`);
            const inventory = sender.getComponent('inventory').container;
            let permission, price;
            if (!Databases.kit.has(args[0])) return sender.response.error('That kit dosent exist');
            if (!args[1]) return sender.response.error('You must provide a permission for the kit, type §6none §cafter this argument if you dont want a permission for the kit');
            permission = args[1];
            if (!args[2] && args[2] !== 0) return sender.response.error('You must provide a price for the kit');
            price = args[2];
            const items = [];
            let itemCount = 0;
            for (let i = 0; i < inventory.size; i++) {
                const item = inventory.getItem(i);
                if (!item) continue;
                itemCount++;
                items.push(kits.writeItem(item));
            }
            const equipment = sender.getComponent('equippable'), armor = {
                offhand: kits.writeItem(equipment.getEquipment(EquipmentSlot.Offhand)),
                helmet: kits.writeItem(equipment.getEquipment(EquipmentSlot.Head)),
                chest: kits.writeItem(equipment.getEquipment(EquipmentSlot.Chest)),
                legs: kits.writeItem(equipment.getEquipment(EquipmentSlot.Legs)),
                feet: kits.writeItem(equipment.getEquipment(EquipmentSlot.Feet))
            };
            if (!items.length && !armor.offhand && !armor.helmet && !armor.chest && !armor.legs && !armor.feet) return sender.response.error('There were no items to add to the kit');
            const data = {
                name: args[0],
                itemCount,
                permission: permission ?? "none",
                price: price ?? 0,
                items: items,
                armor,
                createdAt: new Date().toLocaleString()
            };
            sender.response.send(`You have set the items in your inventory to the kit §6${args[0]} §cwith the permision: §6${data.permission} §cwith the price: §6${CX.extra.parseNumber(data.price)}`);
            Databases.kit.write(args[0], data);
        })
        ctx.executeArgument('buy', (sender, _, args) => {
            if (!Databases.kit.has(args[0])) return sender.response.error('That kit dosent exist');
            const inventory = sender.getComponent('inventory').container;
            const equipment = sender.getComponent('equippable');
            const Data = Databases.kit.read(args[0]);
            if (!args[0].includes(Data.name || Data.createdAt || Data.items)) return sender.response.error('That kit cant be bought');
            if (Data.permission !== "none" && (!sender.hasTag(Data.permission))) return sender.response.error('You dont have permission to buy this kit');
            if (sender.score.getScore(config.currency) < Data.price) return sender.response.error(`You need §6${CX.extra.parseNumber(Data.price - sender.score.getScore(config.currency))} §cmore to buy this item`);
            if (inventory.emptySlotsCount < Data.itemCount) return sender.response.error('You dont have enough space to buy this kit');
            if (Data.armor.offhand && equipment.getEquipment(EquipmentSlot.Offhand)) return sender.response.error('You must not have any offhand equipments');
            if (Data.armor.helmet && equipment.getEquipment(EquipmentSlot.Head)) return sender.response.error('You must not have any helmets equiped');
            if (Data.armor.chest && equipment.getEquipment(EquipmentSlot.Chest)) return sender.response.error('You cant must not have any chestplates equiped');
            if (Data.armor.legs && equipment.getEquipment(EquipmentSlot.Legs)) return sender.response.error('You must not have any leggings equiped');
            if (Data.armor.feet && equipment.getEquipment(EquipmentSlot.Feet)) return sender.response.error('You must not have any boots equiped');
            if (Data.armor.offhand) equipment.setEquipment(EquipmentSlot.Offhand, kits.readID(Data.armor.offhand));
            if (Data.armor.helmet) equipment.setEquipment(EquipmentSlot.Head, kits.readID(Data.armor.helmet));
            if (Data.armor.chest) equipment.setEquipment(EquipmentSlot.Chest, kits.readID(Data.armor.chest));
            if (Data.armor.legs) equipment.setEquipment(EquipmentSlot.Legs, kits.readID(Data.armor.legs));
            if (Data.armor.feet) equipment.setEquipment(EquipmentSlot.Feet, kits.readID(Data.armor.feet));
            Data.items.forEach((i) => inventory.addItem(kits.readID(i)));
            sender.response.send(`You have bought the kit §6${args[0]}`);
            sender.score.removeScore(config.currency, Data.price);
        });
        ctx.executeArgument('view', (sender, _, args) => {
            if (!Databases.kit.has(args[0])) return sender.response.error('That kit dosent exist');
            const Data = Databases.kit.read(args[0]);
            if (!args[0].includes(Data.name || Data.createdAt || Data.items)) return sender.response.error('That kit cant be viewed');
            let tx = "\n";
            tx += `§cName: ${Data.name}\n§cItem Amount: ${Data.itemCount}\n§cPermission: ${Data.permission}\n§cPrice: ${CX.extra.parseNumber(Data.price)}\n§cCreated At: ${Data.createdAt}`;
            sender.response.send(`§cViewing the kit §6${args[0]}§c:${tx}`, true, false);
        });
        ctx.executeArgument('reset', (sender, _, args) => {
            if (!sender.permission.hasPermission('admin')) return sender.response.error(`You need admin permissions to use this argument`);
            if (!Databases.kit.has(args[0])) return sender.response.error('That kit dosent exist');
            const data = Databases.kit.read(args[0]);
            if (data.items) data.items.forEach((i) => kits.deleteID(i));
            Databases.kit.write(args[0], args[0]);
            sender.response.send(`You have reseted the kit §6${args[0]} §csuccessfully`);
        });
        ctx.executeArgument('list', (sender) => {
            const list = []
            for (const k of Databases.kit.values()) list.push(k)
            if (!list.length) return sender.response.error('There are no available kits yet')
            sender.response.send(`§c----------------\nAvailable kits:\n${list.map(k => k).join('\n')}\n§c----------------`, true, false);
        });
    }
})