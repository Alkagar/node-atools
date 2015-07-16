// var unlockScript = 'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end';
var extendScript = 'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("pexpire", KEYS[1], ARGV[2]) else return 0 end';

var redis = require('redis');

module.exports = function(setup) {
    var obj = {};

    var random = function random() {
        return Math.random().toString(36).slice(2);
    };

    var getCallbackLock = function callbackLock(callback) {
        if (typeof callback === 'undefined') {
            callback = function() {};
        }
        return function(err, data) {
            if (err === null && data === null) {
                callback({
                    error: 'LockError',
                    message: 'Can\'t aquire lock for resource ' + resource
                }, null);
                return;
            }
            callback(null, 'OK');
        };
    };

    var lock = function lock(ttl, callback) {
        redis.set(resource, value, 'NX', 'PX', ttl, getCallbackLock(callback));
        return obj;
    };

    var extend = function extend(ttl, callback) {
        redis.eval(extendScript, 1, resource, value, ttl, callback);
        return obj;
    };

    setup = setup || {};
    var redis = setup.redis;
    var value = random();

    if (typeof setup.valuePrefix !== 'undefined') {
        value = setup.valuePrefix + '_' + value;
    }

    if (typeof setup.redis === 'undefined') {
        throw {
            error: 'NoRedisInstance',
            message: 'You need to provide redis instance in setup.redis parameter.'
        }
    }

    var resource = setup.resource;
    if (typeof resource === 'undefined') {
        resource = 'redlock_resource_' + random();
    }

    obj.lock = lock;
    obj.extend = extend;
    return obj;
};
