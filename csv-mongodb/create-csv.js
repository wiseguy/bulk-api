var CSV = require("a-csv");
var csv2json = require("csv-to-json");
var fs = require("fs");


var dateOfData = "2013-10-24";
var json = csv2json.parse("datesIndex_"+dateOfData+".csv");
//var outFileAll = __dirname+"\\outputCSV\\formaAll_"+dateOfData+".csv";

var filePrefix = "s:\\Data\\WRI\\FORMA\\"+dateOfData+"\\part-";
//var filePrefix = "D:\\temp\\"+dateOfData+"\\part-";
var csvColumnsAll = "UNIQUE_ID_STR,UNIQUE_ID,RES,TILEH,TILEV,COL,ROW,LAT,LON,ISO3,PERC_TREE_COVER,ADM_REGION,ECO_REGION,MATT_HANSEN_DEFOR,PROBABILITY,DATE_RECORDED,DATE_INDEX";
var filePaths = [];	
var startFile = 0;
var fileCount = 600;
var minProbability = 20;
var outFileAll = "D:\\temp\\forma_temp\\formaAll_"+dateOfData+"_"+fileCount+".csv";
var dateIndexes = [];

for (var index in json) {
	 dateIndexes.push(json[index]["DATE\r"].toString());       
}
	
var options = {
	delimiter: "\t",
	charset: "win1250"
};

fs.appendFileSync(outFileAll, csvColumnsAll);
console.log('Appended Field Names');
var startDate = new Date();


for (var j=startFile;j<fileCount;j++) {
	var filePath = filePrefix + ("00000"+j).slice(-5);
	parseCSV(filePath,startDate,j,function(fileNum){
		console.log("Finished File " + fileNum)
	});
}    


function parseCSV (file,startDate,fileNum,handler){
	CSV.parse(file, options, function (err, row, next) {

		if (err) {
			return console.log(err);
		}

		if (row && row[0] != undefined) {
			//console.log(row[12]);
			var arrayProb = eval(row[12].replace(/ /g, ','));

			
			var drop = true;
			var threshold_probability = 0;
			var date_index = 0;

			var max_of_array = Math.max.apply(Math, arrayProb);
			var min_of_array = Math.min.apply(Math, arrayProb);

       		if (max_of_array>=minProbability) {
				
				for(var k=0;k<arrayProb.length;k++){
					var probability = arrayProb[k];
					if (parseInt(probability)>=minProbability) {
					
						threshold_probability = parseInt(probability);
						date_index = k;

                     	var unique_id = row[0].toString() + ("0000"+row[1]).slice(-4) + ("0000"+row[2]).slice(-4) + ("0000"+row[3]).slice(-4) + ("0000"+row[4]).slice(-4);// + row[1].toString() + row[2].toString() +  row[3].toString();
                      	var unique_id_str = row[0].toString() + "_" +  ("0000"+row[1]).slice(-4) + "_" + ("0000"+row[2]).slice(-4) + "_" + ("0000"+row[3]).slice(-4) + "_" + ("0000"+row[4]).slice(-4);       
                      	var date_recorded = dateIndexes[date_index].replace(/(\r\n|\n|\r)/gm,""); //remove line breaks
		                    //console.log(unique_id);
		                var insertRowCSVAll = "\n" + unique_id_str + "," + unique_id + "," + row[0] + "," + row[1] + "," + row[2] + "," + row[3] + ","
		                	+ row[4] + "," + row[5] + "," + row[6] + "," + row[7] + ","
		                    + row[8] + "," + row[9] + "," + row[10] + "," + row[11] + "," + threshold_probability + ","
		                    + date_recorded + "," + date_index;

		                    fs.appendFileSync(outFileAll, insertRowCSVAll);
                		
	                	} 

	            } //end for
	
	         } 

            next();
        }
        else {
        	
        	handler(fileNum);

        	if (fileNum===fileCount-1) {
	                        console.log("Started Processing At " + startDate.toString());
	                        var endDate = new Date();
	                        console.log("Ended Processing At " + endDate.toString());
	                    } 

	                    return fileNum;                     
	         }
	});//csv parse



}
