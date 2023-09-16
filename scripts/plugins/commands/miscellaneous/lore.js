import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('lore')
    .setDescription('Add a description to the item your holding')
    .setCategory('miscellaneous')
    .setAdmin(true)
    .firstArguments(['description'], true)
    .addAnyArgument('description', 1),
    executes(ctx) {
        ctx.executeArgument('description', (sender, val) => {
            CX.item.setLore(sender, [val.replaceAll('\\n', '\n')]);
        });
    }
})