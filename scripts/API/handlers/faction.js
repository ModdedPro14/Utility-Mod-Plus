import { world } from "@minecraft/server";
import config from "../../config/main";
import { Databases } from "./databases";

const factionPrefix = 'faction-';

export class factions {
    /**
     * Checks if a player is in a faction
     * @param {any} player The player
     * @returns 
     */
    isInFaction(player) {
        return Boolean(player.getTags().find(tag => tag.startsWith(factionPrefix)));
    }
    /**
     * Checks if a player is a faction owner
     * @param {any} player The player
     * @returns 
     */
    isFactionOwner(player) {
        return Boolean(player.getTags().find(tag => tag.startsWith('factionOwner:')));
    }
    /**
     * Gets all members that are online in a faction
     * @param {any} faction The faction
     * @returns 
     */
    getAllMembersOnlineInAFaction(faction) {
        return [...world.getPlayers({ tags: [`${factionPrefix}§a${faction}`] })].length;
    }
    /**
     * Gets the faction of a player
     * @param {any} player The player
     * @returns 
     */
    getPlayersFaction(player) {
        const factionTag = player.getTags().find(tag => tag.startsWith(factionPrefix));
        const factionName = factionTag?.replace(factionPrefix, '');
        return factionName;
    }
    /**
     * Gets the faction from the owner
     * @param {any} player The player
     * @returns 
     */
    getPlayersOwnerFaction(player) {
        const factionTag = player.getTags().find(tag => tag.startsWith('factionOwner:'));
        const factionName = factionTag?.replace('factionOwner:', '');
        return factionName;
    }
    /**
     * Gets the players faction without the first color
     * @param {any} player The player
     * @returns 
     */
    getPlayersFactionWithNoColors(player) {
        const factionTag = player.getTags().find(tag => tag.startsWith(`${factionPrefix}§a`));
        const factionName = factionTag?.replace(`${factionPrefix}§a`, '');
        return factionName;
    }
    /**
     * Creates a new faction
     * @param {any} name The name of the faction 
     * @param {any} owner The owner of the faction 
     */
    newFaction(name, owner) {
        Databases.factions.write(name, {
            name: name,
            createdAt: new Date().toLocaleString(),
            owner: owner,
            allies: [],
            enemies: [],
            home: undefined
        });
    }
    /**
     * Gets a chunk where the player is
     * @param {any} player The player
     * @returns 
     */
    getChunk(player) {
        return [~~((player.location.x + 1) / 16), ~~((player.location.z + 1) / 16)];
    }
    /**
     * Gets the claim owner
     * @param {any} chunk The chunk
     * @returns 
     */
    getClaimOwner(chunk) {
        if (!Databases.claims.has(chunk))
            return;
        return Databases.claims.read(chunk).owner;
    }
    /**
     * Checks if a chunk is claimed
     * @param {any} chunk The chunk
     * @returns 
     */
    isChunkClaimed(chunk) {
        return Boolean(Databases.claims.has(chunk));
    }
    /**
     * Creates a new claim
     * @param {any} owner The owner 
     * @param {any} claimArea The claim area
     */
    newClaim(owner, claimArea) {
        Databases.claims.write(claimArea, { owner: owner.name, faction: this.getPlayersFaction(owner) });
        owner.score.removeScore(config.currency, Number(config.claimCost));
    }
    /**
     * Deletes a claim
     * @param {any} claimArea The claim area
     * @returns 
     */
    unclaim(claimArea) {
        return Databases.claims.delete(claimArea);
    }
}
