import { system } from "@minecraft/server";
import { CX } from "../../API/CX";
import { Databases } from "../../API/handlers/databases";
import config from "../../config/main";

CX.Build(CX.BuildTypes["@event"], {
    data: 'PlayerSpawn',
    executes(player, data) {
        player.welcome();
        if (data.initialSpawn) {
            if (!Databases.players.has(player.id)) Databases.players.write(player.id, {
                id: player.id,
                name: player.name
            })
            if (player.management.freezed) player.management.freeze()
            if (player.score.getScore('inCombat') > 0) return player.kill()
            if (Databases.server.has('welcomeMessage')) {
                new CX.messageForm()
                .setTitle(`Welcome! ${player.name}`)
                .setBody(Databases.server.read('welcomeMessage').replaceAll('\\n', '\n').replaceAll('$name', player.name))
                .setButton1('§cClose')
                .setButton2('§aOk')
                .force(player, (_) => { });
            }
            if (config.login) {
                player.management.freeze()
                player.removeTag('logged')
                if (!Databases.registrations.has(player.id)) player.response.send(`You must register before playing, use ${config.prefix}register <password> <confirmPassword> to register`, false, false)
                else player.response.send(`You must login before playing, use ${config.prefix}login <password> to login`, false, false)
                system.runTimeout(() => {
                    if (!player.hasTag('logged')) player.runCommandAsync(`kick "${player.name}" Failed to login/register.`)
                }, 700)
            }
        }
    }
});
