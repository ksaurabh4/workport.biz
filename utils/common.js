const pool = require('../dbconfig');
const { table } = require('./constant');

exports.returnPromise = (query, values) => new Promise((resolve, reject) => {
	if (values) {
		pool.query(query, values, (error, results) => {
			if (error) {
				return reject(error);
			}
			return resolve(results);
		});
	} else {
		pool.query(query, (error, results) => {
			if (error) {
				return reject(error);
			}
			return resolve(results);
		});
	}
});

/**
 *
 * @param {string} tableName
 * @param {string} dbKey
 * @param {string} searchTerm
 * @param {any} searchValue
 * @param {object} reqBody
 * @returns object of update query string and values aray[]
 */
exports.updateQueryBuilder = (tableName, searchTerm, searchValue, reqBody) => {
	let query = `UPDATE ${tableName} SET `;
	const values = [];
	// eslint-disable-next-line no-restricted-syntax
	for (const key in reqBody) {
		if (reqBody[key] !== undefined && reqBody[key] !== null) {
			query += `${table[tableName][key]}=?, `;
			values.push(reqBody[key]);
		}
	}
	query = query.substr(0, query.length - 2);
	query += ` WHERE ${searchTerm}=?`;
	values.push(searchValue);
	return { query, values };
};

exports.addQueryBuilder = (tableName, reqBody) => {
	const query = `INSERT INTO ${tableName} SET ?`;
	const dataObj = {};
	for (key in reqBody) {
		if (reqBody[key] !== undefined && reqBody[key] !== null) {
			dataObj[table[tableName][key]] = reqBody[key];
		}
	}
	return { query, dataObj };
}
