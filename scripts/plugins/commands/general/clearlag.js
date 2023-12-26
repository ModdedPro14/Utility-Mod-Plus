import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('clearlag')
    .setDescription('clears the lag')
    .setCategory('general')
    .setPermissions({ admin: true }),
    executes(ctx) {
        ctx.execute((sender) => {
            sender.runCommandAsync('kill @e[type=item]');
            sender.response.send('Lag have been cleared');
        });
    }
});
