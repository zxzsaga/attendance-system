'use strict';

var path = require('path');

// 第三方库
var express  = require('express'), app = express(), router = express.Router;
var glob     = require('glob');
var mongoose = require('mongoose');

// express 相关库
var methodOverride = require('method-override');
var cookieParser   = require('cookie-parser');
var session        = require('express-session');
var bodyParser     = require('body-parser');

// app 设置
var publicPath = __dirname + '/public';
app.use(express.static(publicPath));

// app express 相关设置
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cookieParser('secret'));
app.use(session({
    secret: 'attendance-system',
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 端口设置
var nodePort = process.env.NODE_PORT || 3000; // TODO: 3000 改为 80
app.listen(nodePort);

// 数据库设置
var database = {
    "attendanceSystem": mongoose.createConnection('mongodb://localhost/AttendanceSystem')
};
for (var i in database) {
    database[i].on('error', console.error.bind(console, 'connection error:'));
    database[i].once('open', function(callback) {
        console.log('opened');
    });
}

// 全局变量定义
global.database   = database;
global.appModules = {};

// 文件加载
var rootPath = path.join(__dirname);
// 加载是有顺序的
var moduleMaps = {
    'app'         : path.join(rootPath, 'app', '*.js'),
    'util'        : path.join(rootPath, 'app', 'util', '*.js'),
    'models'      : path.join(rootPath, 'app', 'models', '*.js'),
    'filters'     : path.join(rootPath, 'app', 'routers', 'filters', '*.js'),
    'routers'     : path.join(rootPath, 'app', 'routers', '*.js')
};
function loadModulesPath() {
    Object.keys(moduleMaps).forEach(function(mods){
        appModules[mods] = {};
        var files = glob.sync(moduleMaps[mods]);
        files.forEach(function(file){
            var filename = path.basename(file, '.js');
            appModules[mods][filename] = file;
        })
    })
}
loadModulesPath();

var userRouter    = require(appModules.routers.UserRouter);
var studentRouter = require(appModules.routers.StudentRouter);
var teacherRouter = require(appModules.routers.TeacherRouter);
app.use('/', userRouter);
app.use('/student', studentRouter);
app.use('/teacher', teacherRouter);
