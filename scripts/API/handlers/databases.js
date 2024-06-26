import { Database } from "../database/DB";

class DBS {
    /**
     * DBS service manager
     */
    constructor() {
        /**
         * Auction claims database
         */
        this.auctionClaims = new Database('auctionClaims');
        /**
         * Homes database
         */
        this.homes = new Database('homes');
        /**
         * Areas database
         */
        this.areas = new Database('areas');
        /**
         * Sellable items database
         */
        this.sellableItems = new Database('sellableItems');
        /**
         * Custom commands database
         */
        this.customCmds = new Database('customCmds');
        /**
         * Server database
         */
        this.server = new Database('server');
        /**
         * Kit database
         */
        this.kit = new Database('kit');
        /**
         * Settings database
         */
        this.settings = new Database('settings');
        /**
         * Bans database
         */
        this.bans = new Database('ban');
        /**
         * Factions database
         */
        this.factions = new Database('factions');
        /**
         * Claims database
         */
        this.claims = new Database('claims');
        /**
         * Enchantments database
         */
        this.enchantments = new Database('enchantments');
        /**
         * Warps database
         */
        this.warps = new Database('warps')
        /**
         * Guis database
         */
        this.guis = new Database('guis')
        /**
         * Shop categories database
         */
        this.shopCategories = new Database('shopCategories')
        /**
         * Vaults database
         */
        this.vaults = new Database('vaults')
        /**
         * Reports database
         */
        this.reports = new Database('reports')
        /** 
         * Report settings database
         */
        this.reportSettings = new Database('reportSettings')
        /**
         * Registrations database
         */
        this.registrations = new Database('registrations')
        /**
         * Mails database
         */
        this.mails = new Database('mails')
        /** 
         * Players database
         */
        this.players = new Database('players')
    }
}
export const Databases = new DBS();