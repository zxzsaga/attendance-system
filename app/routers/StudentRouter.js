'use strict';

var express         = require('express');
var mongoose        = require('mongoose');
var moment          = require('moment');
var Absence         = require(appModules.models.Absence);
var DailyAttendance = require(appModules.models.DailyAttendance);
var SessionFilter   = require(appModules.filters.SessionFilter);

var StudentRouter = express.Router();
// before filters
StudentRouter.use(SessionFilter);

StudentRouter.get('/', function(req, res) {
    var userId = req.session.user.id;
    var todayDate = moment().format('YYYYMMDD');

    Absence.find({ absentee: userId }).sort({ startTime: -1 }).limit(10).exec(function(err, absences) {
        if (err) {
            console.error(err);
            res.send('find absence error');
            return;
        }
        var absencesToResponse = [];
        if (absences && absences.length) {
            absences.forEach(function(absence, index, absences) {
                var newAbsence = {
                    id: absence._id,
                    startTime: moment(absence.startTime).format('YYYY-MM-DD hh:mm'),
                    endTime: moment(absence.endTime).format('YYYY-MM-DD hh:mm'),
                    reason: absence.reason,
                    approved: absence.approved
                }
                absencesToResponse.push(newAbsence);
            });
        }

        DailyAttendance.findOne({ _id: todayDate, attendance: userId }).exec(function(err, dailyAttendance) {
            if (err) {
                console.error(err);
                res.send('find dailyAttendance error');
                return;
            }
            if (dailyAttendance) {
                res.render('student/main.jade', { absences: absencesToResponse, user: req.session.user, checked: true });
                return;
            }
            res.render('student/main.jade', { absences: absencesToResponse, user: req.session.user });
        });
    });
});

StudentRouter.get('/newAbsence', function(req, res) {
    res.render('student/editAbsence.jade');
});

StudentRouter.post('/addAbsence', function(req, res) {
    var absenceParam = {
        absentee: req.session.user.id,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        reason: req.body.reason
    };
    var absence = new Absence(absenceParam);
    absence.save(function(err, absence) {
        if (err) {
            console.error(err);
            res.send('absence save error');
            return;
        }
        res.redirect('/');
    });
});

StudentRouter.get('/editAbsence/:absenceId', function(req, res) {
    var absenceId = req.param('absenceId');

    Absence.findOne({ _id: mongoose.Types.ObjectId(absenceId) }).exec(function(err, absence) {
        if (err) {
            console.error(err);
            res.send('find absence error');
            return;
        }
        if (absence && absence.approved) {
            res.send('不能修改审批通过的请假申请');
            return;
        }
        var absenceToResponse = {
            id: absence._id,
            startTime: moment(absence.startTime).format('YYYY-MM-DD hh:mm'),
            endTime: moment(absence.endTime).format('YYYY-MM-DD hh:mm'),
            reason: absence.reason
        };
        res.render('student/editAbsence.jade', { absence: absenceToResponse });
    });
});

StudentRouter.post('/updateAbsence/:absenceId', function(req, res) {
    var absenceId = req.param('absenceId');

    var absenceParam = {
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        reason: req.body.reason
    };

    Absence.findOne({ _id: mongoose.Types.ObjectId(absenceId) }).exec(function(err, absence) {
        if (err) {
            console.error(err);
            res.send('find absence error');
            return;
        }
        if (absence && absence.approved) {
            res.send('不能修改审批通过的请假申请');
            return;
        }
        for (var key in absenceParam) {
            absence[key] = absenceParam[key];
        }
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

StudentRouter.get('/removeAbsence/:absenceId', function(req, res) {
    var absenceId = req.param('absenceId');

    Absence.findOne({ _id: mongoose.Types.ObjectId(absenceId) }).exec(function(err, absence) {
        if (err) {
            console.error(err);
            res.send('find absence error');
            return;
        }
        if (absence && absence.approved) {
            res.send('不能删除审批通过的请假申请');
            return;
        }
        Absence.remove({ _id: mongoose.Types.ObjectId(absenceId) }).exec(function(err, absence) {
            if (err) {
                console.error(err);
                res.send('remove absence error');
                return;
            }
            res.redirect('/');
        });
    });
});

StudentRouter.get('/checkDailyAttenDance', function(req, res) {
    var userId = req.session.user.id;
    var todayDate = moment().format('YYYYMMDD');

    DailyAttendance.findOne({ _id: todayDate }).exec(function(err, dailyAttendance) {
        if (err) {
            console.error(err);
            res.send('find dailyAttendance error');
            return;
        }
        if (!dailyAttendance) {
            dailyAttendance = new DailyAttendance({
                _id: todayDate,
                attendance: [ userId ]
            });
            dailyAttendance.save(function(err, dailyAttendance) {
                if (err) {
                    console.error(err);
                    res.send('save dailyAttendance error');
                    return;
                }
                res.redirect('/');
            });
        } else {
            if (dailyAttendance.attendance.indexOf(userId) >= 0) {
                res.redirect('/');
                return;
            }
            dailyAttendance.attendance.push(userId);
            dailyAttendance.save(function(err, dailyAttendance) {
                if (err) {
                    console.error(err);
                    res.send('save dailyAttendance error');
                    return;
                }
                res.redirect('/');
            });
        }
    });
});

module.exports = StudentRouter;
