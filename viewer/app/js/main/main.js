define([
    "app/config",
    "app/dates",
    "app/knockout230",
    //"app/viewModel",
    "dojo/_base/array",
    "esri/map",    
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/dijit/BasemapGallery",
    "esri/dijit/BasemapLayer",
    "esri/dijit/Basemap",
    "esri/graphic",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/geometry/webMercatorUtils",
    "dojo/_base/Color",
    "dojo/parser",
    "dijit/registry",
    "dojo/dom",
    "dojo/on",
    "dijit/form/Button",
    "dijit/layout/BorderContainer",
    "esri/dijit/Attribution",
    "esri/arcgis/utils",
    "dojo/store/Memory",
    "dijit/form/FilteringSelect",
    "dijit/form/ComboBox",
    "dijit/form/TextBox",    
    "dojox/validate/web",
    "dojox/data/CsvStore",
    "dojo/io-query",
    "dojo/dom-construct",
    "esri/renderers/SimpleRenderer",
    "esri/request"
    
    ],
    function (config, dates, ko, array, Map, ArcGISDynamicMapServiceLayer, ArcGISTiledMapServiceLayer, FeatureLayer, GraphicsLayer, 
        BasemapGallery, BasemapLayer, Basemap, Graphic, QueryTask, query, SimpleFillSymbol, SimpleLineSymbol,
        webMercatorUtils,Color, parser, registry, dom, on, Button, BorderContainer, Attribution, utils, Memory, FilteringSelect, 
        ComboBox ,TextBox, validate, CsvStore, ioQuery, domConstruct, SimpleRenderer,esriRequest) {

        return {
            config: config,
            initialize: function() {




                var _self = this;
                // parser.parse();
                console.log("Main.initialize");


                var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
                        new Color([130,130,130]), 2),new Color([255,0,0,0.25])
                    ); 
                var sfsHighlight = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
                        new Color([130,130,130]), 2),new Color([255,0,0,0.5])
                    ); 
                var countrySelectRender = new SimpleRenderer(sfs);
                var regionsSelectRender = new SimpleRenderer(sfs);
                var regionsHighlightRender = new SimpleRenderer(sfsHighlight);

                _self.map = new Map("map",{
                    basemap: "topo",
                    center: [0,0],
                    zoom: 3,
                    maxZoom: 14,
                    minZoom: 2,
                    sliderStyle: "small"
                });

                



                on(_self.map,"load",function(){

                    //add default basemap
                var basemap = new ArcGISTiledMapServiceLayer(config.basemap);
                _self.map.addLayer(basemap);

                //add Basemap Selector
                var basemapGallery = new BasemapGallery({
                    showArcGISBasemaps: true,
                    map: _self.map
                }, "basemapGallery");



                var customBasemapLayer = new BasemapLayer({
                    url:config.basemap
                    ,isReference:false
                })
                var customBasemapRefLayer = new BasemapLayer({
                    url:config.basemapReference
                    ,isReference:true
                })

                var customBasemap = new Basemap({
                    layers: [customBasemapLayer,customBasemapRefLayer],
                    title: "Shaded Relief",
                    thumbnailUrl:"app/images/shadedRelief.png",
                    id:"basemap_default"
                });

                basemapGallery.add(customBasemap);
                basemapGallery.startup();

                basemapGallery.select("basemap_default");

                basemapGallery.on("selection-change", function() {
                  // remove all basemap layers                                    
                  array.forEach(_self.map.basemapLayerIds, function(bid) {
                    var l = _self.map.getLayer(bid);
                    if ( l ) {
                        _self.map.removeLayer(l);
                    }
                })
                  
              })

                
                    _self.GadmMap = new ArcGISDynamicMapServiceLayer(config.mapservice.url,config.mapservice.options);
                    _self.formaPoints = new ArcGISDynamicMapServiceLayer(config.formaPoints.url,config.formaPoints.options);
                    _self.CountryLayer = new FeatureLayer(config.countries.url, { mode: FeatureLayer.MODE_SELECTION, maxAllowableOffset: 2000 });
                    //_self.CountryLayer.setDefinitionExpression("ISO3='NONE'");
                    _self.CountryLayer.setOpacity(0.7);
                    _self.CountryLayer.setRenderer(countrySelectRender);
                    
                    _self.RegionLayer = new FeatureLayer(config.gadm.url, { mode: FeatureLayer.MODE_SELECTION, maxAllowableOffset: 500, outFields:[config.gadm.namefield01,config.gadm.idForADM2] });
                    _self.RegionLayer.setRenderer(regionsSelectRender);
                    _self.RegionHighLightLayer = new GraphicsLayer();
                    _self.RegionHighLightLayer.setRenderer(regionsHighlightRender);
                    //_self.RegionLayer.setDefinitionExpression("ISO='NONE'");
                    
                    
                    //_self.map.addLayer(_self.GadmMap);
                    var selectionSymbol = new SimpleFillSymbol().setColor(new Color([255, 255, 0, 0.2]));
                    //_self.CountryLayer.setRenderer(selectionSymbol);
                    console.log(_self.CountryLayer.renderer);
                    _self.RegionLayer.setSelectionSymbol(selectionSymbol);
                    var basemapReference = new ArcGISTiledMapServiceLayer(config.basemapReference);
                    _self.map.addLayers([_self.GadmMap,
                        _self.formaPoints,
                        _self.CountryLayer, 
                        _self.RegionLayer,
                        _self.RegionHighLightLayer
                        ]);

                    on(_self.map,"layers-add-result",function(){
                        _self.CountryLayer.enableMouseEvents();
                        _self.RegionLayer.enableMouseEvents();
                    }); 

                    _self.initMapClickHandlers();
                    _self.initSliders();
                    _self.initSelects();
                    _self.initDownloader();
                    _self.firstMapClick();
                    //_self.map.setCursor("pointer");
                    


                    var viewModel = function(){
                        var that = this;
                        this.currentCountrySelected = ko.observable(false);
                        this.resultsMessage = ko.observable("");
                        this.currentRegionsGraphics = ko.observable(_self.RegionLayer.graphics);
                        this.selectedRegionClick = function(data, event){
                            var graphic = data;
                            _self.RegionLayer.remove(graphic); 
                            _self.RegionHighLightLayer.clear();                            
                            that.currentRegionsGraphics(_self.RegionLayer.graphics);                            
                            return true;
                        }
                        this.mouseOverRegion = function(data, event){

                            //var graphic = data;
                            var geometry = data.geometry;
                            var graphic = new Graphic(geometry,null,null,null);

                            _self.RegionHighLightLayer.add(graphic);                                                   
                            return true;
                        }
                        this.mouseOutRegion = function(data, event){    

                            _self.RegionHighLightLayer.clear();                                                   
                            return true;
                        }

                    }


                //     esriRequest.setRequestPreCallback(function(ioArgs){

                //     // inspect ioArgs
                //     console.log(ioArgs.url, ioArgs.content);

                //     // or, change some query parameters if necessary
                //     ioArgs.content = ioArgs.content || {};
                //     ioArgs.content.random = Math.random();

                //     // don't forget to return ioArgs.
                //     return ioArgs;

                // });




                    //alert(KOModel);
                    var vm = new viewModel();
                    //alert(vm.currentCountrySelected());
                    ko.applyBindings(vm);

                    config.viewModel = vm;
                    
                    //alert(viewModel.currentCountrySelected())

                })


                


},


firstMapClick: function () {
    console.log("firstMapClick")
    var _self = this;
    _self.mapClickHandle = _self.map.on("click", function (evt) {

        console.log(evt);
        var regTask = new QueryTask(config.countries.url);
        var cQuery = new query();
        cQuery.returnGeometry = false;
        cQuery.geometry = evt.mapPoint;
        cQuery.outFields = [config.countries.idfield];
                    //cQuery.outFields = ["*"];

                    regTask.execute(cQuery, function (results) {
                        console.log(results);
                        if (results.features) {
                            //var ext = results.features[0].geometry.getExtent()
                            //_self.map.setExtent(ext);
                            //var iso = results.features[0].attributes[config.countries.idfield];
                            //console.log(_self.countrySelect.get("value"));
                            var iso = results.features[0].attributes[config.countries.idfield];
                            if (_self.countrySelect.get("value")==iso){
                                return;
                            } else {
                                _self.countrySelect.set("value", iso);    
                            }
                            

                            //_self.map.setCursor("default");
                            //_self.mapClickHandle.remove();
                        }
                    });
                });
},

initSliders: function () {
    var _self = this;
    require(["dojo/ready", 'dojox/form/RangeSlider', "dijit/form/HorizontalSlider", "dijit/form/HorizontalRuleLabels",
        "dijit/form/HorizontalRule"],
        function(ready,RangeSlider,HorizontalSlider,HorizontalRuleLabels,HorizontalRule){

            var probrulesNode = domConstruct.create("div", {}, dom.byId("probSlider"), "first");
            var probsliderRules = new HorizontalRule({
                container: "bottomDecoration",
                count: 10,
                ruleStyle: "width: 5px;"
            }, probrulesNode);

                        // Create the labels
                        var problabelsNode = domConstruct.create("div", {}, dom.byId("probSlider"), "first");
                        var probsliderLabels = new HorizontalRuleLabels({
                            container: "bottomDecoration",
                            labels: ["20%","30%","40%","50%","60%","70%","80%","90%","100%"], 
                            labelStyle: "font-size: 0px;margin-bottom:15px;"
                        }, problabelsNode);

                        _self.probSlider =    new dojox.form.HorizontalRangeSlider({
                            minimum: 20,//config.probabilities.min,
                            maximum: 100,//config.probabilities.max,
                            value: [50, 100],
                            pageIncrement: 10,
                            intermediateChanges: false,
                            discreteValues: 9,
                            showButtons: false, 
                            "class":"sliderClass"

                        }, "probSlider");

                        // Start up the widget
                        //_self.dateSlider.startup();
                        _self.probSlider.startup();
                        probsliderRules.startup();
                        probsliderLabels.startup();

                        //var daterulesNode = domConstruct.create("div", {}, dom.byId("dateSlider"), "first");
                        //var datesliderRules = new HorizontalRule({
                        //    container: "bottomDecoration",
                        //    count: 9,
                        //    ruleStyle: "width: 5px;"
                        //}, daterulesNode);

                        //    // Create the labels
                        //var datelabelsNode = domConstruct.create("div", {}, dom.byId("dateSlider"), "first");
                        //var datesliderLabels = new HorizontalRuleLabels({
                        //    labels: ["2005","2006","2007","2009","2010","2011","2012","2013"], 
                        //    container: "bottomDecoration",
                        //    labelStyle: "font-size: 0.75em;padding-bottom:5px;"
                        //}, datelabelsNode);


                        //_self.dateSlider = new dojox.form.HorizontalRangeSlider({
                        //    minimum: 2005,
                        //    maximum: 2013,
                        //    pageIncrement: 1,
                        //    discreteValues:9,
                        //    value: [2005, 2013],
                        //    intermediateChanges: false,
                        //    showButtons: false, 
                        //    "class":"sliderClass"
                        //}, "dateSlider");

                        //    // Start up the widget
                        //    //_self.dateSlider.startup();
                        //_self.dateSlider.startup();
                        //datesliderRules.startup();
                        //datesliderLabels.startup();

                        _self.initSliderHandlers();
                        _self.dateSelects();
                    });
},

initSelects: function () {
    console.log("initSelects");
    var _self = this;
    require(["dojo/ready", "app/config","dojo/_base/lang", "dojo/store/Memory",
     "dojo/_base/array"],
     function (ready, config, lang,Memory, array) {

        var queryCountries = new QueryTask(config.countries.url);
        var outFields = config.countries.outFields;
        var gadmQuery= new query();
        gadmQuery.returnGeometry = false;
        gadmQuery.outFields = outFields;
        gadmQuery.where = "1=1";
        queryCountries.execute(gadmQuery,function(results)    {
            console.log("Got Countries");
            var feats = results.features;

                           // var countryNames = [{ name: "Select Country", id: 9999 }];
                           var countryNames = [];
                           array.forEach(feats,function(feat){
                            featRow = {name:feat.attributes["NAME_0"],id:feat.attributes["ISO3"]};
                            countryNames.push(featRow);

                        });
                           var countryStore = new Memory({
                            data: countryNames
                        })
                           _self.countrySelect = new FilteringSelect({
                            id: "countrySelect",
                            name: "Country",
                            searchAttr: "name",
                            queryExpr: "*${0}*",
                            autoComplete: false,
                            trim: "true",
                                ///value: 9999,
                                store: countryStore
                            },dojo.byId('countrySelect'));

                           // config.states[0]={name:"-",id:9999}
                           var stateStore = new Memory({
                            data: config.states
                        })

                           _self.stateSelect = new FilteringSelect({
                            id: "stateSelect",
                            name: "State",
                            autoComplete: false,
                            searchAttr: "name",
                            queryExpr: "*${0}*",
                            trim: "true",
                            store: stateStore
                        },dojo.byId('stateSelect'));


                           _self.initSelectHandlers();
                       });
})
},

initDownloader: function () {
    console.log("initDownloader");
    var dlStore = new Memory({
        data: config.downloads
    });
    var _self = this;
    _self.downloadSelect = new FilteringSelect({
        id: "downloadSelect",
        name: "Download",
        value: "CSV",
        queryExpr: "*${0}*",
        autoComplete: false,
        store: dlStore,
        searchAttr: "name"
    }, dojo.byId("downloadSelect"));

    _self.downloadSelectChange = _self.downloadSelect.on("change", function (value) {
        config.viewModel.resultsMessage("");
    });

    _self.downloadButton = new Button({
        label: "Download ▼",
        "class":"downloadButton"
    }, "downloadButton");
    _self.initDownloaderHandlers();
},

initSliderHandlers: function () {
    console.log("initSliderHandlers");
    var _self = this;
                //_self.dateSliderChange = _self.dateSlider.on("change", function (value) {
                //    console.log("date: " + value.toString());
                //});

_self.probSliderChange = _self.probSlider.on("change", function (value) {
    config.viewModel.resultsMessage("");
    console.log( "prob: "+ value.toString());
});
},

initSelectHandlers: function () {
    var _self = this;
    _self.countrySelectChange = _self.countrySelect.on("change", function (value) {
        config.viewModel.resultsMessage("");
        if (value){
                        //alert("country " + value);
                        countryChange(value);
                    }
                    
                    function countryChange(value) {
                        //alert(value);
                        config.viewModel.currentCountrySelected(true);
                        _self.regionDefinition = "";
                        _self.regionIDarray = [];
                        var queryStates = new QueryTask(config.gadm.url);
                        var stateQuery = new query();
                        stateQuery.returnGeometry = false;
                        stateQuery.orderByFields = [config.gadm.namefield01];
                        stateQuery.outFields = [config.gadm.namefield01,config.gadm.idfield];
                        stateQuery.where = config.gadm.joinfield + " = '" + value + "'";

                        //Populate _self.stateSelect when _self.countrySelect changes
                        queryStates.execute(stateQuery, function (results) {
                            var feats = results.features;
                            //var stateNames = [{ name: "-", id: -1 }/*,{name:"All",id:-2}*/];
                            var stateNames = [];
                            var curNames
                            array.forEach(feats, function (feat) {
                                var name = feat.attributes[config.gadm.namefield01];
                               // name+= feat.attributes[config.gadm.namefield];
                                // if (feat.attributes[config.gadm.altnamefield]) {
                                //     name += " (" + feat.attributes[config.gadm.altnamefield] + ")";
                                // }
                                
                                var featRow = { name: name, id: feat.attributes[config.gadm.idfield] };
                                stateNames.push(featRow);
                            });
                            var stateStore = new Memory({
                                data: stateNames
                            })
                            _self.stateSelect.set('store', stateStore);
                            //_self.stateSelect.set('value', -1);
                        })

                       // _self.CountryLayer.setDefinitionExpression(config.countries.idfield + " = '" + value + "'");
                       var countryQuery = new query();
                       countryQuery.where = config.countries.idfield + " = '" + value + "'";
                       _self.CountryLayer.selectFeatures(countryQuery,FeatureLayer.SELECTION_NEW,function(features,method){
                        if (features.length>0){
                            _self.map.setExtent(features[0]._extent,true);
                        }
                    })

                        //_self.RegionLayer.setDefinitionExpression(config.gadm.joinfield + " = 'NONE'");

                        var statesQuery = new query();
                        statesQuery.where = config.gadm.joinfield + " = 'NONE'";
                        _self.RegionLayer.selectFeatures(statesQuery,FeatureLayer.SELECTION_NEW,function(features,method){
                            config.viewModel.currentRegionsGraphics(_self.RegionLayer.graphics);

                        })

                        //var layerDefinitions = [];
                        // if (value!='9999') layerDefinitions[1] = config.countries.idfield + " = '" + value + "'";
                        // if (value!='9999') layerDefinitions[0] = config.gadm.joinfield + " = '" + value + "'";
                        // if (value!='9999') _self.GadmMap.setLayerDefinitions(layerDefinitions);
                        // if (value!='9999') zoomToCountry(value);
                        // function zoomToCountry(value) {
                        //     var gadmQuery = new query();
                        //     gadmQuery.returnGeometry = true;
                        //     gadmQuery.outFields = ["*"];
                        //     gadmQuery.where = config.countries.idfield + " = '" + value + "'";
                        //     _self.CountryLayer.queryFeatures(gadmQuery,function (results) {
                        //         console.log("zoomTo");
                        //         var ext = results.features[0].geometry.getExtent()
                        //         console.log(ext);
                        //         var ext_wm = webMercatorUtils.geographicToWebMercator(ext);
                        //         console.log(ext_wm);
                        //         _self.map.setExtent(ext);
                        //     });
                        // }
                    }
                });

_self.regionDefinition = "";
_self.stateSelect.on("change", function (value) {
    config.viewModel.resultsMessage("");

    if (value) {
                        //alert("state " + value);
                        _self.setRegionDefinition(value);
                    }

                    // if (value === -2) {
                    //     var curCountry = _self.countrySelect.get("value");
                    //     _self.regionIDarray = [];
                    //     //_self.RegionLayer.setDefinitionExpression(config.gadm.joinfield + " = '" + value + "'");
                    //     var statesQuery = new query();
                    //     statesQuery.where = config.gadm.joinfield + " = '" + value + "'";
                    //     _self.RegionLayer.selectFeatures(statesQuery,FeatureLayer.SELECTION_NEW,function(features,method){

                    //     })


                    // }
                    // else {
                    //     _self.setRegionDefinition(value);

                    //     console.log("called reg def");
                    // }
                });
},

setRegionDefinition: function (value) {
    var _self = this;
    var curCountry = _self.countrySelect.get("value");

                //get id's from current region graphics and add the new value in the list
                var idList = array.map(_self.RegionLayer.graphics,function(g){
                    return g.attributes[config.gadm.idfield]
                });
                idList.push(value);

                var where = config.gadm.joinfield + " = '" + curCountry + "' AND ";
                where += config.gadm.idfield + " in (" + idList.join(",") + ")";
                

                // console.log("setting region def");
                // var i = array.indexOf(_self.regionIDarray, value)
                // console.log("reg def true");

                // if (value==undefined || value < 0) {
                //     //_self.RegionLayer.setDefinitionExpression("ISO3='NONE'");
                //     var statesQuery = new query();
                //     statesQuery.where = "ISO3='NONE'";
                //     _self.RegionLayer.selectFeatures(statesQuery,FeatureLayer.SELECTION_NEW,function(features,method){

                //     })
                //     return;
                // }
                // if (i < 0) {
                //     _self.regionIDarray.push(value);
                //     i = 0;
                // }
                // else { console.log("pop"); _self.regionIDarray.splice(i,1); }
                // _self.regionDefinition = "";
                // // alert(_self.regionIDarray.toString());
                // // alert(i);
                // _self.regionDefinition = config.gadm.joinfield + " = '" + curCountry + "' AND ";
                // _self.regionDefinition += config.gadm.idfield + " in (" + _self.regionIDarray.toString() + ")";
                //alert(_self.regionDefinition);
                //_self.RegionLayer.setDefinitionExpression(_self.regionDefinition);
                var statesQuery = new query();
                statesQuery.where = where;
                _self.RegionLayer.selectFeatures(statesQuery,FeatureLayer.SELECTION_NEW,function(features,method){
                    config.viewModel.currentRegionsGraphics(_self.RegionLayer.graphics);

                })
            },

            initMapClickHandlers: function () {
                var _self = this;
                _self.RegionLayer.on("load", function () {
                    // on(_self.RegionLayer, "click", function (evt) {
                    //     console.log(evt);
                    // })

                    // _self.CountryLayer.on("mouse-over", function (evt) { _self.map.setCursor("pointer"); });
                    // _self.CountryLayer.on("mouse-out", function (evt) { _self.map.setCursor("default"); });
                    // _self.RegionLayer.on("mouse-over", function (evt) { _self.map.setCursor("pointer"); });
                    // _self.RegionLayer.on("mouse-out", function (evt) { _self.map.setCursor("default"); });
                    //Add State, since the click was on a Country
                    _self.CountryLayer.on("click", function (evt) {
                        console.log(evt);
                        var regTask = new QueryTask(config.gadm.url);
                        var regQuery = new query();
                        regQuery.returnGeometry = false;
                        regQuery.geometry = evt.mapPoint;
                        regQuery.outFields = ["*"];
                        console.log(regQuery.where);

                        regTask.executeForIds(regQuery, function (results) {
                            console.log(results);
                            //_self.regionIDarray.push(results[0]);

                            if (_self.stateSelect.get("value")==results[0]){
                                _self.setRegionDefinition(results[0]);    
                            } else {
                                _self.stateSelect.set("value", results[0]);    
                            }                            
                            
                        });
                    });



                    //Remove State, since the click was on State
                    _self.RegionLayer.on("click", function (evt) {                        
                        var regTask = new QueryTask(config.gadm.url);
                        var regQuery = new query();
                       // regQuery.returnGeometry = false;
                       regQuery.geometry = evt.mapPoint;
                       // regQuery.outFields = ["*"];
                       console.log(regQuery.where);

                       regTask.executeForIds(regQuery, function (results) {
                        console.log(results);
                        array.some(_self.RegionLayer.graphics,function(g){
                            var same = (results[0]==g.attributes.OBJECTID);
                            if (same) {
                                _self.RegionLayer.remove(g);
                                config.viewModel.currentRegionsGraphics(_self.RegionLayer.graphics);

                            }
                            return same;

                        })

                            // //_self.regionIDarray.push(results[0]);
                            // var curStateval = _self.stateSelect.get("value");
                            // if (curStateval === results[0]) {
                            //     console.log("same");
                            //     _self.setRegionDefinition(results[0]);
                            // }
                            // _self.stateSelect.set("value",results[0]);
                        });
});
});


},

initDownloaderHandlers: function () {
    var _self = this;
    _self.downloadButtonClick = _self.downloadButton.on("click", function (value) {
        console.log("Download clicked");
        _self.getDownloadLink(value);
    });

    _self.downloadSelectChange = _self.downloadSelect.on("change", function (value) {
        console.log(value);
    });


},

dateSelects: function(){
    var _self = this;
    var csv =  new CsvStore({
        url: "http://localhost:51362/forma/app/csv/dates.csv"
    });

    console.log(csv);


    var datesStore = new Memory({
        data: dates.dates
    });
    var startNames = [];
    var endNames = [];
    datesStore.query({ year: dates.defaultStartYear }).forEach(function (feat) {
        featRow = { name: feat.name, id: feat.id };
        startNames.push(featRow);
    });
    datesStore.query({ year: dates.defaultEndYear }).forEach(function (feat) {
        featRow = { name: feat.name, id: feat.id };
        endNames.push(featRow);
    });

    var startStore = new Memory({ data: startNames });
    var endStore = new Memory({ data: endNames });
    var styearStore = new Memory({ data: dates.years });
    var endyearStore = new Memory({ data: dates.years });

    var startYearContainer = domConstruct.create("div",null,dojo.byId('startYear'));
    _self.startYear = new FilteringSelect({
        id: "startYear",

        searchAttr: "name",
        value: 0,
        "class":"datesFilter",
        store: styearStore
    }, startYearContainer);
    var startSelectContainer = domConstruct.create("div",null,dojo.byId('startSelect'));
    _self.startSelect = new FilteringSelect({
        id: "startSelect",

        searchAttr: "name",
        value: dates.defaultStartDate,
        "class":"datesFilter",
        store: startStore
    }, startSelectContainer);

                //set defaults
                _self.startYear.set('value', dates.defaultStartYear);
                // _self.startSelect.set('value', dates.defaultStartDate);

                _self.startYear.on("change", function (value) {

                    var startNames = [];
                    datesStore.query({ year: value }).forEach(function (feat) {
                        featRow = { name: feat.name, id: feat.id };
                        startNames.push(featRow);
                    });

                    startStore.setData(startNames);
                    _self.startSelect.set('store', startStore);
                    _self.startSelect.set('value', startNames[0]['id']);
                });

                _self.startSelect.on("change", function (value) {
                    var endYears = [];
                    var curEndYear = _self.endYear.get("value");
                    var curYear = _self.startYear.get("value");
                    styearStore.query(function (object) {
                        return object.id >= curYear;
                    }).forEach(function (feat) {
                        featRow = { name: feat.name, id: feat.id };
                        endYears.push(featRow);
                    });

                    // var endyearStore = new Memory({ data: endYears });
                    // _self.endYear.set('store', endyearStore);

                    // _self.endYear.set('value', endYears[0]['id']);
                   // updateEndDate(curYear);

               });

                


                
                _self.endYear = new FilteringSelect({
                    id: "endYear",
                    
                    searchAttr: "name",
                    value: dates.defaultEndYear,
                    "class":"datesFilter",
                    store: styearStore
                }, dojo.byId('endYear'));

                _self.endSelect = new FilteringSelect({
                    id: "endSelect",
                    
                    searchAttr: "name",
                    value: dates.defaultEndDate,
                    "class":"datesFilter",
                    store: endStore
                }, dojo.byId('endSelect'));

                //alert(dates.defaultEndDate);
                //set defaults
                 //_self.endYear.set('value', dates.defaultEndYear);
                 _self.endSelect.set('value', dates.defaultEndDate);

                 _self.endYear.on("change", updateEndDate);

                 function updateEndDate(value) {

                    var curEndID = _self.endSelect.get("value");
                    

                    var datesStore = new Memory({
                        data: dates.dates
                    });

                    var curStIndex = _self.startSelect.get("value");

                    var endNames = [];
                    datesStore.query(function (object) {
                        return object.id >= curStIndex && object.year == value;
                    }).forEach(function (feat) {
                        featRow = { name: feat.name, id: feat.id };
                        endNames.push(featRow);
                    });

                    var endStore = new Memory({ data: endNames });
                    _self.endSelect.set('store', endStore);


                    _self.endSelect.set('value', endNames[0]['id']);

                }


                //config.ends[0] = { name: "-", id: 9999 }
                //var endStore = new Memory({
                //    data: config.ends
                //})

                //_self.endSelect = new FilteringSelect({
                //    id: "endSelect",
                //    name: "end",
                //    searchAttr: "name",
                //    value: 9999,
                //    store: endStore
                //}, dojo.byId('endSelect'));

},

getDownloadLink: function (value) {

                //first query gadm2 for gadm1 IDS
                //dojo.byId("resultsMessage").innerHTML = "";    
                dojo.removeClass(dojo.byId("downloadImg"),"dijitHidden");
                console.log("download link");

                var _self = this;
                var id1_where = [];
                array.forEach(_self.RegionLayer.graphics,function(g,i){
                    if (i<5){
                        id1_where.push(g.attributes[config.gadm.idForADM2])    
                    }
                    
                })
                
                var curCountry = _self.countrySelect.get("value");
                var qTask = new QueryTask(config.gadm2.url);
                require(["esri/tasks/query"],function(Query){
                    var qry = new Query();
                    qry.returnGeometry = false;                    
                    qry.outFields = [config.gadm2.outFields];
                    qry.where = "ISO = '" + curCountry + "' AND ID_1 IN (" + id1_where.join(",") + ")";
                    //alert(qry.where);
                    //cQuery.outFields = ["*"];
                    var adm2RegionIds = [];
                    qTask.execute(qry, function (results) {

                        if (results.features.length==0){
                            dojo.addClass(dojo.byId("downloadImg"),"dijitHidden");
                            return;
                        }
                        array.forEach(results.features,function(feature){
                            adm2RegionIds.push(feature.attributes[config.gadm2.idField])
                        })

                        var urlparams = []
                        
                        var country = curCountry.toUpperCase();
                        urlparams.push(country);
                        
                        var admin = _self.stateSelect.get("value");
                        urlparams.push(admin);

                        var probs = _self.probSlider.get("value");
                        urlparams.push(probs);

                        var regions = adm2RegionIds;

                        var output = _self.downloadSelect.get("value"); //gdb, kml, csv, shp

                        var startDateIndex = _self.startSelect.get("value");
                        var endDateIndex = _self.endSelect.get("value");//yearBreaks[dates[0]][0];
                        var dateCount =  endDateIndex - startDateIndex + 1;//yearBreaks[dates[1]][1];

                        var downloadURL = config.downloadApiURL;
                        var query = {
                            country: country,
                            minProb: probs[0],
                            maxProb: probs[1],
                            startDateIndex: startDateIndex,
                            dateCount: dateCount,
                            f: "json",
                            output: output
                            
                        };

                        if (regions.length>0) {
                            query.regions = "["+regions.join(",")+"]";
                        }
                        var email = registry.byId("emailAddress").value;
                        if (validate.isEmailAddress(email)) {
                            query.email = email;
                        }

                        var queryStr = ioQuery.objectToQuery(query);
                        console.log(queryStr);
                        downloadURL = downloadURL + "?" + queryStr;
                        //alert(downloadURL);

                        //alert(downloadURL);
                        //example: http://alb:8080/forma/download?country=BRA&regions=[7485,7669]&minProb=70&maxProb=100&startDateIndex=0&dateCount=10&f=html&output=csv
                        //var downloadURL = "http://alb:8080/forma/rest/${ISO3}/${REGION}/${MIN_PROB}/${MAX_PROB}/${START_DATE_INDEX}/${END_DATE_INDEX}/json";
                        //var downloadURL = "http://alb:8080/forma/download?country=${ISO3}&regions=${REGION}/${MIN_PROB}/${MAX_PROB}/${START_DATE_INDEX}/${END_DATE_INDEX}/json";
                        //downloadURL= dojo.string.substitute(downloadURL, { ISO3: country, REGION: admin, MIN_PROB: probs[0], MAX_PROB: probs[1],START_DATE_INDEX: startDateIndex, END_DATE_INDEX: endDateIndex });
                        console.log(downloadURL);
                        //downloadURL = "http://alb:8080/forma/rest/BRA/3605/79/80/0/2/json";

                       // require(["dojo/io/script"],function(ioScript){

                        var jsonpArgs = {
                         url: downloadURL,
                         callbackParamName: "callback",
                         load: function(data){
                           // Set the data from the search into the viewbox in nicely formatted JSON
                           //targetNode.innerHTML = "<pre>" + dojo.toJson(data, true) + "</pre>";
                            if (!validate.isEmailAddress(email)) {
                                if (data.featureCount>0){
                                    //dojo.byId("resultsMessage").innerHTML = "<a href='"+data.results+"' target='_blank'>Download Zip</a>"; 
                                    config.viewModel.resultsMessage("<a href='"+data.results+"' target='_blank'>Download Zip</a>");   
                                } else {
                                    config.viewModel.resultsMessage("No data found");
                                    //dojo.byId("resultsMessage").innerHTML = "No data found";    
                                }
                        }
                         

                        dojo.addClass(dojo.byId("downloadImg"),"dijitHidden");
                    },
                    error: function(error){
                           //targetNode.innerHTML = "An unexpected error occurred: " + error;
                           //dojo.byId("resultsMessage").innerHTML = "Error in download";
                           config.viewModel.resultsMessage("Error in download");
                           dojo.addClass(dojo.byId("downloadImg"),"dijitHidden");
                       }
                   };
                   dojo.io.script.get(jsonpArgs);
                   if (validate.isEmailAddress(email)) {
                           //dojo.byId("resultsMessage").innerHTML = "Data request started. On completion a download link will be sent to " + email;
                           config.viewModel.resultsMessage("Data request started. On completion a download link will be sent to " + email);
                           dojo.addClass(dojo.byId("downloadImg"),"dijitHidden");
                        }



               })

})


return;






},

showLoadingIcon: function(Id,Container) {
    require(["dojo/dom-style"],function(domStyle){
        var top = ((domStyle.get(Container,"height") / 2) - 24)+"px";
        var right = ((domStyle.get(Container,"width") / 2) - 24)+"px";
        domStyle.set(Id,"top",top);
        domStyle.set(Id,"right",right);
        domStyle.set(Id,"visibility","visible");
    });
            }, // End Show Loading Icon

            hideLoadingIcon: function(Id) {
                require(["dojo/dom-style"],function(domStyle){
                    domStyle.set(Id,"visibility","hidden");
                });
            } // End Hide Loading Icon

            
        };
    });