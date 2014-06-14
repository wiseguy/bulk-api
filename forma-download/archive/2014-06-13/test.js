var exec = require('child_process').exec;
var outZipFile = "d:\\node\\apps\\forma-download\\outputZip\\7ziptest.zip";
var outFile = "d:\\node\\apps\\forma-download\\outputCSV\\forma_BRA_9000845928676426.csv";
var zipCmd = '7z a "' + outZipFile + '" "' + outFile + '"';	
exec(zipCmd,function(){
console.log("Compression Complete")
										})