import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('dupe')
    .setDescription('Duplicate the item your holding')
    .setCategory('miscellaneous')
    .setAdmin(true),
    executes(ctx) {
        ctx.execute((sender) => {
            const inventory = sender.getComponent('inventory').container;
            const item = inventory.getItem(sender.selectedSlot);
            if (!item) return sender.response.error('You must hold an item');
            inventory.addItem(item);
            sender.response.send(`Successfully duped the item §6${CX.item.getItemName(item)}`);
        });
    }
})