import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('name')
    .setDescription('Set the name of the item your holding')
    .setCategory('miscellaneous')
    .setAdmin(true)
    .firstArguments(['name'], true)
    .addAnyArgument('name', [], 1),
    executes(ctx) {
        ctx.executeArgument('name', (sender, val) => {
            CX.item.setName(sender, val.replaceAll('\\n', '\n'));
        });
    }
})