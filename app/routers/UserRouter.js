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
    /*
    var page = parseInt(req.body.page) || 1;
    var pageSize = 10;
    Game.find().sort({ addedAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).exec(function(err, games) {
        if (err) {
            logger.error(err);
            res.send('find game error');
            return;
        }
        games.forEach(function(game) {
            game.coverUrl = '/' + game.coverUrl;
        });
        Game.count({}, function(err, gameCount) {
            if (err) {
                logger.error(err);
                res.send('count game error');
                return;
            }
            res.render('index.jade', { games: games, pageIndex: page, pageCount: Math.ceil(gameCount / pageSize) });
        })
    });
    */
});

UserRouter.get('/login', function(req, res) {
    res.render('login.jade');
});

/**
 * @api {post} /login User login
 * @apiName UserLogin
 * @apiGroup User
 *
 * @apiParam {String} name User name
 * @apiParam {String} pwd Password
 */
UserRouter.post('/login', function(req, res) {
    var userParams = {
        name: req.body.name,
        pwd: req.body.pwd
    };
    User.findOne(userParams, function(err, user) {
        if (err) {
            console.error(err);
            res.send('find user error');
            return;
        }
        if (!user) {
            res.render('login.jade', { error: 'Wrong username or password.' });
        } else {
            req.session.user = {
                id: user._id,
                name: user.name,
                type: user.type
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

/**
 * @api {post} /register 用户注册(学生注册)
 * @apiName 用户注册
 * @apiGroup User
 *
 * @apiParam {String} name 用户名
 * @apiParam {String} pwd 密码
 */
UserRouter.post('/register', function(req, res) {
    var userParams = {
        name: req.body.name,
        pwd: req.body.pwd
    };
    User.findOne({ name: userParams.name }, function(err, user) {
        if (err) {
            console.error(err);
            res.send('find user error');
            return;
        }

        if (user) {
            res.render('register.jade', { error: 'Username already exist.' });
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
                type: user.type
            };
            res.redirect('/');
        });
    });
});

UserRouter.get('/user/main/:id', function(req, res) {
    var userId = req.params.id;
    User.findOne({ _id: userId }, function(err, user) {
        if (err) {
            console.error(err);
            res.send('find game error');
            return;
        }
        res.render('user/main.jade', { user: user });
    });
});

module.exports = UserRouter;
