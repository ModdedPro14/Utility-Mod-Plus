import { CX } from "../../../API/CX";
import config from "../../../config/main";
import { world } from "@minecraft/server";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('prefix')
    .setDescription('Change the current prefix of the commands')
    .setCategory('general')
    .setPermissions({ admin: true })
    .firstArguments(['prefix'], false)
    .addAnyArgument('prefix', [], 1),
    executes(ctx) {
        ctx.execute((sender, args) => !args.length && sender.response.error('You must provide a prefix'));
        ctx.executeArgument('prefix', (sender, value) => {
            if (value.startsWith('/')) return sender.response.error('The prefix cant be a /');
            if (value.trim() == '') return sender.response.error('The prefix cant be nothing');
            if (config.prefix == value) return sender.response.error(`The prefix is already "${value}"`);
            for (const plr of world.getPlayers({ tags: [config.adminTag] })) plr.response.send(`The current prefix have been changed from "${config.prefix}"§c to "${value}"§c by ${sender.name}`);
            CX.overRide('prefix', value);
        });
    }
});
