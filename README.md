# Branch Cleaner

This action can clean the repo's branches that no need anymore.

## Usage

```yaml
- uses: RiceBen/branch-cleaner-action@v1.0.0
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
    expiry-period-in-days: 90
    
    # Force delete the branch which is expiry no matter it has commits ahead
    is-force-delete: false
```
