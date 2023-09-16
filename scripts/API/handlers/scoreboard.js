import { world } from '@minecraft/server';
export class scoreboard {
    /**
     * Get a score
     * @param {any} player The player to get the score from
     * @param {any} objective The objective to get the score from
     * @returns 
     */
    get(player, objective) {
        try {
            return world.scoreboard.getObjective(objective).getScore(player.scoreboardIdentity);
        } catch {return 0;}
        
    }
    /**
     * Set a players objective to a value
     * @param {any} player The player to set the objective to
     * @param {any} objective The objective to set
     * @param {number} value The value to set the objective to
     * @returns 
     */
    set(player, objective, value = 0) {
        try {
            return player.runCommandAsync(`scoreboard players set @s "${objective}" ${value}`);
        }
        catch { }
    }
    /**
     * Add a score to an objective to a player
     * @param {any} player The player to add the score to
     * @param {any} objective The objective to add the score to
     * @param {number} value The value to add to the objective of the player
     * @returns 
     */
    add(player, objective, value = 0) {
        try {
            return player.runCommandAsync(`scoreboard players add @s "${objective}" ${value}`);
        }
        catch { }
    }
    /**
     * Reset a players score
     * @param {any} player The player to reset the score to
     * @param {any} objective The objective to reset
     * @returns 
     */
    reset(player, objective) {
        return player.runCommandAsync(`scoreboard players reset @s "${objective}"`);
    }
    /**
     * Remove an amount of score from a player
     * @param {any} player The player to remove the score from
     * @param {any} objective The objective to remove the score from
     * @param {number} value The amount to remove
     * @returns 
     */
    remove(player, objective, value = 0) {
        try {
            return player.runCommandAsync(`scoreboard players remove @s "${objective}" ${value}`);
        }
        catch { }
    }
}