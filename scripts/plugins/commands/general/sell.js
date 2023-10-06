import { CX } from "../../../API/CX";
import { ItemTypes } from "@minecraft/server";
import config from "../../../config/main";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('sell')
    .setDescription('Sell items for money')
    .setCategory('general')
    .firstArguments(['add', 'hand', 'all', 'remove', 'list'], true)
    .addDynamicArgument('add', [], 'add', 'itemName')
    .addDynamicArgument('hand', [], 'hand')
    .addDynamicArgument('all', [], 'all')
    .addDynamicArgument('remove', [], 'remove', 'item')
    .addDynamicArgument('list', [], 'list')
    .addAnyArgument('itemName', [], 1, null, 'amount')
    .addNumberArgument('amount',  [{ name: 'add', type: 'dyn'}, { name: 'item', type: 'any'}])
    .addAnyArgument('item', [{ name: 'remove', type: 'dyn'}], 1),
    executes(ctx) {
        ctx.executeArgument('add', (sender, _, args) => {
            if (!sender.permission.hasPermission('admin')) return sender.response.error('You do not have permission to use this arguement');
            if (!ItemTypes.get(args[0])) return sender.response.error(`§6${args[0]}§c is not a valid minecraft item`);
            if (`${args[1]}`.startsWith('-')) return sender.response.error('The amount of money cant be less than 0');
            if (Databases.sellableItems.has(args[0])) return sender.response.error('This item is already sellable');
            Databases.sellableItems.write(args[0], { se: args[0], a: args[1] });
            sender.response.send(`Successfully made the item ${args[0]} a sellable with the amount of ${args[1]} a piece`);
        });
        ctx.executeArgument('hand', (sender) => {
            const item = sender.getComponent('inventory').container.getItem(sender.selectedSlot);
            if (!item) return sender.response.error('You must hold an item');
            if (!Databases.sellableItems.has(item.typeId.split('minecraft:')[1])) return sender.response.error('This item isnt sellable');
            sender.response.send(`Successfully sold ${item.amount}x ${item.typeId.split('minecraft:')[1]} for ${Databases.sellableItems.read(item.typeId.split('minecraft:')[1]).a * item.amount}`);
            sender.score.addScore(config.currency, Databases.sellableItems.read(item.typeId.split('minecraft:')[1]).a * item.amount);
            sender.getComponent('inventory').container.setItem(sender.selectedSlot);
        });
        ctx.executeArgument('all', (sender) => {
            const inventory = sender.getComponent('inventory').container;
            let itemCount = 0, gained = 0;
            for (let i = 0; i < inventory.size; i++) {
                const item = inventory.getItem(i);
                if (!item) continue;
                if (!Databases.sellableItems.has(item.typeId.split('minecraft:')[1])) continue;
                itemCount += 1;
                sender.score.addScore(config.currency, Databases.sellableItems.read(item.typeId.split('minecraft:')[1]).a * item.amount);
                gained += Databases.sellableItems.read(item.typeId.split('minecraft:')[1]).a * item.amount;
                inventory.setItem(i);
            }
            if (itemCount == 0) return sender.response.error('There was no items to sell');
            sender.response.send(`Sold ${itemCount} items for ${gained}`);
        });
        ctx.executeArgument('remove', (sender, _, args) => {
            if (!sender.permission.hasPermission('admin')) return sender.response.error('You do not have permission to use this arguement');
            if (!Databases.sellableItems.has(args[0])) return sender.response.error('That item is already not sellable');
            Databases.sellableItems.delete(args[0]);
            sender.response.send(`Successfully removed the item ${args[0]} from sellable items`);
        });
        ctx.executeArgument('list', (sender) => {
            const sellable = []
            for (const se of Databases.sellableItems.values()) sellable.push(se)
            if (!sellable.length) return sender.response.error('There are no sellable items yet');
            sender.response.send(`§c----------------\nSellable items:\n${sellable.map(s => `${s.se} - ${s.a}$ a piece`).join('\n')}\n§c----------------`, true, false);
        });
    }
});
