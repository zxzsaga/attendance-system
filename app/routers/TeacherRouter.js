'use strict';

var express       = require('express');
var mongoose      = require('mongoose');
var moment        = require('moment');
var User          = require(appModules.models.User);
var Absence       = require(appModules.models.Absence);
var DailyAttendance = require(appModules.models.DailyAttendance);

var SessionFilter = require(appModules.filters.SessionFilter);

var TeacherRouter = express.Router();
// before filters
TeacherRouter.use(SessionFilter);

TeacherRouter.get('/', function(req, res) {
    Absence.find().sort({ startTime: -1 }).limit(50).exec(function(err, absences) {
        if (err) {
            console.error(err);
            res.send('find absence error');
            return;
        }
        var absencesToResponse = [];
        var absenteeIds = [];
        var absenteeIdNameMap = {};
        if (absences && absences.length) {
            absences.forEach(function(absence) {
                if (absenteeIds.indexOf(absence.absentee) < 0) {
                    absenteeIds.push(absence.absentee);
                }
            });
            User.find({ _id: { $in: absenteeIds } }).exec(function(err, users) {
                users.forEach(function(user) {
                    absenteeIdNameMap[user.id] = user.name;
                });
                absences.forEach(function(absence) {
                    var newAbsence = {
                        id: absence._id,
                        absentee: absenteeIdNameMap[absence.absentee],
                        startTime: moment(absence.startTime).format('YYYY-MM-DD hh:mm'),
                        endTime: moment(absence.endTime).format('YYYY-MM-DD hh:mm'),
                        reason: absence.reason,
                        approved: absence.approved
                    }
                    absencesToResponse.push(newAbsence);
                });
                res.render('teacher/main.jade', { absences: absencesToResponse, user: req.session.user });
            });
        } else {
            res.render('teacher/main.jade', { absences: [], user: req.session.user });
        }
    });
});

TeacherRouter.get('/approveAbsence/:absenceId', function(req, res) {
    var absenceId = req.param('absenceId');
    Absence.findOne({ _id: mongoose.Types.ObjectId(absenceId) }).exec(function(err, absence) {
        if (err) {
            console.error(err);
            res.send('find absence error');
            return;
        }
        absence.approved = true;
        absence.save(function(err, absence) {
            if (err) {
                console.error(err);
                res.send('absence save error');
                return;
            }
            res.redirect('/');
        });
    });
});

TeacherRouter.get('/dailyAttendanceIndex', function(req, res) {
    res.render('teacher/dailyAttendanceIndex.jade', { user: req.session.user  });
});

TeacherRouter.post('/findDailyAttendance', function(req, res) {
    var date = req.body.date;

    DailyAttendance.findOne({ _id: date }).exec(function(err, dailyAttendance) {
        if (err) {
            console.error(err);
            res.send('find dailyAttendance error');
            return;
        }

        if (!dailyAttendance) {
            res.render('teacher/dailyAttendanceIndex.jade', { date: date, user: req.session.user });
            return;
        }

        User.find({type: { $ne: 'teacher' }}, { name: 1, gender: 1 }).exec(function(err, users) {
            if (err) {
                console.error(err);
                res.send('find user error');
                return;
            }

            var checkedList = [];
            var uncheckedList = [];
            users.forEach(function(user) {
                if (dailyAttendance.attendance.indexOf(user._id) < 0) {
                    uncheckedList.push(user);
                } else {
                    checkedList.push(user);
                }
            })

            res.render('teacher/dailyAttendanceIndex.jade', {
                date: date,
                uncheckedList: uncheckedList,
                checkedList: checkedList,
                user: req.session.user
            });
        })
    });
});

TeacherRouter.get('/addStudent', function(req, res) {
    res.render('teacher/addStudent.jade', { user: req.session.user });
});
TeacherRouter.post('/addStudent', function(req, res) {
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
            res.send('学号已被注册');
            return;
        }

        var user = new User(userParams);
        user.save(function(err, user) {
            if (err) {
                console.error(err);
                res.send('game save error');
                return;
            }
            res.redirect('/');
        });
    });
});

TeacherRouter.get('/removeStudent', function(req, res) {
    res.render('teacher/removeStudent.jade', { user: req.session.user });
});

TeacherRouter.post('/removeStudent', function(req, res) {
    var id = req.body.id;
    User.findOne({ _id: id, type: { $ne: 'teacher' } }, function(err, user) {
        if (err) {
            console.error(err);
            res.send('remove user error');
            return;
        }
        if (!user) {
            res.send('没有这个学号的学生');
            return;
        }
        var userId = user._id;
        User.remove({ _id: userId }, function(err) {
            if (err) {
                console.error(err);
                res.send('remove user error');
                return;
            }
            Absence.remove({ absentee: userId }, function(err) {
                if (err) {
                    console.error(err);
                    res.send('remove absence error');
                    return;
                }
                res.redirect('/teacher/listStudents');
            });
        });
    })
});

TeacherRouter.get('/listStudents', function(req, res) {
    User.find({ type: { $ne: 'teacher' } }, { name: 1, gender: 1 }, function(err, users) {
        if (err) {
            console.error(err);
            res.send('find user error');
            return;
        }
        res.render('teacher/listStudents.jade', { students: users, user: req.session.user });
    });
});

module.exports = TeacherRouter;
