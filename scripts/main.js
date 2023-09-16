import config from "./config/main.js";
import { world } from "@minecraft/server";
import { CX } from "./API/CX.js";

CX.Build(CX.BuildTypes["@event"], {
    data: 'WorldInitialize',
    executes() {
        world.getDimension('overworld').runCommandAsync(`tickingarea add circle 1000000 -60 1000000 4 "db" true`);
    }
});
const startPlugins = () => {
    const date = Date.now();
    Object.keys(config.plugins.commands).forEach(category => Object.keys(config.plugins.commands[category]).forEach(cmd => config.plugins.commands[category][cmd] && import(`./plugins/commands/${category}/${cmd}.js`).catch((err) => console.warn(`Failed to import command: ${cmd} from ${category}, ${err} ${err.stack}`))));
    Object.keys(config.plugins.events).forEach(event => config.plugins.events[event] && import(`./plugins/events/${event}`).catch((err) => console.warn(`Failed to import event: ${event}, ${err} ${err.stack}`)));
    return Object.assign(startPlugins, {
        log() {
            return console.warn(`Plugins have been loaded successfully in ${Date.now() - date}MS`);
        }
    });
};
startPlugins().log();