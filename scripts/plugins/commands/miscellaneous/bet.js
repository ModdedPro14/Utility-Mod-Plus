import { CX } from "../../../API/CX";
import config from "../../../config/main";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('bet')
    .setDescription('A simple casino bet system')
    .setCategory('miscellaneous')
    .firstArguments(['amount'], true)
    .addNumberArgument('amount'),
    executes(ctx) {
        ctx.executeArgument('amount', (sender, val) => {
            if (!config.betting) return sender.response.error('Betting is not enabled in this server');
            if (val > 500) return sender.response.error('You cannot bet over 500');
            if (`${val}`.startsWith('-')) return sender.response.error('You cannot bet less than 0');
            if (val > sender.score.getScore(config.currency)) return sender.response.error(`You do not have enough ${config.currency}`);
            const chance = ~~(Math.random() * 100);
            if (chance <= 3 && !(chance > 3)) {
                sender.response.send(`You won: §6$${val * 10}`);
                sender.score.addScore(config.currency, val * 10);
            } else if (chance <= 7 && !(chance > 7)) {
                sender.response.send(`You won: §6$${val * 5}`);
                sender.score.addScore(config.currency, val * 5);
            } else if (chance <= 10 && !(chance > 10)) {
                sender.response.send(`You won: §6$${val * 3}`);
                sender.score.addScore(config.currency, val * 3);
            } else if (chance <= 30 && !(chance > 30)) {
                sender.response.send(`You won: §6$${val}`);
                sender.score.addScore(config.currency, val);
            } else if (chance >= 50) {
                sender.response.send(`You lost: §e$${val}`);
                sender.score.removeScore(config.currency, val);
            } else {
                const m = `${val * 3}`.replace('-', '');
                sender.response.send(`You lost: §e$${m}`);
                sender.score.removeScore(config.currency, m);
            }
        });
    }
})
