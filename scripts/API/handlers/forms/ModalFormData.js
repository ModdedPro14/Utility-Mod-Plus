import { ModalFormData } from '@minecraft/server-ui';
import { system } from '@minecraft/server';

export class ModalForm {
    /**
     * ModalForm Builder service manager
     */
    constructor() {
        this.form = new ModalFormData();
    }
    /**
     * Sets the title of the modal form
     * @param {any} title The title to set
     * @returns 
     */
    setTitle(title) {
        this.form.title(title);
        return this;
    }
    /**
     * Adds a text field to the modal form
     * @param {any} name The name of the textfield 
     * @param {any} value The value of the textfield
     * @param {any} defaultValue The default value of the textfield 
     * @returns 
     */
    addTextField(name, value, defaultValue) {
        this.form.textField(name, value, defaultValue);
        return this;
    }
    /**
     * Adds a dropdown menu to the modal form
     * @param {any} name The name of the dropdown
     * @param {any[]} values The values of the dropdown
     * @returns 
     */
    addDropDown(name, values) {
        this.form.dropdown(name, values);
        return this;
    }
    /**
     * Adds a slider to the modal form
     * @param {any} name The name of the slider 
     * @param {number} minValue The minumim value of the slider 
     * @param {number} maxValue The maximum value of the slider
     * @param {number} valueStep The value step of the slider
     * @param {number} defaultValue The default value of the slider
     * @returns 
     */
    addSlider(name, minValue, maxValue, valueStep, defaultValue) {
        this.form.slider(name, minValue, maxValue, valueStep, defaultValue);
        return this;
    }
    /**
     * Adds a toggle to the modal form
     * @param {any} name The name of the toggle 
     * @param {boolean} defaultValue The default value of the toggle
     * @returns 
     */
    addToggle(name, defaultValue) {
        this.form.toggle(name, defaultValue);
        return this;
    }
    /**
     * Shows the modal form
     * @param {any} player The player to show too
     * @param {(result: { formValues: any[], canceled: boolean, cancelationReason: 'UserBusy' | 'UserClosed'}) => void} callback Callback
     */
    show(player, callback) {
        this.form.show(player).then((res) => {
            if (!callback)
                return;
            callback(res);
        });
    }
    /**
     * Force show the modal form
     * @param {any} player The player to force show too
     * @param {(result: { formValues: any[], canceled: boolean, cancelationReason: 'UserBusy' | 'UserClosed'}) => void} callback Callback
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
        player.response.error('ModalForm cancelled. Reason: timedOut');
    }
}
