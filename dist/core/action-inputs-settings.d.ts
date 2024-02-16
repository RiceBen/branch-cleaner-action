export interface IActionInputsSettings {
    /**
     * Set a threshold to determine this branch is dead or not
     * @type {number}
     * */
    expiryDays: number;
    /**
     * Secure these branches
     * @type {string[]}
     * */
    protectBranchNames: string[];
    /**
     * Delete branch no matter commit ahead base-branch or not
     * @type {boolean}
     * */
    isForceDelete: boolean;
}
