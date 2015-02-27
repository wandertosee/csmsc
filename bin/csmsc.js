#!/usr/bin/env node

var fs = require('fs');

var outputFormat = "\r\t\t\t";

var name;
var fields = false;
var models = false;
var collections = false;
var api = "./api";
var modelFolder = api + "/models";
var controllerFolder = api + "/controllers";
var firstField = true;

function writeFile(fileName, contents) {
	fs.writeFile(fileName, contents, function (err) {
	  if (err) return console.log(err);
	  console.log('File:' + fileName + ' written');
	});
}

function camelCase (str) {
	return str.charAt(0).toLowerCase() + str.slice(1);;
}

console.log();
console.log();

console.log("Creating Sails Model and Controller");

function mkDir(dir) {

	if(!fs.existsSync(dir)){
		fs.mkdirSync(dir, 0766, function(err){
			if(err){ 
				console.log(err);
				response.send("ERROR! Can't make the directory! \n");    // echo the result back
			}
		});   
	}
}

process.argv.forEach(function (val, index, array) {
	if (val.indexOf("-n") === 0) {
		name = array[index+1];
	}
	if (val.indexOf("-f") === 0) {
		fields = array[index+1];
	}
	if (val.indexOf("-m") === 0) {
		models = array[index+1];
	}
	if (val.indexOf("-c") === 0) {
		collections = array[index+1];
	}
});
console.log();
console.log();

if (!fields) {
	console.log("Please add -f with fields in a comma separated list before running.");
	return;
}

if (!name) {
	console.log("Please add -n with ModelName before running.");
	return;
}

if (models) {
	console.log("Models are one to one relationships. Creating " + models);
}

if (collections) {
	console.log("Collections are one to many relationships. Creating " + collections);
	console.log();
	console.log("===================================");
	console.log("****** NOTICE - PLEASE READ *******");
	console.log("===================================");

	console.log();
	console.log();
	console.log("This package is being replaced by DSMC, please switch.");
	console.log();
	console.log();
	console.log("BEFORE running sails lift");
	console.log();
	console.log("Open and modify the value for the via property for each associated collection in " + name + "Controller.js.");
	console.log();
}

mkDir(api);
mkDir(modelFolder);
mkDir(controllerFolder);

var recordKeepingFields ="createdBy,updatedBy";

// CREATE MODEL.js
var model = createModel(name, fields, models, collections);
var modelName = name+".js";
writeFile(modelFolder + "/" + modelName, model);

// CREATE CONTROLLER.js
var controller = createController(name, fields);
var controllerName = name+"Controller.js";
writeFile(controllerFolder + "/" + controllerName, controller);

// USED TO RETURN RELATED TABLE DATA
// SQL PEEPS CONSIDER THIS AS A JOIN
// SOLVED BY SAILSJS adding populateAll()
var populateOutput;

function createFieldDefinition(field) {

	var addDefault = "";
		if (field === 'createdBy' || field === 'updatedBy') {
			addDefault = "defaultsTo: 'admin'," + outputFormat + "\t";
		} else {
			addDefault = "";
		}
	var addUniqueRequired = (firstField) ? "required: true," + outputFormat + "\tunique: true," + outputFormat + "\t" : ""; 
	firstField = false;
	return " " + outputFormat +
	    field + ": { " + outputFormat + "\t"+
	    addUniqueRequired + 
        addDefault+
        "type: 'string'" + outputFormat +
  		"}";
}

function createPropertiesArray(items, fnct) {
	var output = [];
	if (items) {
		var array = items.split(",");
		for (var i = 0; i < array.length; i++) {
			output.push(fnct(array[i]));
		};
	}
	return output;
}

function createDefinition(type, collection) {
	var related = (type === "collection") ? "" : "";
	var via = (type === "model") ? "	via: '" : "	//via: '";
    return " " + outputFormat +
	related + collection + ": { " + outputFormat +
	"	" + type + ": '" + collection.toLowerCase() + "'," + outputFormat +
	via + camelCase(collection) + "'" + outputFormat +
	"},\r";
}

function createCollectionsDefinition(collection) {
    return createDefinition("collection", collection);
}

function createModelsDefinition(model) {
    return createDefinition("model", model);
}

// SOLVED BY SAILSJS adding populateAll()
function createPopulateQuery(model) {
	return "//.populate('" + model + "')" + outputFormat;
}

function createModel(controller, fields, models, collections) {
	var collectionsOutput = createPropertiesArray(collections, createCollectionsDefinition);
	var modelsOutput = createPropertiesArray(models, createModelsDefinition);
	var fieldsOutput = createPropertiesArray(fields, createFieldDefinition);
	var recordKeepingOutput = createPropertiesArray(recordKeepingFields, createFieldDefinition);
		populateOutput = createPropertiesArray(collections, createPopulateQuery);
		populateOutput += createPropertiesArray(models, createPopulateQuery)

	var contents = "/**\r"+
	"* "+controller+".js\r"+
	"*\r"+
	"* @description :: Write something nice. Maybe send a card.\r"+
	"*/\r"+
	"/*\r"+
	"field: {\r"+
	"	type: 'string',\r"+
	"	required: true,\r"+
	"	unique: true\r"+
	"	// supported field types: string, text, integer, float, date, time, datetime, boolean, binary, array, json\r" +
	"},\r"+
	"*/\r"+
	"\r"+
	"	module.exports = {\r\t"+
	"\r\t"+
	"	  attributes: {\r\t"+
	"	    " + fieldsOutput.join(',\r') + ",\r\t"+
	"	    " + collectionsOutput.join('\r') + "\r\t"+
	"	    " + modelsOutput.join(',\r') + "\r\t"+
	"	    " + recordKeepingOutput.join(',\r') + "\r\t"+
	"	  }\r\t"+
	"};\r\t";
	
	return contents;
}
/*
Model.native(function(err, collection){

    // Handle Errors

    collection.find({'query': 'here'}).done(function(error, docs) {

        // Handle Errors

        // Do mongo-y things to your docs here

    });

});
*/

function createController(controller, fields) {
	return 		"/**\r" +
	" * " + controller + "Controller\r" +
	" *\r" +
	" * @description :: Base API for "+ controller + "\r" +
	" */\r" +
	"\r" +
	"// Search Defaults\r" +
	"var defaults = {\r" +
	"	skip: 0,\r" +
	"	limit: 20,\r" +
	"	dir: 'desc',\r" +
	"	primaryField: '" + fields.split(',')[0] + "',\r" +
	"	_textAreas: []\r" +
	"}\r" +
	"\r" +
	"var methods = require('../../common/defaultController.js')(defaults);\r" +
	"\r" +
	"module.exports = methods;\r" +
	"\r" +
	"var setConfig = function(req) {\r" +
	"    \r" +
	"    // MODEL CONFIG\r" +
	"    config.modelName = req.options.controller;\r" +
	"    config.model = sails.models[config.modelName]._attributes;\r" +
	"\r" +
	"    // SEARCH CONFIG\r" +
	"    var query = req.query;\r" +
	"    var params = req.params;\r" +
	"\r" +
	"    config.searchField = query.field || primaryField;\r" +
	"    config.criteria = decodeURIComponent(params.id) || undefined;\r" +
	"    config.skip = parseInt(query.skip) || skip;\r" +
	"    config.limit = parseInt(query.limit) || limit;\r" +
	"    config.dir = query.dir || dir;\r" +
	"    config.sort = {};\r" +
	"    if (query.sort) {\r" +
	"        config.sort[query.sort] = dir;\r" +
	"    } else {\r" +
	"        config.sort[primaryField] = dir;\r" +
	"    }\r" +
	"    config.query = {};\r" +
	"    if (config.criteria !== undefined && config.criteria !== 'undefined') {\r" +
	"        config.query[config.searchField] = {'contains':config.criteria};\r" +
	"    }\r" +
	"    \r" +
	"    return config;\r" +
	"}\r" +
	"\r" +
	"// PERFORM SEARCH ON PROPERTIES OF THIS MODEL\r" +
	"var performSearch = function(res, config, type) {\r" +
	"    var output = [];\r" +
	"    // MODEL REFERENCE\r" +
	"    sails.models[config.modelName].find()\r" +
	"    .where(config.query)\r" +
	"    .populateAll()\r" +
	"    .skip(config.skip)\r" +
	"    .limit(config.limit)\r" +
	"    .sort(config.sort)\r" +
	"\r" +
	"    .exec(function findCB(err,found){\r" +
	"        while (found.length) {\r" +
	"            var tmp = found.pop();\r" +
	"            // RETURN FULL OBJECT FOR SEARCH\r" +
	"            if (type === 'search') {\r" +
	"                output.push(tmp);\r" +
	"            // RETURN SELECTED SEARCH FIELD AND ID FOR GET\r" +
	"            } else {\r" +
	"                var tmpObj = {}\r" +
	"                tmpObj[config.searchField] = tmp[config.searchField];\r" +
	"                tmpObj.id = tmp.id;\r" +
	"                output.push(tmpObj);\r" +
	"            }\r" +
	"        }\r" +
	"       return res.json(output);\r" +
	"    });\r" +
	"}\r" +
	"\r" +
	"var searchRelatedModel = function(res, searchConfig, config) {\r" +
	"     var whereQuery = {};\r" +
	"    whereQuery[searchConfig.via] = { contains: config.criteria };\r" +
	"    // RETURNED FROM INITIAL RELATED DATA QUERY\r" +
	"    // THEN RESET AND RETURNED FROM JOIN TABLE\r" +
	"    var foreignIdArray = []; \r" +
	"    return sails.models[config.searchField].find()\r" +
	"        .where(whereQuery)\r" +
	"        .then(function(relatedDocs){\r" +
	"            for (var i = relatedDocs.length - 1; i >= 0; i--) {\r" +
	"                foreignIdArray.push(relatedDocs[i].id);\r" +
	"            };\r" +
	"            //no relatedDocs found\r" +
	"            if(relatedDocs === undefined) {\r" +
	"                return res.json({notFound:true});\r" +
	"            }\r" +
	"            var whereQuery = {};\r" +
	"            whereQuery[config.searchField] = { '$in':foreignIdArray };\r" +
	"\r" +
	"            // GET PRIMARY DATA using primaryIdArray\r" +
	"            return sails.models[model].find()\r" +
	"            .where(whereQuery)\r" +
	"            .populateAll()\r" +
	"            .then(function(found){\r" +
	"                res.json(found);\r" +
	"            });\r" +
	"    });\r" +
	"}\r" +
	"\r" +
	"module.exports = {\r" +
	"\r" +
	"    get: function (req, res) {\r" +
	"        var config = setConfig(req);\r" +
	"        return performSearch(res, config, 'get');           \r" +
	"    },\r" +
	"\r" +
	"    search: function (req, res) {\r" +
	"\r" +
	"        // GET SEARCH CRITERIA\r" +
	"        var config = setConfig(req);\r" +
	"        var searchConfig = config.model[config.searchField];\r" +
	"\r" +
	"        // PERFORM SEARCH ON PROPERTIES OF THIS MODEL\r" +
	"        if (!searchConfig.hasOwnProperty('via') && !searchConfig.hasOwnProperty('model') && !searchConfig.hasOwnProperty('collection') ) {\r" +
	"            return performSearch(res, config, 'search');           \r" +
	"        }\r" +
	"        // ONE TO ONE RELATIONSHIP\r" +
	"        // PERFORM SEARCH ON PROPERTIES OF EXTERNAL MODEL\r" +
	"        if (searchConfig.hasOwnProperty('model')) {\r" +
	"            return searchRelatedModel(res, searchConfig, config);\r" +
	"        }\r" +
	"\r" +
	"        // ONE TO MANY RELATIONSHIP\r" +
	"        // PERFORM SEARCH ON PROPERTIES OF EXTERNAL MODEL\r" +
	"        // SEARCH FOR FOREIGN IDS ON JOIN TABLE\r" +
	"        // GET PRIMARY COLLECTION IDS FROM JOIN TABLE\r" +
	"        var output = [];\r" +
	"\r" +
	"        // RETURNED FROM INITIAL RELATED DATA QUERY\r" +
	"        // THEN RESET AND RETURNED FROM JOIN TABLE\r" +
	"        var foreignIdArray = []; \r" +
	"        \r" +
	"        // RETURNED FROM JOIN TABLE\r" +
	"        var primaryIdArray = [];\r" +
	"\r" +
	"        // JOIN TABLE CONFIG\r" +
	"        var foreignTableName = searchConfig.collection;\r" +
	"        var joinTableForeignField = searchConfig.via + '_' + searchConfig.via;\r" +
	"        var joinTableModelField = config.modelName + '_' + config.searchField;\r" +
	"        var joinTableName = joinTableModelField.toLowerCase() + '__' + joinTableForeignField;\r" +
	"\r" +
	"        var whereQuery = {};\r" +
	"        whereQuery[searchConfig.via] = { contains: config.criteria };\r" +
	"        \r" +
	"        // GET MATCHING RELATED DATA AND IDs\r" +
	"        // GET FOREIGN DATA USING \r" +
	"        // config.criteria\r" +
	"        var output = sails.models[foreignTableName].find()\r" +
	"            .where(whereQuery)\r" +
	"            .then(function(relatedDocs){\r" +
	"                for (var i = relatedDocs.length - 1; i >= 0; i--) {\r" +
	"                    foreignIdArray.push(relatedDocs[i].id);\r" +
	"                };\r" +
	"                //no relatedDocs found\r" +
	"                if(relatedDocs === undefined) {\r" +
	"                    return res.json({notFound:true});\r" +
	"                }\r" +
	"        // GET JOIN TABLE DATA\r" +
	"        // with primary record\r" +
	"        // using foreignArray ids\r" +
	"        var foreignWhereQuery = {};\r" +
	"            foreignWhereQuery[joinTableForeignField] = foreignIdArray;\r" +
	"            return sails.models[joinTableName].find()\r" +
	"                .where(foreignWhereQuery)\r" +
	"                .then(function(joinData){\r" +
	"                for (var i = joinData.length - 1; i >= 0; i--) {\r" +
	"                    primaryIdArray.push(joinData[i][joinTableModelField]);\r" +
	"                };    \r" +
	"                // GET PRIMARY DATA using primaryIdArray\r" +
	"                    var whereQuery = {id:{'$in':primaryIdArray}};\r" +
	"                    return sails.models[config.modelName].find()\r" +
	"                    .where(whereQuery)\r" +
	"                    .populateAll()\r" +
	"                    .then(function(found){\r" +
	"                        res.json(found);\r" +
	"                    });\r" +
	"                });\r" +
	"            });\r" +
	"    },\r" +
	"\r" +
	"    model: function(req, res) {\r" +
	"        // MODEL REFERENCE\r" +
	"        var config = setConfig(req);\r" +
	"        // Display config here / may be moved\r" +
	"        // Used in dynamic views to set up rich text editor\r" +
	"        config.model._textAreas = ['intro', 'text', 'caption'];\r" +
	"        return res.json(config.model);\r" +
	"    },\r" +
	"\r" +
	"    displayOrder: function(req, res) {\r" +
	"        var config = setConfig(req);\r" +
	"        var array = [];\r" +
	"        for (var prop in config.model) {\r" +
	"            array.push(prop);\r" +
	"        }\r" +
	"        return res.json(array);\r" +
	"    },\r" +
	"\r" +
	"    getCount: function(req, res) {\r" +
	"        var config = setConfig(req);\r" +
	"        sails.models[config.modelName].count(config.query).exec(function countCB(err, found){\r" +
	"            return res.json(found);\r" +
	"        });\r" +
	"    }\r" +
	"};\r" +
	"\r" +
	"/*\r" +
	"function searchPrimary(model, whereQuery) {\r" +
	"    // GET PRIMARY DATA using primaryIdArray\r" +
	"    return sails.models[model].find()\r" +
	"        .where(whereQuery)\r" +
	"        .populateAll()\r" +
	"        .then(function(found){\r" +
	"            console.log(found);\r" +
	"            return found;\r" +
	"        });    \r" +
	"}\r" +
	"\r" +
	"var createIdArray = function (docs) {\r" +
	"    var idArray;\r" +
	"    for (var i = docs.length - 1; i >= 0; i--) {\r" +
	"        idArray.push(docs[i].id);\r" +
	"    };\r" +
	"    //no relatedDocs found\r" +
	"    if(relatedDocs === undefined) {\r" +
	"        return res.json({notFound:true});\r" +
	"    }\r" +
	"    return idArray;\r" +
	"}\r" +
	"*/";
}
