import { Databases } from "./databases";
class Area {
    /**
     * Implements a location as an area
     * @param {any} player The player to check for
     * @param {any} data The data location
     * @returns 
     */
    static as(player, data) {
        for (const area of Databases.areas.values()) {
            if (area?.dimension !== player.dimension.id) continue;
            if (!area?.pos2 || !area?.pos2 || !area?.pos1 || !area?.pos1) continue;
            const isInArea = data[0] >= Math.min(area.pos1.x, area.pos2.x) && data[0] <= Math.max(area.pos1.x, area.pos2.x) && data[1] >= Math.min(area.pos1.z, area.pos2.z) && data[1] <= Math.max(area.pos1.z, area.pos2.z);
            if (isInArea)
                return {
                    isInArea,
                    permissions: area.permissions
                };
        }
        return {
            isInArea: false
        };
    }
}
export { Area };
