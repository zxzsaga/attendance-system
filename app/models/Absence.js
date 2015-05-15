'use strict';

var util       = require('util');
var mongoose   = require('mongoose'), ObjectId = mongoose.Schema.Types.ObjectId;
var BaseSchema = require(appModules.models.BaseSchema);

function Schema(definition, options) {
    Schema.super_.call(this, definition, options);
}
util.inherits(Schema, BaseSchema);

var definition = {
    absentee: {
        type: ObjectId,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    approved: {
        type: Boolean,
        required: false
    }
};

var options = {
    collection: 'Absence'
};

var schema = new Schema(definition, options);

var Absence = database.attendanceSystem.model('Absence', schema);
module.exports = Absence;
