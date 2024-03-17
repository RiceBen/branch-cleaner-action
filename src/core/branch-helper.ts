import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods';
import {IActionInputsSettings} from './action-inputs-settings';
import * as core from '@actions/core';

export async function filterByBranches(
  branches: RestEndpointMethodTypes['repos']['listBranches']['response'],
  settings: IActionInputsSettings,
): Promise<string[]> {
  if (branches.data.length === 0) {
    core.warning('Cannot get non-protected branches from repo');
    return [];
  }

  const result = branches.data
    .map(item => {
      const {name} = item;
      return {name};
    })
    .filter(item =>
      isBranchNameCanBeDelete(item.name, settings.protectBranchNames),
    );

  return result.map(item => {
    return item.name;
  });
}

export async function filterByDate(
  branch: RestEndpointMethodTypes['repos']['getBranch']['response'],
  settings: IActionInputsSettings,
  present_date: Date,
): Promise<boolean> {
  // check the branch latest commit date
  if (isNaN(Date.parse(branch.data.commit.commit.committer?.date ?? ''))) {
    core.warning(
      `Cannot convert the latest commit date from ${
        branch.data.commit.commit.committer?.date ?? ''
      } to a Date object on the ${
        branch.data.name
      } branch, will not delete this branch.`,
    );
    return false;
  }

  const one_day = 1000 * 60 * 60 * 24;
  const latest_commit_date = new Date(
    branch.data.commit.commit.committer?.date ?? '',
  );

  const result = Math.round(
    (present_date.getTime() -
      latest_commit_date.setDate(
        latest_commit_date.getDate() + settings.expiryDays,
      )) /
      one_day,
  );

  core.debug(
    `branch:${branch.data.name} latest commit date will expiry after ${result} days`,
  );

  return result >= 0;
}

function isBranchNameCanBeDelete(
  branchName: string,
  protectBranchNames: string[],
): boolean {
  const result = protectBranchNames.some((name: string) => {
    return branchName.match(`^${name}`) !== null;
  });

  return !result;
}
