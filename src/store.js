const GitHub = require('github-api');
const secret = require('./secret.json');

const gistHash = '5d89d59e4e9355ff5e8316b40dcebf09';
const gh = new GitHub({
    token: secret.token
});

const gist = gh.getGist(gistHash);

function isdefaultView() {
    return window.location.search === ""
}

function set(user, startDate, asked) {
    if (user && startDate && gist && isdefaultView) {
        const data = {
            files: {}
        };
        data.files[user] = {
            content: `${startDate}#${startDate}@${asked ? '1' : '0'}`
        };
        gist.update(data);
    }
}

// Deprecated
function del(user) {
    if (user && gist) {
        const data = {
            files: {}
        };
        data.files[user] = null;
        gist.update(data);
    }
}

function delAndBackup(user, backup) {
    if (user && gist && backup) {
        const data = {
            files: {}
        };
        data.files[user] = {
            content: `#${backup}`
        };
        gist.update(data);
    }
}

const get = new Promise((resolve, reject) => {
    if (gist) {
        gist.read((err, result) => {
            if (err) {
                reject();
            } else {
                resolve(result);
            }
        });
    } else {
        reject();
    }
});

module.exports = {get, set, delAndBackup, del};
