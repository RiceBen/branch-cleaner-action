# Branch Cleaner

This action can clean the repo's branches that no need anymore.

## Inputs

| input                 | require | description                                                 |
|-----------------------|---------|-------------------------------------------------------------|
| secToken              | Y       | Github secret token to access the repo                      |
| protect-branch-name   | N       | Specify branches cannot delete.                             |
| expiry-period-in-days | Y       | Define the day period as expired.                           |
| is-force-delete       | Y       | Delete the branch even it has commits ahead default branch. |

You can use `${{ secrets.GITHUB_TOKEN }}` to get a proper permission to this action.

This action will avoid delete the default branch in the repo, so even if you do not set any branches in `protect-branch-name` your default branch is fine.

### Limitation

- This action, only fetch the branches which is not in protected.
  > if you want to delete the branch that is under protected, please unprotected it first.

- This action need `contents` write permission.
  > For more detail on token permission please [reference](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token) this post.

## Usage

Here is a simple Job setting for the action. It's recommend to trigger this job by `workflow_dispatch` or `schedule`.

```yaml
jobs:
  cleaner:
    runs-on: ubuntu-latest
    # Token needs write permission on contents 
    permissions:
      contents: write
    steps:
      - name: Clean Branches
        uses: RiceBen/branch-cleaner-action@v1.1.0
        with:
          # Personal access token (PAT) used to fetch the repository. The PAT is configured
          # with the local git config, which enables your scripts to run authenticated git
          # commands.
          secToken: ${{ secrets.GITHUB_TOKEN }}
          # Protect the branch that you do not want them to be deleted by this action.
          # You can leave this parameter blank, action won't delete the default branch.
          protect-branch-name: |
            main
            master
          # Set the threshold to when the branch should abandon
          expiry-period-in-days: 190
          # Force delete the branch which is expiry no matter it has commits ahead
          is-force-delete: false
```

## How To Build

It's recommand to use [Volta](https://volta.sh/) to management node engine.

- checkout the directory of the project root floder

- `volta pin node@20`
  - Use the version 20 or above, you can check the version that specify in `package.json` file.

- `npm install`

- `npm run test`

- `npm run build`
  - After execution you will update the `index.js` in `dict` directory.
