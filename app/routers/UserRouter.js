'use strict';

var express    = require('express');

var User = require(appModules.models.User);

var UserRouter = express.Router();

// 登陆相关
UserRouter.get('/', function(req, res) {
    if (!req.session.user) {
        res.render('login.jade');
        return;
    }

    if (req.session.user.type === 'teacher') {
        res.redirect('/teacher');
    } else {
        res.redirect('/student');
    }
});

UserRouter.get('/login', function(req, res) {
    res.render('login.jade');
});

UserRouter.post('/login', function(req, res) {
    var userParams = {
        _id: req.body.id,
        pwd: req.body.pwd
    };
    User.findOne(userParams, function(err, user) {
        if (err) {
            console.error(err);
            res.send('find user error');
            return;
        }
        if (!user) {
            res.render('login.jade', { error: '学号或密码错误' });
        } else {
            req.session.user = {
                id: user._id,
                name: user.name,
                type: user.type,
                gender: user.gender
            }
            res.redirect('/');
        }
    });
});

UserRouter.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.error(err);
            res.send('logout error');
            return;
        }
        res.redirect('/');
    })
});

UserRouter.get('/register', function(req, res) {
    res.render('register.jade');
});

UserRouter.post('/register', function(req, res) {
    var userParams = {
        _id: req.body.id,
        name: req.body.name,
        pwd: req.body.pwd,
        gender: req.body.gender
    };
    User.findOne({ _id: userParams._id }, function(err, user) {
        if (err) {
            console.error(err);
            res.send('find user error');
            return;
        }

        if (user) {
            res.render('register.jade', { error: '学号已被占用' });
            return;
        }

        var user = new User(userParams);
        user.save(function(err, user) {
            if (err) {
                console.error(err);
                res.send('game save error');
                return;
            }
            req.session.user = {
                id: user._id,
                name: user.name,
                type: user.type,
                gender: user.gender
            };
            res.redirect('/');
        });
    });
});

module.exports = UserRouter;
