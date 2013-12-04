var portApp = 8080;//8080,process.env.PORT;
//var portApp = process.env.PORT;
var downloadURL = "http://alb/formaDownloads/";
//var downloadURL = "http://gis-stage.wri.org/formaDownloads/";
var host = "127.0.0.1";//for mongodb
var dbName = "forma20131024";
var datesFile = __dirname+"\\datesIndex_2013-10-24.csv";

var findRemoveSync = require('find-remove');
var fs = require("fs");
var url = require('url');
var nodemailer = require("nodemailer");
var CSV = require("a-csv");
var mongo = require("mongodb");
var express = require("express");
var sendmail = require('sendmail').sendmail;
var walk    = require('walk');
var archiver = require('archiver');	
var csv2json = require("csv-to-json");
var AdmZip = require("adm-zip");
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var outCSVFolder =  __dirname+"\\outputCSV";
var outFGDBfolder = __dirname+"\\outputFGDB";
var outSHPfolder = __dirname+"\\outputSHP";
var outKMLfolder = __dirname+"\\outputKML";
var outZip = __dirname+"\\outputZip";



var port = mongo.Connection.DEFAULT_PORT;
var db = new mongo.Db(dbName,new mongo.Server(host,port,{}));

//CSV File Path or CSV String or Readable Stream Object
var dateIndexes = [];

var json = csv2json.parse(datesFile);


for (var index in json) {
        dateIndexes.push(json[index]["DATE\r"].toString())          //.replace(/-/g, '')
    }

var app = express();	
app.use(express.bodyParser());

db.open(function(){
	console.log("database connected. API ready");
	console.log("Connected to mongodb on " + host + ":" + port);
})//db.open

app.get("/forma-download/api",function(request,response){

	var url_parts = url.parse(request.url, true);
	var query = url_parts.query;
	
	var callback = query["callback"];
	var iso3 = query["country"].toString();
	var regions = eval(query["regions"]) || [];
	var minProb = parseInt(query["minProb"]);
	var maxProb = parseInt(query["maxProb"]);
	var startDateIndex = parseInt(query["startDateIndex"]);
	var numberOfDates = parseInt(query["dateCount"]);
	var requestType = query["f"].toString();
	var output = query["output"].toString();
	var email = query["email"];

	var random = Math.random()*100000000000000000;	
    
    

	var outCSVFilename = "forma_"+iso3+"_"+random+".csv";
	var outFile = outCSVFolder+ "\\" + outCSVFilename;


	
	var startDate = new Date();

	var data = {
		callback:callback,
		iso3:iso3,
		regions:regions,
		minProb:minProb,
		maxProb:maxProb,
		startDateIndex:startDateIndex,
		numberOfDates:numberOfDates,
		requestType:requestType,
		output:output,
		email:email,
		random:random,
		outCSVFilename:outCSVFilename,
		outFile:outFile,
		outFGDBfolder:outFGDBfolder,
		outSHPfolder:outSHPfolder,
		outKMLfolder:outKMLfolder,
		outZip:outZip,
		startDate:startDate
	}



	executeDownload(response,data);

	removeOldData();
	
})//espress get



var server = app.listen(portApp);

server.on('connection', function(socket) {
  console.log("A new connection was made by a client.");
  socket.setTimeout(1800 * 1000); 
  // 1800 second timeout. Change this as you see fit.
})

var collection;

db.collection("forma",function(error, coll){
	collection = coll;
})//db.collection

function removeOldData() {
	
	var result1 = findRemoveSync(outCSVFolder, {age: {seconds: 172800}, files: '*.*', ignore: '.gitignore'});	
	var result2 = findRemoveSync(outFGDBfolder, {age: {seconds: 172800}, files: '*.*', ignore: '.gitignore'});
	var result3 = findRemoveSync(outSHPfolder, {age: {seconds: 172800}, files: '*.*', ignore: '.gitignore'});
	var result4 = findRemoveSync(outKMLfolder, {age: {seconds: 172800}, files: '*.*', ignore: '.gitignore'});
	var result5 = findRemoveSync(outZip, {age: {seconds: 172800}, files: '*.*', ignore: '.gitignore'});
	console.log("Deleting these Files older than 48 hours :");
	console.log(result1);
	console.log(result2);
	console.log(result3);
	console.log(result4);
	console.log(result5);
}

function executeDownload(response,data) {

	var callback = data.callback;
	var iso3 = data.iso3.toUpperCase();
	var regions = data.regions;
	var minProb = data.minProb;
	var maxProb = data.maxProb;
	var startDateIndex = data.startDateIndex;
	var numberOfDates = data.numberOfDates;
	var requestType = data.requestType;
	var output = data.output.toLowerCase();
	var email = data.email;
	var random = data.random;
	var outCSVFilename = data.outCSVFilename;
    var outFile = data.outFile;
    var outFGDBfolder = data.outFGDBfolder;
	var outSHPfolder = data.outSHPfolder;
	var outKMLfolder = data.outKMLfolder;
	var outZip = data.outZip;
	var startDate = data.startDate;

	var noData = "";
	//just sending a dummy response.. email when finished
	response.write(callback + "({\"results\":\""+noData+"\",\"featureCount\":'0',\"startTime\":\""+startDate.toString()+"\",\"endTime\":\""+startDate.toString()+"\"})");
	response.send();

	if (!email) {
		return;
	}


		//var query = {"PROBABILITY":{$gt:60}},{"PROBABILITY":{$slice:[0,3]};
		console.log("iso3 : " + iso3);
		console.log("regions count : " + regions.length);
		console.log("minProb : " + minProb);
		console.log("maxProb : " + maxProb);
		console.log("startDateIndex : " + startDateIndex);
		console.log("numberOfDates : " + numberOfDates);
		console.log("requestType : " + requestType);
		console.log("output : " + output);
		console.log("email : " + email);
		var queryObj = {"PROBABILITY":{$gte:minProb,$lte:maxProb}};
		//console.log(regions.length);
		
		if (iso3) { // iso3 revceied use it
			queryObj["ISO3"]= iso3;
		}
		if (regions.length>0) {// if regions revceived use it
			queryObj["ADM_REGION"]={$in: regions};
		}
		//console.log(queryObj);
		collection.find(queryObj,{"PROBABILITY":{$slice:[startDateIndex,numberOfDates]}},function(error,cursor){
			cursor.toArray(function(error,forma){
				if (forma.length == 0){
					console.log("found no records");
					//response.send("No data found");
					var noData = "";
					var endDate = new Date();

					// response.write(callback + "({\"results\":\""+noData+"\",\"featureCount\":"+forma.length+",\"startTime\":\""+startDate.toString()+"\",\"endTime\":\""+endDate.toString()+"\"})");
					// response.send();
					//callback(false);
					var responseData = {
												response: response,
												email: email,
												requestType : requestType,
												downloadLink: "",
												startDate :startDate,
												//endDate :endDate,
												callback :callback,
												totalRecords:0

											}
							sendResponse(responseData);
				} else {
					console.log("found ", forma.length + " records");
					//callback(users[0]);

					var csvColumns = "UNIQUE_ID,RES,TILEH,TILEV,COL,ROW,LAT,LON,ISO3,PERC_TREE_COVER,ADM_REGION,ECO_REGION,PROBABILITY,DATE";
					fs.appendFileSync(outFile, csvColumns);
					var totalRecords = 0;

					for (var i=0;i<forma.length;i++) {
						var max_of_prob = Math.max.apply(Math, forma[i].PROBABILITY);
				        var min_of_prob = Math.min.apply(Math, forma[i].PROBABILITY);

						for (var k=0;k<numberOfDates;k++) {
							
							var currentProb = forma[i].PROBABILITY[k];
							
							if (max_of_prob<minProb || min_of_prob>maxProb) {
								break;//break from this loop
							}


							if (currentProb<minProb || currentProb>maxProb) {
								//console.log(currentProb);
								//Do Nothing
							} else {

							totalRecords++;
							
							var unique_id = forma[i].RES.toString() + "_" +  ("0000"+forma[i].TILEH).slice(-4) + "_" + ("0000"+forma[i].TILEV).slice(-4) + "_" + ("0000"+forma[i].COL).slice(-4) + "_" + ("0000"+forma[i].ROW).slice(-4);		
							//forma[i].UNIQUE_ID.toString()
							var insertRowCSV = "\n" + unique_id + "," + (forma[i].RES || 0) + "," + (forma[i].TILEH || 0)   + "," + (forma[i].TILEV || 0) + "," + (forma[i].COL || 0) + ","
	                                             + (forma[i].ROW || 0)+ "," + (forma[i].LAT || 0.0)+ "," + (forma[i].LON || 0.0) + "," + (forma[i].ISO3 || "NULL") + ","
	                                              + (forma[i].PERC_TREE_COVER || 0) + "," + (forma[i].ADM_REGION || 0) + "," + (forma[i].ECO_REGION || 0) + ","
	                                              + (forma[i].PROBABILITY[k] || 0) + "," +  dateIndexes[startDateIndex+k].toString();//forma[i].DATE
							
							
							
	                        //Add Row to CSV
		                    fs.appendFileSync(outFile, insertRowCSV);
		                   
		                     //console.log(k);
		                     //console.log(forma[i].PROBABILITY[k]);
	                    	}//end if

	                	}//for
					}//for

					var zipFileName = iso3 + "_" + random + ".zip";
					var outZipFile = outZip + "\\" + zipFileName;
					
					var downloadLink = downloadURL+zipFileName;
					console.log("generating output");
					console.log("callback " + callback);
					switch (output) {
//HANDLE CSV
						case "csv":
							console.log("CSV zip start"); 

							var admzip = new AdmZip();
							admzip.addLocalFile(outFile);	
							admzip.writeZip(outZipFile);
							
							var responseData = {
												response: response,
												email: email,
												requestType : requestType,
												downloadLink: downloadLink,
												startDate :startDate,
												//endDate :endDate,
												callback :callback,
												totalRecords:totalRecords

											}
							sendResponse(responseData);

						break;
//HANDLE GDB
						case "gdb":
							var gdbFolder = "FORMA_GDB" + random;
							//var shpFolder = "FORMA_SHP" + random;
							
						 	
						 	fs.mkdirSync(outFGDBfolder + "\\" + gdbFolder);


						 	//fs.mkdirSync(outSHPfolder + shpFolder);							
							var exportLine = 'python "' + __dirname + '\\exportgdbfix.py" "' + __dirname + '" "' + outFile +  '" ' + random + ' ' + iso3;	

							console.log("Python GDB Creation start");

							
						 	//execute arcpy to create File Geodatabase
						    exec(exportLine,

	                                  function (error, stdout, stderr) {
	                                    // console.log('stdout: ' + stdout);	
	                                    // console.log('stderr: ' + stderr);

	                                    //var filegdb = "FORMA_OUTPUT"+random+".gdb"
	                                    var filegdbPath = outFGDBfolder + "\\" + gdbFolder;	                                    
	                                    
	                                    var endDate = new Date();
	                                    console.log("Read ", forma.length + " records from MongoDB");
	                                    console.log("Saved ", totalRecords + " records");
	                                    
	                                    console.log("Started At " + startDate.toString());	
	                                    console.log("Ended At " + endDate.toString());
	                                    if (error !== null) {
	                                      console.log('exec error: ' + error);
	                                      //response.send("Error in exporting to File Geodatabase");
	                                      // response.write(callback + "({\"results\":\"Error in exporting to File Geodatabase\",\"featureCount\":0,\"startTime\":\""+startDate.toString()+"\",\"endTime\":\""+endDate.toString()+"\"})");
	                                      // response.send();
	                                    } else {
	                                    	//zip the files

	                                    	//var zip = new EasyZip();	                                    	
	                                    	console.log(filegdbPath);
											
											//admzip.addLocalFile(outFile);										
											// admzip.addLocalFolder(filegdbPath.toString());
											// admzip.writeZip(outZipFile);

											var files   = [];
											var fileNames   = [];
											var output = fs.createWriteStream(outZipFile);
											var archive = archiver('zip');
											output.on('close', function() {
											  console.log('archiver has been finalized and the output file descriptor has closed.');
											});

											archive.on('error', function(err) {
											  throw err;
											});

											archive.pipe(output);

											var walker  = walk.walk(filegdbPath.toString(), { followLinks: false });

											walker.on('file', function(root, stat, next) {
											    // Add this file to the list of files
											    files.push(root + '/' + stat.name);
											    fileNames.push(stat.name);
											    next();
											});

											walker.on('end', function() {
												for (var i = 0;i<files.length;i++) {													
													archive.append(fs.createReadStream(files[i]), { name: gdbFolder +".gdb/"+fileNames[i] })
												}

												archive.finalize(function(err, bytes) {
												  if (err) {
												    throw err;
												  }

												  console.log(bytes + ' total bytes');
												});

											});

											var responseData = {
												email: email,
												response: response,
												requestType : requestType,
												downloadLink: downloadLink,
												startDate :startDate,
												//endDate :endDate,
												callback :callback,
												totalRecords:totalRecords

											}
											
											sendResponse(responseData);

											

											
	                                    	
	                                    }
	                                });//exec

						break;
//HANDLE SHP
						case "shp":
							
							var shpFolder = "FORMA_SHP" + random;	
							var projectionText = "GEOGCS[\"GCS_WGS_1984\",DATUM[\"D_WGS_1984\",SPHEROID[\"WGS_1984\",6378137.0,298.257223563]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]]";					
						 	
						 	console.log("Python SHP Creation start");

						 	fs.mkdirSync(outSHPfolder +"\\"+ shpFolder);
						 	console.log("Created Projection file");
						 	fs.appendFileSync(outSHPfolder +"\\"+ shpFolder+"\\"+ shpFolder +".prj", projectionText);
							var exportLine = 'python "' + __dirname + '\\exportshp.py" "' + __dirname + '" "'  + outFile +  '" ' + random + ' ' + iso3;
						 	//execute shapefile python
						    exec(exportLine,
	                                  function (error, stdout, stderr) {
	                                    // console.log('stdout: ' + stdout);
	                                    // console.log('stderr: ' + stderr);
	                                   // var filegdb = "FORMA_OUTPUT"+random+".shp"
	                                    var shpPath = outSHPfolder +"\\"+ shpFolder;
	                                    
	                                    
	                                    var endDate = new Date();
	                                    console.log("Read ", forma.length + " records from MongoDB");
	                                    console.log("Saved ", totalRecords + " records");
	                                    
	                                    console.log("Started At " + startDate.toString());	
	                                    console.log("Ended At " + endDate.toString());
	                                    if (error !== null) {
	                                      console.log('exec error: ' + error);
	                                      //response.send("Error in exporting to Shapefile");
	                                      // response.write(callback + "({\"results\":\"Error in exporting to Shapefile\",\"featureCount\":0,\"startTime\":\""+startDate.toString()+"\",\"endTime\":\""+endDate.toString()+"\"})");
	                                      // response.send();
	                                    } else {
	                                    	//zip the files

	                                    	//var zip = new EasyZip();
	                                    	
	                                    	console.log(shpPath);

	                                    	var files   = [];
											var fileNames   = [];
											var output = fs.createWriteStream(outZipFile);
											var archive = archiver('zip');
											output.on('close', function() {
											  console.log('archiver has been finalized and the output file descriptor has closed.');
											});

											archive.on('error', function(err) {
											  throw err;
											});

											archive.pipe(output);

											var walker  = walk.walk(shpPath.toString(), { followLinks: false });

											walker.on('file', function(root, stat, next) {
											    // Add this file to the list of files
											    files.push(root + '/' + stat.name);
											    fileNames.push(stat.name);
											    next();
											});

											walker.on('end', function() {
												for (var i = 0;i<files.length;i++) {													
													archive.append(fs.createReadStream(files[i]), { name: shpFolder + "/" + fileNames[i] })
												}

												archive.finalize(function(err, bytes) {
												  if (err) {
												    throw err;
												  }

												  console.log(bytes + ' total bytes');
												});

											});

											
											//admzip.addLocalFile(outFile);										
											// admzip.addLocalFolder(shpPath.toString());
											// admzip.writeZip(outZipFile);

											var responseData = {
												email: email,
												response: response,
												requestType : requestType,
												downloadLink: downloadLink,
												startDate :startDate,
												//endDate :endDate,
												callback :callback,
												totalRecords:totalRecords

											}
											
											sendResponse(responseData);

											

											
	                                    	
	                                    }
	                                });//exec

						break;
//HANDLE KML
						case "kml":
							var admzip = new AdmZip();
							var file = outFile;
							var options = {
							    delimiter: ",",
							    charset: "win1250"
							};
							//console.log("kmlFile");
							//console.log(outKMLfolder);
							var kmlFile = outKMLfolder + "\\"+ "FORMA_OUTPUT"+random+".kml";
							//console.log(kmlFile);
							var rowCount = 0;
							//console.log("kml");

							fs.appendFileSync(kmlFile, "<?xml version='1.0' encoding='UTF-8'?>\n");							
							fs.appendFileSync(kmlFile, "<kml xmlns='http://earth.google.com/kml/2.1'>\n");							
							fs.appendFileSync(kmlFile, "<Document>\n");							
							fs.appendFileSync(kmlFile, "   <name>FORMA_OUTPUT"+random + '.kml' +"</name>\n");

							CSV.parse(file, options, function (err, row, next) {

								rowCount++;
								//console.log(row);
							    if (err) {
							        return console.log(err);
							    }

							    if (row !== null && row[0]!=undefined) {
							    	if (rowCount>1) {
							    	//console.log(row[8]);
							    	//console.log(row[10]);

	    				    		fs.appendFileSync(kmlFile,"   <Placemark>\n")
								    fs.appendFileSync(kmlFile,"       <name>" + row[14] + " - " + row[13] + "%</name>\n")
								    fs.appendFileSync(kmlFile,"       <description>" + row[10] + "</description>\n")
								    fs.appendFileSync(kmlFile,"       <Point>\n")
								    fs.appendFileSync(kmlFile,"           <coordinates>" + row[7] + "," + row[6] + ",0</coordinates>\n")
								    fs.appendFileSync(kmlFile,"       </Point>\n")
								    fs.appendFileSync(kmlFile,"   </Placemark>\n")

							    	}
							        next();
							    }
							    else {
							    	fs.appendFileSync(kmlFile, "</Document>\n");
									fs.appendFileSync(kmlFile, "</kml>\n");
							    	admzip.addLocalFile(kmlFile);	
									admzip.writeZip(outZipFile);
							        var responseData = {
							        			email: email,
												response: response,
												requestType : requestType,
												downloadLink: downloadLink,
												startDate :startDate,
												//endDate :endDate,
												callback :callback,
												totalRecords:totalRecords

											}
							        
									sendResponse(responseData);
							    }
							});
							
							
						break;

					}
						
				}
			});
		})
	
		console.log("processing");

	
//}//open handler
//)//db.open



}//executeDownload


function sendResponse(responseData) {
	var response = responseData.response;
	var requestType = responseData.requestType;
	var downloadLink = responseData.downloadLink;
	var totalRecords = responseData.totalRecords;
	var email = responseData.email;
	var startDate = responseData.startDate;
	//var endDate = responseData.endDate;
	var callback = responseData.callback;
	var totalRecords = responseData.totalRecords;

	var endDate = new Date();
	//console.log(responseData);

	// console.log("sending response");
	// switch (requestType) {
	// case "json":
	// 	response.writeHead(200, {"Content-Type": "application/json"});
	// 	//response.send("Click to Download <a href = '"+downloadLink+"'>"+downloadLink+"</a> ");
	// 	response.write(callback + "({\"results\":\""+downloadLink+"\",\"featureCount\":"+totalRecords+",\"startTime\":\""+startDate.toString()+"\",\"endTime\":\""+endDate.toString()+"\"})");
	// 	response.send();	
	// break;
	// case "html":
	// 	response.send("Click to Download <a href = '"+downloadLink+"'>"+downloadLink+"</a> ");
	// break;
	// }	

	if (email) {
		console.log("Sending Email");
		var smtpTransport = nodemailer.createTransport("SMTP",{
		    service: "Gmail",
		    auth: {
		        user: "blueraster.emailer@gmail.com",
		        pass: "raster2013!"
		    }
		});

		resultsMessage = "No data was found that matched your request."
		
		if (totalRecords>0) {
			resultsMessage = "Hello " + email +", The requested data is available for 48 hours and can be downloaded from here : " + downloadLink; // plaintext body	
		}
		

			// setup e-mail data with unicode symbols
		var mailOptions = {
		    from: "Blue Raster & WRI <aamirsul@gmail.com>", // sender address
		    to: email, // list of receivers
		    subject: "FORMA Download", // Subject line
		    text: resultsMessage
		   //html: "<b>Hello world ✔</b>" // html body
		}

		// send mail with defined transport object
		smtpTransport.sendMail(mailOptions, function(error, response){
		    if(error){
		        console.log(error);
		    }else{
		        console.log("Message sent: " + response.message);
		    }

		    // if you don't want to use this transport object anymore, uncomment following line
		    //smtpTransport.close(); // shut down the connection pool, no more messages
		});

	}


}
