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
	var related = (type === "collection") ? "related" : "";
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
	"},\r"+
	"*/\r"+
	"\r"+
	"	module.exports = {\r\t"+
	"\r\t"+
	"	  attributes: {\r\t"+
	"	    " + fieldsOutput.join(',\r') + ",\r\t"+
	"	    " + collectionsOutput.join(',\r') + "\r\t"+
	"	    " + modelsOutput.join(',\r') + "\r\t"+
	"	    " + recordKeepingOutput.join(',\r') + "\r\t"+
	"	  }\r\t"+
	"};\r\t";
	
	return contents;
}

function createController(controller, fields) {
	return "/**\r" + 
	" * "+ controller + "Controller\r" + 
	" *\r" + 
	" * @description :: Base API for "+ controller + "\r" + 
	" */\r" + 
	"\r" + 
	"// MODEL PROPERTY REFERENCE\r" + 
	"\r" + 
	"var primaryField = '" + fields.split(',')[0] + "';\r" + 
	"var searchField;\r" + 
	"var skip = 0;\r" + 
	"var limit = 30;\r" + 
	"var sort = primaryField;\r" + 
	"var dir = \"desc\";\r" + 
	"\r" + 
	"var performSearch = function(req, res, type) {\r" + 
	"        var output = [];\r" + 
	"        var criteria = req.params.id || \"\";\r" + 
	"        var query = {};\r" + 
	"            searchField = req.query.field;\r" + 
	"            skip = req.query.skip || skip;\r" + 
	"            limit = req.query.limit || limit;\r" + 
	"            //sort = (req.query.sort) ? \"{\" + req.query.sort + \": '\" + req.query.dir + \"'}\" : \"{\" + primaryField + \": '\" + dir + \"'}\";\r" + 
	"\r" +
	"        if (criteria && searchField) {\r" + 
	"            // CREATE QUERY OBJECT\r" + 
	"            query = {}; \r" + 
	"            // ADD PROPERTY TO AVOID LITERAL PROP DECLARATION\r" + 
	"            query[searchField] = {\"contains\":criteria}; \r" + 
	"        } else {\r" + 
	"            query[primaryField] = {\"contains\":criteria};\r" + 
	"        }\r" + 
	"        // MODEL REFERENCE\r" + 
	"        "+ controller + ".find()\r" + 
	"        .where(query)\r" + 
	"\r" +
	"		 // COMMENT populateAll OUT IF NOT NEEDED\r" +
	"		 // THIS GRABS ASSOCATED MODEL AND COLLECTION DATA\r" +
	"		 // use .populate('relatedModelName') for each relatedModel\r" + 
	"		 // if specific joins are required\r" +
	"		 " + populateOutput + "\r" +
	"		 .populateAll()\r" +
	"\r" +
	"        .skip(skip)\r" + 
	"        .limit(limit)\r" + 
	"        //.sort(sort)\r" + 
	"\r" + 
	"            .exec(function findCB(err,found){\r" + 
	"                while (found.length) {\r" + 
	"                    var tmp = found.pop();\r" + 
	"                    if (type === 'search') {      // RETURN FULL OBJECT FOR GENERAL SEARCH\r" + 
	"                        output.push(tmp);\r" + 
	"                    } else {                // RETURN PRIMARY FIELD AND ID\r" + 
	"                        var tmpObj = {}\r" + 
	"                        tmpObj[primaryField] = tmp[primaryField];\r" + 
	"                        tmpObj.id = tmp.id;\r" + 
	"                        output.push(tmpObj);\r" + 
	"                    }\r" + 
	"                }\r" + 
	"            return res.json(output);\r" + 
	"        });\r" + 
	"}\r" + 
	"\r" + 
	"module.exports = {\r" + 
	"\r" + 
	"	get: function (req, res) {\r" + 
	"		return performSearch(req, res, 'get');\r" + 
	"	},\r" + 
	"\r" + 
	"	search: function (req, res) {\r" + 
	"		return performSearch(req, res, 'search');\r" + 
	"	},\r" + 
	"\r" + 
	"	model: function(req, res) {\r" + 
	"		// MODEL REFERENCE\r" + 
	"		return res.json("+ controller + "._attributes);\r" + 
	"	},\r" + 
	"\r" + 
	"	displayOrder: function(req, res) {\r" + 
	"		var array = [];\r" + 
	"		for (var prop in Newold._attributes) {\r" + 
	"			array.push(prop);\r" + 
	"		}\r" +  
	"		return res.json(array);\r" + 
	"    }\r" +  
	"};"
}