# ATools - startup 

Easy to setup tool for starting application with exclusive lock based on redis.

### example usage
```
var startup = require('atools').startup;
function start() {
    // start your application here
}

function exit() {
    // exit from your application here
    process.exit(1);
}

var st = startup({
    resource: 'your-process-name',
    prefix: 'process-prefix-for-example-hostname',
    ttl: 2000, // lock timeout
    extendInterval: 800, // how often you want to extend lock?
    start: start, // what should be run when process aquire lock correctly
    stop: exit, // what should happen when your process stop (eg. cannot aquire lock)
    exit: exit // what should happen when you want to exit from your application
});

st.tryToStart(function() {
    console.log('Process started');
})
```
