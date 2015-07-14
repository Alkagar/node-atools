var redis = require('redis');
var startup = require('./startup.js');

var os = require("os");

var startProcess = function() {
    processInterval = setInterval(function() {
        console.log('I\'m working.... [', Math.floor(Math.random() * 10000), ']');
    }, 2000);
};

var stopProcess = function() {
    // process.exit(1);
    clearInterval(processInterval);
}

var exitProcess = function() {
    process.exit(1);
}

var st = startup({
    resource: 'process-name',
    prefix: os.hostname(),
    ttl: 2000,
    extendInterval: 800,
    start: startProcess,
    stop: stopProcess,
    exit: exitProcess
});

st.tryToStart(function() {
    console.log('started');
})
