import { system } from "@minecraft/server";
import { MessageFormData } from "@minecraft/server-ui";
export class MessageForm {
    /**
     * MessageForm Builder service manager
     */
    constructor() {
        this.form = new MessageFormData();
    }
    /**
     * Sets the title of the message form
     * @param {any} title The title to set
     * @returns 
     */
    setTitle(title) {
        this.form.title(title);
        return this;
    }
    /**
     * Sets the body of the message form
     * @param {any} body The body to set 
     * @returns 
     */
    setBody(body) {
        this.form.body(body);
        return this;
    }
    /**
     * Sets the first button of the message form
     * @param {any} name The name of the button
     * @returns 
     */
    setButton1(name) {
        this.form.button1(name);
        return this;
    }
    /**
     * Sets the second button of the message form
     * @param {any} name The name of the button
     * @returns 
     */
    setButton2(name) {
        this.form.button2(name);
        return this;
    }
    /**
     * Shows the message form
     * @param {any} player The player to show too 
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
     * Force show the message form
     * @param {any} player The player to force show too
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
        player.response.error('MessageForm cancelled. Reason: timedOut');
    }
    ;
}
