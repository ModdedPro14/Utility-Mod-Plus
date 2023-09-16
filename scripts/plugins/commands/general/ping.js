import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('ping')
    .setDescription('Returns the current TPS of the world')
    .setCategory('general')
    .setAliases(['tps']),
    executes(ctx) {
        ctx.execute((sender) => {
            sender.response.send(`PONG! TPS: ${CX.extra.tps()}`);
        });
    }
});
