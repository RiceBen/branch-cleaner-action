'use strict';
import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods';
import * as helper from '../src/core/branch-helper';
import {IActionInputsSettings} from '../src/core/action-inputs-settings';

describe('branch-helper branch name filter logic test suites', () => {
  const noNonProtectedBranch: RestEndpointMethodTypes['repos']['listBranches']['response'][] =
    [
      {
        headers: {},
        status: 200,
        url: 'your_url',
        data: [],
      },
    ];
  const onlyOneNonProtectedBranch: RestEndpointMethodTypes['repos']['listBranches']['response'][] =
    [
      {
        headers: {},
        status: 200,
        url: 'your_url',
        data: [
          {
            name: 'hotfix/some-issue',
            commit: {
              sha: 'c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
              url: 'https://api.github.com/repos/octocat/Hello-World/commits/c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
            },
            protected: false,
            protection: {
              required_status_checks: {
                enforcement_level: 'non_admins',
                contexts: ['ci-test', 'linter'],
                checks: [
                  {
                    context: '',
                    app_id: null,
                  },
                ],
              },
            },
            protection_url:
              'https://api.github.com/repos/octocat/hello-world/branches/master/protection',
          },
        ],
      },
    ];
  const multiNonProtectedBranches: RestEndpointMethodTypes['repos']['listBranches']['response'][] =
    [
      {
        headers: {},
        status: 200,
        url: 'your_url',
        data: [
          {
            name: 'hotfix/some-issue',
            commit: {
              sha: 'c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
              url: 'https://api.github.com/repos/octocat/Hello-World/commits/c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
            },
            protected: false,
            protection: {
              required_status_checks: {
                enforcement_level: 'non_admins',
                contexts: ['ci-test', 'linter'],
                checks: [
                  {
                    context: '',
                    app_id: null,
                  },
                ],
              },
            },
            protection_url:
              'https://api.github.com/repos/octocat/hello-world/branches/master/protection',
          },
          {
            name: 'feature/some-feature-branch',
            commit: {
              sha: 'e9a52f1ea7c91d0c0df71a34c7fbeeda2479ccbc',
              url: 'https://api.github.com/repos/octocat/Hello-World/commits/e9a52f1ea7c91d0c0df71a34c7fbeeda2479ccbc',
            },
            protected: false,
            protection: {
              required_status_checks: {
                enforcement_level: 'non_admins',
                contexts: ['ci-test', 'linter'],
                checks: [
                  {
                    context: '',
                    app_id: null,
                  },
                ],
              },
            },
            protection_url:
              'https://api.github.com/repos/octocat/hello-world/branches/master/protection',
          },
        ],
      },
    ];

  it.each(noNonProtectedBranch)('no non-protected branch', async branches => {
    // arrange
    const mockInputs: IActionInputsSettings = {
      isForceDelete: true,
      expiryDays: 90,
      protectBranchNames: ['main', 'master'],
    };
    // act
    const actual: string[] = await helper.filterByBranches(
      branches,
      mockInputs,
    );

    // action
    expect(actual.length).toBe(0);
  });

  it.each(noNonProtectedBranch)(
    'no non-protected branch and no branch need to be protected',
    async branches => {
      // arrange
      const mockInputs: IActionInputsSettings = {
        isForceDelete: true,
        expiryDays: 90,
        protectBranchNames: [],
      };
      // act
      const actual: string[] = await helper.filterByBranches(
        branches,
        mockInputs,
      );

      // action
      expect(actual.length).toBe(0);
    },
  );

  it.each(onlyOneNonProtectedBranch)(
    'only one non-protected branch and not in protected branches list',
    async branches => {
      // arrange
      const mockInputs: IActionInputsSettings = {
        isForceDelete: true,
        expiryDays: 90,
        protectBranchNames: ['main', 'master'],
      };
      // act
      const actual: string[] = await helper.filterByBranches(
        branches,
        mockInputs,
      );

      // assert
      expect(actual.length).toBe(1);
    },
  );

  it.each(onlyOneNonProtectedBranch)(
    'only one non-protected branch and in protected branches list',
    async branches => {
      // arrange
      const mockInputs: IActionInputsSettings = {
        isForceDelete: true,
        expiryDays: 90,
        protectBranchNames: ['main', 'master', 'hotfix/some-issue'],
      };
      // act
      const actual: string[] = await helper.filterByBranches(
        branches,
        mockInputs,
      );
      // assert
      expect(actual.length).toBe(0);
    },
  );

  it.each(multiNonProtectedBranches)(
    'multiple non-protected branches and match one protected branch',
    async branches => {
      // arrange
      const mockInputs: IActionInputsSettings = {
        isForceDelete: true,
        expiryDays: 90,
        protectBranchNames: ['main', 'master', 'hotfix/some-issue'],
      };
      // act
      const actual: string[] = await helper.filterByBranches(
        branches,
        mockInputs,
      );
      // assert
      expect(actual.length).toBe(1);
    },
  );

  it.each(multiNonProtectedBranches)(
    'multiple non-protected branches and no match any protected branch',
    async branches => {
      // arrange
      const mockInputs: IActionInputsSettings = {
        isForceDelete: true,
        expiryDays: 90,
        protectBranchNames: ['main', 'master'],
      };
      // act
      const actual: string[] = await helper.filterByBranches(
        branches,
        mockInputs,
      );
      // assert
      expect(actual.length).toBe(2);
    },
  );

  it.each(multiNonProtectedBranches)(
    'multiple non-protected branches and all match protected branch',
    async branches => {
      // arrange
      const mockInputs: IActionInputsSettings = {
        isForceDelete: true,
        expiryDays: 90,
        protectBranchNames: [
          'main',
          'master',
          'hotfix/some-issue',
          'feature/some-feature-branch',
        ],
      };
      // act
      const actual: string[] = await helper.filterByBranches(
        branches,
        mockInputs,
      );
      // assert
      expect(actual.length).toBe(0);
    },
  );
});
