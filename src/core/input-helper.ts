import * as core from '@actions/core';
import {IActionInputsSettings} from './action-inputs-settings';

export async function getInputs(): Promise<IActionInputsSettings> {
  const result = {} as IActionInputsSettings;

  core.startGroup('Grabs inputs and validate');

  const expiryDays: number = parseInt(
    core.getInput('expiry-period-in-days', {
      required: true,
      trimWhitespace: true,
    }),
    10,
  );

  if (isNaN(expiryDays)) {
    throw new TypeError('input expiry-period-in-days value must be a number');
  }
  core.info(`Expiry days:${expiryDays}`);

  const branchNames: string[] = core.getMultilineInput('protect-branch-name', {
    required: false,
    trimWhitespace: true,
  });

  core.info(`protect branches:${branchNames}`);

  const noMatterCommitAhead: boolean = core.getBooleanInput('is-force-delete', {
    required: true,
    trimWhitespace: true,
  });
  core.info(`is-force-delete:${noMatterCommitAhead}`);

  result.expiryDays = expiryDays;
  result.protectBranchNames = branchNames;
  result.isForceDelete = noMatterCommitAhead;

  core.endGroup();

  return result;
}
