var CSV = require("a-csv");
var mongo = require("mongodb");
var fs = require("fs");
var exec = require('child_process').exec;
var csv2json = require("csv-to-json");


//CSV File Path or CSV String or Readable Stream Object
var dateIndexes = [];
var dateOfData = "2013-10-24";
var json = csv2json.parse("datesIndex_"+dateOfData+".csv");
//var json = csv2json.parse("datesIndex_testData.csv");


for (var index in json) {
        dateIndexes.push(json[index]["DATE\r"].replace(/-/g, ''))          
    }


var host = "127.0.0.1";
var port = mongo.Connection.DEFAULT_PORT;
var db = new mongo.Db("forma"+dateOfData,new mongo.Server(host,port,{}));

//var projectionText = "GEOGCS[\"GCS_WGS_1984\",DATUM[\"D_WGS_1984\",SPHEROID[\"WGS_1984\",6378137.0,298.257223563]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]]";


var outFile = __dirname+"\\outputCSV\\formaUniqueAdminObjectIDs"+dateOfData+".csv";
var outFileAll = __dirname+"\\outputCSV\\formaAll.csv";
var filePrefix = "s:\\Data\\WRI\\FORMA\\"+dateOfData+"\\part-";

//var filePrefix = "c:\\Aamir\\Projects_JS_Node\\csv\\testData\\part-";
//var filePrefix = "D:\\Aamir\\Projects_JS_Node\\node-examples\\csv\\testData\\part-";


var csvColumns = "ISO3,ADM_REGION";
//var csvColumnsAll = "UNIQUE_ID,RES,TILEH,TILEV,COL,ROW,LAT,LON,ISO3,PERC_TREE_COVER,ADM_REGION,ECO_REGION,MATT_HANSEN_DEFOR";
var csvColumnsAll = "UNIQUE_ID,LAT,LON,ISO3,ADM_REGION";



var filePaths = [];

// for (var j=0;j<fileCount;j++) {
//     filePaths.push(filePrefix + ("00000"+j).slice(-5));
// }

//console.log(filePaths[0]);
var countries = [];
var fileCount = 600;
var countriesCounter  = {};
var bigData = 200000;
var minProbability = 20;


//var countries  = [];
// var countriesLarge1 = ["BRA"];
// var countriesLarge2 = ["IDN"];
// var countriesLarge2 = ["MYS"];
// var countriesLarge2 = ["IND"];



// for (var j=0;j<countries.length;j++) {
    // fs.appendFile(__dirname+"\\outputSHP\\ALL.prj", projectionText, function (err) {                                  
    //                               console.log("Created Projection file");
    //                             });
// }     

var options = {
    delimiter: "\t",
    charset: "win1250"
};
var i = 0;

fs.appendFileSync(outFile, csvColumns);
fs.appendFileSync(outFileAll, csvColumnsAll);
console.log('Appended Field Names');
var startDate = new Date();
var uniqueObjectIds = [];

db.open(function(error){

    console.log("Connected to mongodb on " + host + ":" + port);   

    for (var j=0;j<fileCount;j++) {
        filePaths.push(filePrefix + ("00000"+j).slice(-5));
        parseCSV(filePaths[j],startDate);
    }     

})


function parseCSV (file,startDate){
     CSV.parse(file, options, function (err, row, next) {

                    if (err) {
                        return console.log(err);
                    }

                    if (row && row[0] != undefined) {
                        //console.log(row);
                        
                        //console.log(i);
                                   
                        var arrayProb = eval(row[12].replace(/ /g, ','));
                        // arrayProb = arrayProb.replace("[", '');
                        // arrayProb = arrayProb.replace("]", '');
                        
                        //var probability = arrayProb.split(",");
                        var drop = true;
                        var threshold_probability = 0;
                        var date_index = 0;

                        
                        var max_of_array = Math.max.apply(Math, arrayProb);
                        var min_of_array = Math.min.apply(Math, arrayProb);
                        
                        // for(var k=0;k<probability.length;k++){
                        // if (parseInt(probability[k])>=minProbability){
                        //     drop = false;     
                        //     threshold_probability = parseInt(probability[k]);
                        //     date_index = k;

                            // console.log(arrayProb); 
                            // console.log(drop);

                           // break;                      
                       //     } // end if
                       // } //end for

                        
                        
                        
                        if (max_of_array>=minProbability) {
                            //console.log(arrayProb);
                            //console.log(max_of_array);
                            //console.log(min_of_array);
                            var unique_id = row[0].toString() + ("0000"+row[1]).slice(-4) + ("0000"+row[2]).slice(-4) + ("0000"+row[3]).slice(-4) + ("0000"+row[4]).slice(-4);// + row[1].toString() + row[2].toString() +  row[3].toString();
                            var unique_id_str = row[0].toString() + "_" +  ("0000"+row[1]).slice(-4) + "_" + ("0000"+row[2]).slice(-4) + "_" + ("0000"+row[3]).slice(-4) + "_" + ("0000"+row[4]).slice(-4);       
                            var insertRowMongoDB = {
                            //"loc":[parseInt(row[5]),parseInt(row[6])],
                            "UNIQUE_ID":unique_id,
                            "UNIQUE_ID_STR":unique_id_str,
                            "RES":parseInt(row[0]),
                            "TILEH":parseInt(row[1]),
                            "TILEV":parseInt(row[2]),
                            "COL":parseInt(row[3]),
                            "ROW":parseInt(row[4]),
                            "LAT":parseFloat(row[5]),
                            "LON":parseFloat(row[6]),
                            "ISO3":row[7],
                            "PERC_TREE_COVER":parseInt(row[8]),
                            "ADM_REGION":parseInt(row[9]),
                            "ECO_REGION":parseInt(row[10]),
                            "MATT_HANSEN_DEFOR":parseInt(row[11]),            
                            "PROBABILITY":arrayProb
                            //"DATE": new Date(dateIndexes[date_index]),
                            //"DATE_INDEX": date_index

                            }
                                
                            //countriesCounter[row[7]]!=undefined?countriesCounter[row[7]]++:countriesCounter[row[7]]=1;

                            //Create a Projection File
                            // if (countries.indexOf(row[7])<0) {
                                

                            //     // if (row[7]!="BRA" && row[7]!="IDN"){
                            //     countries.push(row[7]);    
                            //     // }
                            //     console.log("Created Projection file for " + row[7]);
                            //     fs.appendFile(__dirname+"\\outputSHP\\"+row[7]+".prj", projectionText, function (err) {                                  
                                  
                            //     });
                            // }

                            //var unique_id = row[0].toString() + ("0000"+row[1]).slice(-4) + ("0000"+row[2]).slice(-4) + ("0000"+row[3]).slice(-4) + ("0000"+row[4]).slice(-4);// + row[1].toString() + row[2].toString() +  row[3].toString();
                            //console.log(unique_id);
                            // var insertRowCSVAll = "\n" + unique_id_str + "," + row[0] + "," + row[1] + "," + row[2] + "," + row[3] + ","
                            //                  + row[4] + "," + row[5] + "," + row[6] + "," + row[7] + ","
                            //                   + row[8] + "," + row[9] + "," + row[10] + "," + row[11];
                            //just the x y iso3 and region
                            var insertRowCSVAll = "\n" + unique_id_str + "," + row[5] + "," + row[6] + "," + row[7] + "," + row[9]; 
                                             // + threshold_probability + "," + dateIndexes[date_index];
                            
                            var insertRowCSV = "\n"+ row[7] + "," + row[9];

                            // if (dateIndexes[date_index]==undefined){
                            //     console.log(date_index);
                            //     console.log(dateIndexes[date_index]);                    
                            // }
                            
                            //Add Row to All CSV
                            if (uniqueObjectIds.indexOf(row[9])<0) {
                                uniqueObjectIds.push(row[9]);
                                fs.appendFileSync(outFile, insertRowCSV);
                            }

                            fs.appendFileSync(outFileAll, insertRowCSVAll);
                            
                            //console.log(insertRow);
                            
                                db.collection("forma",function(error, collection){
                                    collection.insert(insertRowMongoDB,function(){
                                       // console.log("Min Probability found for " + unique_id);                                        
                                        // console.log(file);
                                       // console.log(i);
                                    })

                                })//db collection
                        
                        } //if drop
                        
                       // }// end for
                        //console.log(o);

                        next();
                    }
                    else {
                        //all rows reading complete
                        console.log("finished file " + i);
                        //console.log(fileCount-1);
                        console.log("Started At " + startDate.toString());
                        var endDate = new Date();
                        console.log("Ended At " + endDate.toString());
                        
                        //Export to Shapefile

                        if (i===fileCount-1){
                        //     //after all files are processed, expecute python
                        //     console.log("Exporting shapefile.....");

                        //     var countriesSmall  = [];
                        //     var countriesBig  = [];


                        //     for (var iso3 in countriesCounter) {
                        //         countriesCounter[iso3]>=bigData?countriesBig.push(iso3):countriesSmall.push(iso3);
                        //     }


                        //     console.log("Exporting countries " + countriesSmall.join(" "));
                        //     exec('python exportshp.py ' + countriesSmall.join(" "),
                        //           function (error, stdout, stderr) {
                        //             console.log('stdout: ' + stdout);
                        //             console.log('stderr: ' + stderr);
                        //             if (error !== null) {
                        //               console.log('exec error: ' + error);
                        //             }
                        //         });

                        //     for (var c in countriesBig) {
                        //       console.log("Exporting country " + countriesBig[c]);
                        //       exec('python exportshp.py ' + countriesBig[c],
                        //           function (error, stdout, stderr) {
                        //             console.log('stdout: ' + stdout);
                        //             console.log('stderr: ' + stderr);
                        //             if (error !== null) {
                        //               console.log('exec error: ' + error);
                        //             }
                        //         });
                        //     }

                            
                            console.log("Exporting All Countries to GDB");
                            exec('python convertCSV2FGDB.py',
                                  function (error, stdout, stderr) {
                                    console.log('stdout: ' + stdout);
                                    console.log('stderr: ' + stderr);
                                    if (error !== null) {
                                      console.log('exec error: ' + error);
                                    }
                                });
                            
                           

                        }
                        console.log(i);
                        i++;
                        //if (i==(fileCount-1)) db.close();
                    }
                });



}

//mongoexport --db formaData --collection forma --fields RES,TITLEH,TILEV,COL,ROW,LAT,LON,ISO3,PERC_TREE_COVER,ADM_REGION,ECO_REGION,MATT_HANSEN_DEFOR,PROBABILITY,DATE_INDEX --csv --out "c:\Aamir\Projects_JS_Node\csv\contacts.csv"


//******************************
// var fmt = require('fmt');
// var amazonS3 = require('awssum-amazon-s3');

// var s3 = new amazonS3.S3({
//     'accessKeyId'     : "AKIAIIHNFRZNB22NTXTQ",
//     'secretAccessKey' : "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",
//     'region'          : amazonS3.US_EAST_1
// });

// s3.ListBuckets(function(err, data) {
//     fmt.dump(err, 'err');
//     fmt.dump(data, 'data');
// });
//*******************
// var csv = require("csv-to-json");

// //parses file into json and returns a json object
// var json = csv.parse("part-00000");

// //writes the parsed file to a file
// csv.write("outcsv.json");
//**********************
// var csv = require('csv');
// var fs = require('fs');
// csv().from.stream(fs.createReadStream("part-00000"))
// .to.path('part-00000out')
// .transform( function(row){
//   row.unshift(row.pop());
//   console.log(row)
//   return row;
// })
// .on('record', function(row,index){
//   console.log('#'+index+' '+JSON.stringify(row));  
// })
// .on('end', function(count){
//   console.log('Number of lines: '+count);
// })
// .on('error', function(error){
//   console.log(error.message);
// });