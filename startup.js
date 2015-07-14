var redis = require('redis');
var redlock = require('./redlock.js');

module.exports = function(setup) {
    var obj = {};

    var client = redis.createClient();
    var start = function() {};
    var stop = function() {};
    var exit = function() {};
    var prefix = '';
    var resource = '';
    var ttl = 10 * 1000;
    var extendInterval = 5 * 1000;


    if (typeof setup.start === 'function') {
        start = setup.start;
    }

    if (typeof setup.stop === 'function') {
        stop = setup.stop;
    }

    if (typeof setup.exit === 'function') {
        exit = setup.exit;
    }

    if (typeof setup.resource === 'undefined') {
        throw {
            error: 'NoResourceError',
            message: 'You need to provide `resource` name.'
        }
    } else {
        resource = setup.resource;
    }

    if (typeof setup.prefix !== 'undefined') {
        prefix = setup.prefix;
    }

    if (typeof setup.extendInterval !== 'undefined') {
        extendInterval = setup.extendInterval;
    }

    if (typeof setup.ttl !== 'undefined') {
        ttl = setup.ttl;
    }

    var rd = redlock({
        redis: client,
        resource: resource,
        valuePrefix: prefix
    });

    // tries to start proces with start function
    // runs callback when succeded
    var tryToStart = function(callback) {
        // lets lock with redlock
        rd.lock(ttl, function(err, data) {
            if (err) {
                // we failed to aquire lock
                console.log('Cant aquire lock... :(');
                // lock was not aquired, let's try again after extendInterval
                setTimeout(tryToStart, extendInterval);
            } else {
                // we have lock for this process, we can start our process
                console.log('Lock aquired! :D');
                start();

                // run callback if provided
                if (typeof callback === 'function') {
                    callback();
                }

                // lets try schedule extending time for our lock
                setTimeout(extendLock, extendInterval);
            }
        });
    };

    var extendLock = function() {
        //  lets extend lock with redlock
        rd.extend(ttl, function(err, data) {
            if (err) {
                // lock can't be extended - stop our process
                console.log('Can\'t extend lock - stopping process', err);
                stop();
                return;
            }
            // lets try schedule extending time for our lock
            setTimeout(extendLock, extendInterval);
        });
    }

    obj.tryToStart = tryToStart;

    return obj;
};
