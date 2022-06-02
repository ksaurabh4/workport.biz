const jwt = require('jsonwebtoken');
const config = require('../config/appconfig');

exports.generateToken = (user) => {
	const { user_id, user_email, user_is_admin } = user;
	return jwt.sign(
		{ user_id, user_email, user_is_admin },
		config.auth.jwt_secret,
		{
			expiresIn: config.auth.jwt_expiresin,
		},
	);
};

exports.isAuth = (req, res, next) => {
	const authorization = req.headers.authorization;
	if (authorization) {
		const token = authorization.slice(7, authorization.length); // Bearer xxxxxxx  to ignore first 7 digits
		jwt.verify(
			token,
			process.env.JWT_SECRET || "somethingsecret",
			(err, decode) => {
				if (err) {
					res.status(401).send({ message: "Invalid Token" });
				} else {
					req.user = decode;
					next();
				}
			}
		);
	} else {
		res.status(401).send({ message: "No Token" });
	}
};

exports.isAdmin = (req, res, next) => {
	if (req.user && req.user.isAdmin) {
		next();
	} else {
		res.status(401).send({ message: "Invalid Admin Token" });
	}
};

exports.isSeller = (req, res, next) => {
	if (req.user && req.user.isSeller) {
		next();
	} else {
		res.status(401).send({ message: "Invalid Seller Token" });
	}
};

exports.isSellerOrAdmin = (req, res, next) => {
	if (req.user && (req.user.isSeller || req.user.isAdmin)) {
		next();
	} else {
		res.status(401).send({ message: "Invalid Admin/Seller Token" });
	}
};
