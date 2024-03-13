// import { BlockBreak } from "./blockBreak.js";
// import { BlockPlace } from "./blockPlace.js";
// import { Chat } from "./beforeChat.js";
// import { PlayerSpawn } from "./playerSpawn.js";
// import { ItemUse } from "./beforeItemUse.js";
// import { EntityHurt } from "./entityHurt.js";
// import { ProjectileHitEntity } from "./projectileHitEntity.js";
// import { ItemUseOn } from "./beforeItemUseOn.js";
// import { EntityHitEntity } from "./entityHitEntity.js";
// import { EntityHitBlock } from "./entityHitBlock.js";
// import { WorldInitialize } from "./worldInitialize.js";
// import { AfterBlockBreak } from "./afterBlockBreak.js";
// import { AfterBlockPlace } from "./afterBlockPlace.js";
// import { DataDrivenEntityTriggerEvent } from "./dataDrivenEntityTriggerEvent.js";
// import { PlayerInteractWithEntity } from "./playerInteractWithEntity.js";
// import { PlayerInteractWithBlock } from "./playerInteractWithBlock.js";

import { world } from "@minecraft/server";

// export const events = {
//     BlockBreak,
//     BlockPlace,
//     Chat,
//     PlayerSpawn,
//     ItemUse,
//     EntityHurt,
//     EntityHitEntity,
//     ProjectileHitEntity,
//     ItemUseOn,
//     EntityHitBlock,
//     WorldInitialize,
//     AfterBlockBreak,
//     AfterBlockPlace,
//     DataDrivenEntityTriggerEvent,
//     PlayerInteractWithEntity,
//     PlayerInteractWithBlock
// };


export class Event {
    subscribe(event, callback) {
        world[event.eventType][event.event].subscribe((data) => callback(data))
    }
}