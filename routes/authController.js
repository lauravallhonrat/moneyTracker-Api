var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var jwtOptions = require('../config/jwtoptions');
const passport = require('../config/passport');

// Our user model
const User = require("../models/users");

// Bcrypt let us encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

console.log('ON THE FILE!');


router.post("/login", function(req, res) {

    if (req.body.username && req.body.password) {
        var username = req.body.username;
        var password = req.body.password;
    }

    if (username === "" || password === "") {
        res.status(401).json({ message: "fill up the fields" });
        return;
    }

    User.findOne({ "username": username }, (err, user) => {

        if (!user) {
            res.status(401).json({ message: "no such user found" });
        } else {
            bcrypt.compare(password, user.password, function(err, isMatch) {
                console.log(isMatch);
                if (!isMatch) {
                    res.status(401).json({ message: "passwords did not match" });
                } else {
                    console.log('user', user);
                    var payload = { id: user._id, user: user.username };
                    var token = jwt.sign(payload, jwtOptions.secretOrKey);
                    console.log(token)
                    res.json({ message: "ok", token: token, user: user });
                }
            });
        }
    });
});

router.get("/token", passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.json({ ok: 'ok' })
})

router.post("/signup", (req, res, next) => {
    console.log('IM ON THE BACKEND!');
    console.log('req.body on backend', req.body);


    var username = req.body.username;
    var password = req.body.password;
    var balanceAmount = req.body.balanceAmount;
    console.log('userData', username, password, balanceAmount);

    if (!username || !password || !balanceAmount) {
        res.status(400).json({ message: "Provide username, password and balance" });
        return;
    }

    User.findOne({ username }, "username", (err, user) => {
        if (user !== null) {
            res.status(400).json({ message: 'ups! the user exist' });
            return;
        }

        var salt = bcrypt.genSaltSync(bcryptSalt);
        var hashPass = bcrypt.hashSync(password, salt);

        var newUser = User({
            username: username,
            password: hashPass,
            balanceAmount: balanceAmount
        });

        newUser.save((err, user) => {
            if (err) {
                res.status(400).json({ message: err });
            } else {
                var payload = { id: user._id, user: user.username, balanceAmount: balanceAmount };

                var token = jwt.sign(payload, jwtOptions.secretOrKey);
                res.status(200).json({ message: "ok", token: token, user: user });
                // res.status(200).json(user);
            }
        });
    });
});

module.exports = router;