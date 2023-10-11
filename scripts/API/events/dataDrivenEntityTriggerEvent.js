import { world } from "@minecraft/server";

export class DataDrivenEntityTriggerEvent {
    on(callback) {
        world.beforeEvents.dataDrivenEntityTriggerEvent.subscribe((data) => {
            callback(data)
        });
        return this;
    }
}