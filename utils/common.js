const pool = require('../dbconfig');

exports.returnPromise = query => new Promise((resolve, reject) => {
	pool.query(query, (error, results) => {
		if (error) {
			return reject(error);
		}
		return resolve(results);
	});
});
