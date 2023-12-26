import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('repair')
    .setDescription('Repair the item your holding')
    .setCategory('miscellaneous')
    .setPermissions({ admin: true }),
    executes(ctx) {
        ctx.execute((sender) => {
            const inventory = sender.getComponent('inventory').container;
            const item = inventory.getItem(sender.selectedSlot);
            if (!item) return sender.response.error('You must hold an item');
            inventory.setItem(sender.selectedSlot, CX.item.repair(item));
        });
    }
})