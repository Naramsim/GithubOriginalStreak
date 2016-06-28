const GitHub = require('github-api');

function set(user, startDate) {
	if (user && startDate) {
		const gh = new GitHub({
			token: '0d6d08e73ee3c1d58406cb60fed822614d3f898b'
		});
		let gist = gh.getGist('3db058b04e2af28d21361fd1fb805dce'); 
		let data = {
			"files": {}
		}
		data.files[user] = {
			"content": startDate
		}
		gist.read(function(err, result){
			console.log(result)
		})
		gist.update(data)
		.then(function(httpResponse) {
			var gistJson = httpResponse.data;
			console.log(gistJson)
		});
	}
}

let get =
	new Promise((resolve, reject) => {
		const gh = new GitHub({
			token: '0d6d08e73ee3c1d58406cb60fed822614d3f898b'
		});
		const gist = gh.getGist('3db058b04e2af28d21361fd1fb805dce'); 
		gist.read(function(err, result){
	        resolve(result);
	    })
	});

module.exports = {'get': get, 'set': set};
