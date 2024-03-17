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
      expect(actual).toEqual(['hotfix/some-issue']);
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
  it.each(onlyOneNonProtectedBranch)(
    'only one non-protected branch and regex pattern matched',
    async branches => {
      // arrange
      const mockInputs: IActionInputsSettings = {
        isForceDelete: true,
        expiryDays: 90,
        protectBranchNames: ['main', 'master', 'hotfix/*'],
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
    'only one non-protected branch and regex pattern not matched',
    async branches => {
      // arrange
      const mockInputs: IActionInputsSettings = {
        isForceDelete: true,
        expiryDays: 90,
        protectBranchNames: ['main', 'master', 'release/*'],
      };
      // act
      const actual: string[] = await helper.filterByBranches(
        branches,
        mockInputs,
      );
      // action
      expect(actual.length).toBe(1);
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
      expect(actual).toEqual(['feature/some-feature-branch']);
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
      expect(actual).toEqual([
        'hotfix/some-issue',
        'feature/some-feature-branch',
      ]);
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

  it.each(multiNonProtectedBranches)(
    'multiple non-protected branches and no regex pattern match any protected branch',
    async branches => {
      // arrange
      const mockInputs: IActionInputsSettings = {
        isForceDelete: true,
        expiryDays: 90,
        protectBranchNames: ['main', 'master', 'fixed/*', 'released/*'],
      };
      // act
      const actual: string[] = await helper.filterByBranches(
        branches,
        mockInputs,
      );
      // assert
      expect(actual.length).toBe(2);
      expect(actual).toEqual([
        'hotfix/some-issue',
        'feature/some-feature-branch',
      ]);
    },
  );

  it.each(multiNonProtectedBranches)(
    'multiple non-protected branches and all regex pattern match protected branch',
    async branches => {
      // arrange
      const mockInputs: IActionInputsSettings = {
        isForceDelete: true,
        expiryDays: 90,
        protectBranchNames: ['main', 'master', 'hotfix/*', 'feature/*'],
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

describe('branch-helper commit date filter logic test suites', () => {
  const testBranchDetail: RestEndpointMethodTypes['repos']['getBranch']['response'][] =
    [
      {
        headers: {},
        status: 200,
        url: 'https://api.github.com/repos/YourName/your_repo/commits/7fd1a60b01f91b314f59955a4e4d4e80d8edf11d',
        data: {
          name: 'hotfix/some-issue',
          commit: {
            sha: '7fd1a60b01f91b314f59955a4e4d4e80d8edf11d',
            node_id:
              'MDY6Q29tbWl0MTI5NjI2OTo3ZmQxYTYwYjAxZjkxYjMxNGY1OTk1NWE0ZTRkNGU4MGQ4ZWRmMTFk',
            url: 'https://api.github.com/repos/YourName/your_repo/commits/7fd1a60b01f91b314f59955a4e4d4e80d8edf11d',
            comments_url:
              'https://api.github.com/repos/YourName/your_repo/commits/7fd1a60b01f91b314f59955a4e4d4e80d8edf11d/comments',
            html_url:
              'https://github.com/YourName/your_repo/commit/7fd1a60b01f91b314f59955a4e4d4e80d8edf11d',
            commit: {
              author: {
                name: 'YourName',
                email: 'YourEmail@mail.com',
                date: '2024-02-14T02:14:00Z',
              },
              committer: {
                name: 'YourName',
                email: 'YourEmail@mail.com',
                date: '2024-02-14T02:14:00Z',
              },
              message: 'This is latest commit message',
              tree: {
                sha: 'b4eecafa9be2f2006ce1b709d6857b07069b4608',
                url: 'https://api.github.com/repos/YourName/your_repo/git/trees/b4eecafa9be2f2006ce1b709d6857b07069b4608',
              },
              url: 'https://api.github.com/repos/YourName/your_repo/git/commits/7fd1a60b01f91b314f59955a4e4d4e80d8edf11d',
              comment_count: 0,
              verification: {
                verified: false,
                reason: 'unsigned',
                signature: null,
                payload: null,
              },
            },
            author: {
              login: 'YourName',
              id: 9413662,
              node_id: 'MDY6Q29tbWl0MTI5NjI2',
              avatar_url: '',
              events_url: '',
              followers_url: '',
              following_url: '',
              gists_url: '',
              gravatar_id: '',
              organizations_url: '',
              received_events_url: '',
              starred_url: '',
              subscriptions_url: '',
              url: 'https://api.github.com/users/YourName',
              html_url: 'https://api.github.com/users/YourName',
              repos_url: '',
              type: 'User',
              site_admin: false,
            },
            committer: {
              avatar_url: 'https://avatars.githubusercontent.com/u/9413662?v=4',
              events_url: '',
              followers_url: '',
              following_url: '',
              gists_url: '',
              gravatar_id: '',
              html_url: 'https://api.github.com/users/YourName',
              id: 9413662,
              node_id: 'MDY6Q29tbWl0MTI5NjI2',
              login: 'YourName',
              organizations_url: '',
              received_events_url: '',
              repos_url: 'https://api.github.com/repos/YourName/your_repo',
              site_admin: false,
              starred_url: '',
              subscriptions_url: '',
              type: 'User',
              url: 'https://api.github.com/users/YourName',
            },
            parents: [
              {
                sha: 'dda7c47699ca734f177705e3fe4ac39d0fc6489c',
                url: 'https://api.github.com/repos/YourName/your_repo/commits/dda7c47699ca734f177705e3fe4ac39d0fc6489c',
              },
            ],
          },
          _links: {
            self: 'https://api.github.com/repos/YourName/your_repo/branches/branch_name',
            html: 'https://github.com/YourName/your_repo/tree/branch_name',
          },
          protection: {
            enabled: false,
            required_status_checks: {
              enforcement_level: 'off',
              contexts: [],
              checks: [],
            },
          },
          protected: false,
          protection_url:
            'https://api.github.com/repos/YourName/your_repo/branches/branch_name/protection',
        },
      },
    ];

  it.each(testBranchDetail)(
    'latest commit date not expiry yet',
    async branchDetail => {
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
      const present_date = new Date(Date.UTC(2024, 2, 22, 2, 22, 22));
      // act
      const result = await helper.filterByDate(
        branchDetail,
        mockInputs,
        present_date,
      );
      // assert
      expect(result).toBe(false);
    },
  );

  it.each(testBranchDetail)(
    'latest commit date exactly on the expiry date',
    async branchDetail => {
      // arrange
      const mockInputs: IActionInputsSettings = {
        isForceDelete: true,
        expiryDays: 1,
        protectBranchNames: [
          'main',
          'master',
          'hotfix/some-issue',
          'feature/some-feature-branch',
        ],
      };
      const present_date = new Date(Date.UTC(2024, 2, 15, 2, 14, 0));
      // act
      const result = await helper.filterByDate(
        branchDetail,
        mockInputs,
        present_date,
      );
      // assert
      expect(result).toBe(true);
    },
  );

  it.each(testBranchDetail)(
    'latest commit date already expiry in month',
    async branchDetail => {
      // arrange
      const mockInputs: IActionInputsSettings = {
        isForceDelete: true,
        expiryDays: 30,
        protectBranchNames: [
          'main',
          'master',
          'hotfix/some-issue',
          'feature/some-feature-branch',
        ],
      };
      const present_date = new Date(Date.UTC(2024, 5, 14, 2, 14, 0));
      // act
      const result = await helper.filterByDate(
        branchDetail,
        mockInputs,
        present_date,
      );
      // assert
      expect(result).toBe(true);
    },
  );

  it.each(testBranchDetail)(
    'latest commit date already expiry in years',
    async branchDetail => {
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
      const present_date = new Date(Date.UTC(2424, 2, 14, 2, 14, 0));
      // act
      const result = await helper.filterByDate(
        branchDetail,
        mockInputs,
        present_date,
      );
      // assert
      expect(result).toBe(true);
    },
  );
});
