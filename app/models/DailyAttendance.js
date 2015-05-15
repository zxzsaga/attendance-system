'use strict';

var util       = require('util');
var BaseSchema = require(appModules.models.BaseSchema);

function Schema(definition, options) {
    Schema.super_.call(this, definition, options);
}
util.inherits(Schema, BaseSchema);

var definition = {
    _id: {
        type: String,
        required: true
    },
    attendance: {
        type: Array,
        required: false
    }
};

var options = {
    collection: 'DailyAttendance'
};

var schema = new Schema(definition, options);

var DailyAttendance = database.attendanceSystem.model('DailyAttendance', schema);
module.exports = DailyAttendance;
