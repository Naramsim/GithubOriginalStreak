const GitHub = require('github-api');
const secret = require('./secret.json');

const gh = new GitHub({
    token: secret.token
});

const repo = gh.getRepo('Naramsim', 'GithubOriginalStreak');

function get(user) {
    return repo.getContents('master', `database/${user}`, true)
}

module.exports = {get};
