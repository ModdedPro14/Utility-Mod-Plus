import { CX } from "../../../API/CX";
import config from "../../../config/main";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('info')
    .setDescription('Provides you with information about this server or Mod-Utility')
    .setCategory('general'),
    executes(ctx) {
        ctx.execute((sender) => {
            sender.response.send(`§l§6-----<[Information]>-----\n§8Version:§a ${config.version}\n§8Discord:§a ${config.discord} - mp09\n§8Youtube: §a${config.youtube} - MP09\n§8Prefix: §a${config.prefix}\n§8Omlet: §a${config.omlet}\n§6-----------------------`, true, false);
        });
    }
});
