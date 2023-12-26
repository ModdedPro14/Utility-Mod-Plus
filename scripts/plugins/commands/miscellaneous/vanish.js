import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('vanish')
    .setDescription('Makes you invisible to others')
    .setCategory('miscellaneous')
    .setPermissions({ admin: true })
    .setAliases(['v']),
    executes(ctx) {
        ctx.execute((sender) => {
            if (!sender.gamemode.vanished()) sender.gamemode.setGamemode('vanish');
            else sender.gamemode.setGamemode('unvanish');
        });
    }
})