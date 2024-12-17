import * as core from '@actions/core';
import * as github from '@actions/github';
import * as inputHelper from './core/input-helper';
import * as branchHelper from './core/branch-helper';

async function run() {
  try {
    const secToken: string = core.getInput('secToken', {
      required: true,
      trimWhitespace: true,
    });

    const octokit = github.getOctokit(secToken);
    const {owner: targetOwner, repo: targetRepo} = github.context.repo;

    const defaultBranch = await octokit.rest.repos.get({
      owner: targetOwner,
      repo: targetRepo,
      headers: {
        accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    core.info(`default branch:${defaultBranch.data.default_branch}`);

    const inputs = await inputHelper.getInputs();

    if (
      !inputs.protectBranchNames.includes(defaultBranch.data.default_branch)
    ) {
      inputs.protectBranchNames.push(defaultBranch.data.default_branch);
      core.info(
        `Insert ${defaultBranch.data.default_branch} into protected branches list`,
      );
    }

    const branches = await octokit.rest.repos.listBranches({
      owner: targetOwner,
      repo: targetRepo,
      protected: false,
      per_page: 50,
      headers: {
        accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const targetBranches: string[] = await branchHelper.filterByBranches(
      branches,
      inputs,
    );

    if (targetBranches.length === 0) {
      core.info('No branch need to delete, your repo is shiny!');
      return;
    }

    core.startGroup('Cleaner process start');

    for (const branch in targetBranches) {
      core.info(`Candidate Branch:${targetBranches[branch]}`);

      const branchDetail = await octokit.rest.repos.getBranch({
        owner: targetOwner,
        repo: targetRepo,
        branch: targetBranches[branch],
        headers: {
          accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (await branchHelper.filterByDate(branchDetail, inputs, new Date())) {
        // branches remains on previous step, whether it's commit ahead default branch or not
        const result = await octokit.rest.repos.compareCommitsWithBasehead({
          owner: targetOwner,
          repo: targetRepo,
          basehead: `${defaultBranch.data.default_branch}...${branchDetail.data.name}`,
          mediaType: {format: 'json'},
          headers: {
            accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });

        core.info(
          `branch ${branchDetail.data.name} compare with ${defaultBranch.data.default_branch} status:${result.data.status}`,
        );

        if (!inputs.isForceDelete && result.data.ahead_by > 0) {
          core.info(
            `Will not delete branch:${branchDetail.data.name} cause of isForceDelete:${inputs.isForceDelete} && ahead commit:${result.data.ahead_by}`,
          );
          continue;
        }

        await octokit.rest.git.deleteRef({
          owner: targetOwner,
          repo: targetRepo,
          ref: `heads/${branchDetail.data.name}`,
          headers: {
            accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });

        core.info(`Delete branch:${branchDetail.data.name} finished.`);
      }
    }

    core.endGroup();
  } catch (err) {
    core.setFailed((err as Error).message);
  }
}

run()
  .then(() => core.info('Cleaner process Finished'))
  .catch(error => core.setFailed((error as Error).message));
