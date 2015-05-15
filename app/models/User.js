'use strict';

var util       = require('util');
var BaseSchema = require(appModules.models.BaseSchema);

function Schema(definition, options) {
    Schema.super_.call(this, definition, options);
}
util.inherits(Schema, BaseSchema);

var definition = {
    name: {
        type: String,
        required: true
    },
    pwd: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'student'
    }
};

var options = {
    collection: 'User'
};

var schema = new Schema(definition, options);

var User = database.attendanceSystem.model('User', schema);
module.exports = User;
