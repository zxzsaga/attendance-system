'use strict';

var express       = require('express');
var mongoose      = require('mongoose');
var moment        = require('moment');
var Absence       = require(appModules.models.Absence);
var SessionFilter = require(appModules.filters.SessionFilter);

var StudentRouter = express.Router();
// before filters
StudentRouter.use(SessionFilter);

StudentRouter.get('/', function(req, res) {
    Absence.find({ absentee: mongoose.Types.ObjectId(req.session.user.id) }).sort({ startTime: -1 }).limit(10).exec(function(err, absences) {
        if (err) {
            console.error(err);
            res.send('find absence error');
            return;
        }
        var absencesToResponse = [];
        if (absences && absences.length) {
            absences.forEach(function(absence, index, absences) {
                var newAbsence = {
                    startTime: moment(absence.startTime).format('YYYY-MM-DD hh:mm'),
                    endTime: moment(absence.endTime).format('YYYY-MM-DD hh:mm'),
                    reason: absence.reason
                }
                absencesToResponse.push(newAbsence);
            });
        }
        res.render('student/main.jade', { absences: absencesToResponse });
    });
});

StudentRouter.get('/newAbsence', function(req, res) {
    res.render('student/newAbsence.jade');
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

module.exports = StudentRouter;
