//npm install -g node-windows
//npm link node-windows
//node createservice.js


var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'Forma Download API',
  description: 'Forma Data Download Service',
  script: 'c:\\node\\apps\\forma-download\\server.js'
});
	
// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();
