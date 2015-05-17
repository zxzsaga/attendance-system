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
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'student'
    },
    gender: {
        type: String,
        required: false
    },
    pwd: {
        type: String,
        required: true
    }
};

var options = {
    collection: 'User'
};

var schema = new Schema(definition, options);

var User = database.attendanceSystem.model('User', schema);
module.exports = User;
