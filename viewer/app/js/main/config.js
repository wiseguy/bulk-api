define({
    mapservice:{url:"http://ags101.blueraster.net/arcgis/rest/services/gadm/Gadm/MapServer/",options:{opacity:0.4}},
    gadm2: {url:"http://ags101.blueraster.net/arcgis/rest/services/gadm/Gadm/MapServer/2",outFields:["ADMIN_REGION"],idField:"ADMIN_REGION"},
    gadm: { url: "http://ags101.blueraster.net/arcgis/rest/services/gadm/Gadm/MapServer/0", // GADM 1
            namefield: "NAME_2", 
            idfield: "OBJECTID", 
            joinfield: "ISO", 
            altnamefield: "NAME_3",
            idForADM2:"ID_1",
            namefield01:"NAME_1" //State Names 
        },
    countries: {url: "http://ags101.blueraster.net/arcgis/rest/services/gadm/Gadm/MapServer/1",
                namefield:"NAME__0",
                idfield:"ISO3"},
    formaPoints: {url:"http://gis-stage.wri.org/arcgis/rest/services/FORMA/forma50_2005_2013/MapServer",options:{opacity:0.7}},           
    dates:["01/16/2005","01/31/2005","02/15/2005","02/28/2005","03/15/2005","03/31/2005"],
    probabilities:{"min":20,"max":100},
    downloads:[/*{name:"SHP",id:"SHP"},*/{name:'File Geodatabase',id:"GDB"},{name:"Shapefile",id:"SHP"},{name:"KML",id:"KML"},{name:"CSV",id:"CSV"}],
    //countries: [{name:"Indonesia",id:"106"},{name:'Malaysia',id:"136"},{name:"Papua New Guinea",id:"174"}],
    states: [],
    yearBreaks:{
    	"2005":[0,1],//startIndex,Count
    	"2006":[1,24],
    	"2007":[24,47],
    	"2008":[47,70],
    	"2009":[70,93],
    	"2010":[93,116],
    	"2011":[116,139],
    	"2012":[139,162],
    	"2013":[162,166]
    }

});  //End main define

