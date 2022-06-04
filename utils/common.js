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
	Object.keys(reqBody).forEach((key) => {
		if (reqBody[key] !== undefined && reqBody[key] !== null) {
			query += `${table[tableName][key]}=?, `;
			values.push(reqBody[key]);
		}
	});
	query = query.substr(0, query.length - 2);
	query += ` WHERE ${searchTerm}=?`;
	values.push(searchValue);
	return { query, values };
};

exports.addQueryBuilder = (tableName, reqBody) => {
	const query = `INSERT INTO ${tableName} SET ?`;
	const dataObj = {};
	Object.keys(reqBody).forEach((key) => {
		if (reqBody[key] !== undefined && reqBody[key] !== null) {
			dataObj[table[tableName][key]] = reqBody[key];
		}
	});
	return { query, dataObj };
};

function objectFlip(obj) {
	const ret = {};
	Object.keys(obj).forEach((key) => {
		ret[obj[key]] = key;
	});
	return ret;
}

exports.makeResponseData = (tableName, data) => {
	const dataObj = {};
	const reverseObj = objectFlip(table[tableName]);
	Object.keys(data).forEach((key) => {
		if (key.includes('_is_') && data[key] === 1) {
			dataObj[reverseObj[key]] = true;
		} else if (key.includes('_is_') && data[key] === 0) {
			dataObj[reverseObj[key]] = false;
		} else {
			dataObj[reverseObj[key]] = data[key];
		}
	});
	return dataObj;
};
