import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import { IActionInputsSettings } from './action-inputs-settings';
export declare function filterByBranches(branches: RestEndpointMethodTypes['repos']['listBranches']['response'], settings: IActionInputsSettings): Promise<string[]>;
export declare function filterByDate(branch: RestEndpointMethodTypes['repos']['getBranch']['response'], settings: IActionInputsSettings, present_date: Date): Promise<boolean>;
