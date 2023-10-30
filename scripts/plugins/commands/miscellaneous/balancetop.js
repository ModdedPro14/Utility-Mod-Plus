import { CX } from "../../../API/CX";
import { Player, world } from "@minecraft/server";
import config from "../../../config/main";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('balancetop')
    .setDescription('Shows the top 10 players on the balance')
    .setCategory('miscellaneous')
    .setAliases(['baltop']),
    executes(ctx) {
        ctx.execute((sender) => {
            let lb = []
            world.scoreboard.getObjective(config.currency).getParticipants().forEach((v, i) => {
                if (!(v?.getEntity() instanceof Player)) return
                lb.push({ i: ++i, name: v.getEntity().name, score: CX.scoreboard.get(v.getEntity(), config.currency) })
            })
            lb = lb.sort((a, b) => a.score - b.score).map((v) => `§b#${v.i} §r§c${v.name} §r§e${CX.extra.parseNumber(v.score)}`)
            lb = lb.slice(0, 10)
            if (!lb.length) return sender.response.error('There are no top balances yet')
            sender.response.send(`-------< Top Balance >-------\n${lb.join('\n')}`, true, false)
        })
    }
})