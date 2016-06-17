# Contributing to github-original-streak

✨ Thanks for contributing  ✨

Please note that this project is released with a [Contributor Code of Conduct](code-of-conduct.md). By participating in this project you agree to abide by its terms.

## Conventions

### Pull Request

- Address only one use case in one PR.
- Ensure test compliance
- Keep the PR as short as possible
- Write readable code
- Avoid confusing one liners

### Commit messages

- Please follow [this commit message convention](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#-git-commit-guidelines)
- If you like to ease the process, you can use [commitizen](https://github.com/commitizen/cz-cli#conventional-commit-messages-as-a-global-utility)
- Please add [`[ci skip]`](https://docs.travis-ci.com/user/customizing-the-build/#Skipping-a-build) to the commit messages for documentation only changes

### Setup

1. Fork the repo
2. Clone your fork
3. Make a branch for your feature/fix/etc.
4. Run `npm install` (make sure you have node and npm installed first)
5. Run `npm run build:watch`, it will watch for changes and generate the bundles at `chrome/src` & `firefox/data`
6. Test the extension locally
  - Navigate to `chrome://extensions`
  - Check `Developer mode`
  - Click `Load unpacked extension`
  - Navigate to local folder
  - And follow the instruction
7. Commit the changes, run `npm run commit`
  - Follow the instruction displayed in the prompt
8. Push your branch to your fork
9. Create a pull request from your branch on your fork to master on this repo.
10. Get merged! 🎉 🎊
