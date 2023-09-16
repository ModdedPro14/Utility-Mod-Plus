import { ActionFormData } from "@minecraft/server-ui";
import { system } from "@minecraft/server";
export class ActionForm {
    /**
     * ActionForm Builder service manager
     */
    constructor() {
        this.form = new ActionFormData();
    }
    /**
     * Sets the title of the action form
     * @param {any} title The title to set
     * @returns 
     */
    setTitle(title) {
        this.form.title(title);
        return this;
    }
    /**
     * Sets the body of the action form
     * @param {any} body The body to set
     * @returns 
     */
    setBody(body) {
        this.form.body(body);
        return this;
    }
    /**
     * Adds a button to the action form
     * @param {any} name The name of the button 
     * @param {any} icon The icon of the button 
     * @returns 
     */
    addButton(name, icon) {
        this.form.button(name, icon);
        return this;
    }
    /**
     * Shows the action form
     * @param {any} player The player to show
     * @param {any} callback Callback 
     */
    show(player, callback) {
        this.form.show(player).then((res) => {
            if (!callback)
                return;
            callback(res);
        });
    }
    /**
     * Force show the action form
     * @param {any} player The player to force on 
     * @param {any} callback Callback
     * @param {number} timeout Amount of ticks to wait before stopping 
     * @returns 
     */
    async force(player, callback, timeout = Infinity) {
        const startTick = system.currentTick;
        while ((system.currentTick - startTick) < timeout) {
            const response = await (this.form.show(player));
            if (response.cancelationReason !== "UserBusy") {
                callback(response);
                return response;
            }
        }
        player.response.error('ActionForm cancelled. Reason: timedOut');
    }
}
