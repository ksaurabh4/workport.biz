checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({
    username: req.body.username
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ error: err });
      return;
    }

    if (user) {
      res.status(400).send({ error: "Failed! Username is already in use!" });
      return;
    }

    next();

  });
};


const verifySignUp = {
  checkDuplicateUsernameOrEmail,
};

module.exports = verifySignUp;
