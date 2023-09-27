import { CX } from "../../API/CX";
import { Databases } from "../../API/handlers/databases";

CX.Build(CX.BuildTypes["@event"], {
    data: 'PlayerSpawn',
    executes(player, data) {
        player.welcome();
        if (data.initialSpawn) {
            if (player.score.getScore('inCombat') > 0) return player.kill()
            if (Databases.server.has('welcomeMessage')) {
                new CX.messageForm()
                .setTitle(`Welcome! ${player.name}`)
                .setBody(Databases.server.read('welcomeMessage').replaceAll('\\n', '\n').replaceAll('$name', player.name))
                .setButton1('§cClose')
                .setButton2('§aOk')
                .force(player, (_) => { });
            }
        }
    }
});
