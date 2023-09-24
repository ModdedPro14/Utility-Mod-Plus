import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('broadcast')
    .setDescription('Send a message to the entire server')
    .setCategory('general')
    .setAdmin(true)
    .firstArguments(['message'], false)
    .addAnyArgument('message', [], 1),
    executes(ctx) {
        ctx.execute((sender, args) => !args.length && sender.response.error('You must type a message to broadcast'));
        ctx.executeArgument('message', (_, value) => {
            CX.extra.broadcast(value);
        });
    }
});
