import { CX } from "../../../API/CX";
import { ItemDB } from "../../../API/Item Database/main";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('test')
    .setDescription('sasa'),
    executes(ctx) {
        ctx.execute(() => {
            new ItemDB('expiredAuctions').clearIDs()
            console.warn('Cleared')
        })
    }
})