'use strict';

var express       = require('express');
var mongoose      = require('mongoose');
var moment        = require('moment');
var User          = require(appModules.models.User);
var Absence       = require(appModules.models.Absence);
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
                        absentee: absenteeIdNameMap[absence.absentee],
                        startTime: moment(absence.startTime).format('YYYY-MM-DD hh:mm'),
                        endTime: moment(absence.endTime).format('YYYY-MM-DD hh:mm'),
                        reason: absence.reason
                    }
                    absencesToResponse.push(newAbsence);
                });
                res.render('teacher/main.jade', { absences: absencesToResponse });
            });
        }
    });
});

module.exports = TeacherRouter;
