#!/usr/bin/env node

var fs = require('fs');

function writeFile(fileName, contents) {
	fs.writeFile(fileName, contents, function (err) {
	  if (err) return console.log(err);
	  console.log('File:' + fileName + ' written');
	});
}

var name;
var fields = false;
var api = "./api";
var modelFolder = api + "/models";
var controllerFolder = api + "/controllers";

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
});

if (!name) {
	console.log("Please add -n with ModelName before running.");
	return;
}

if (!fields) {
	console.log("Please add -f with field names before running.");
	return;
}


mkDir(api);
mkDir(modelFolder);
mkDir(controllerFolder);


fields+=",createdBy,updatedBy" ;

// CREATE MODEL.js
var model = createModel(name, fields);
var modelName = name+".js";
writeFile(modelFolder + "/" + modelName, model);

// CREATE CONTROLLER.js
var controller = createController(name, fields);
var controllerName = name+"Controller.js";
writeFile(controllerFolder + "/" + controllerName, controller);

function createFieldDefinition (field) {

	var addDefault = "";
		if (field === 'createdBy' || field === 'updatedBy') {
			//addDefault = "default: 'admin'\r\t\t\t\t";
		} else {
			addDefault = "";
		}
	    return " \r\t\t\t"+
	    field + ": { \r\t\t\t\t"+
        "type: 'string'\r\t\t\t\t"+
        addDefault+
  		"}";

}

function createModel(controller, fields) {

	var array = fields.split(",");
	var output = [];
	for (var i = 0; i < array.length; i++) {
		output.push(createFieldDefinition(array[i]));
	};

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
	"\r"+
	"relationshipOneToOne: {\r"+
	"	model: 'modelName',\r"+
	"	via: 'field'\r"+
	"},\r"+
	"\r"+
	"relationshipOneToMany: {\r"+
	"	collection: 'modelName',\r"+
	"},\r"+
	"*/\r"+
	"\r"+
	"	module.exports = {\r\t"+
	"\r\t"+
	"	  attributes: {\r\t"+
	"	    " + output.join(',\r') + "\r\t"+
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
	"var primaryField = '" + fields.split(',')[0] + "';\r" + 
	"var searchField = \"\";\r" + 
	"var skip = 0;\r" + 
	"var limit = 30;\r" + 
	"var sort = primaryField;\r" + 
	"var dir = \"desc\";\r" + 
	"var fields = ['"+ fields.split(',').join('\',\'') + "'];\r" + 
	"\r" + 
	"var performSearch = function(req, res) {\r" + 
	"        var output = [];\r" + 
	"        var criteria = req.params.id || \"\";\r" + 
	"        var query = {};\r" + 
	"            searchField = req.query.field;\r" + 
	"            skip = req.query.skip || skip;\r" + 
	"            limit = req.query.limit || limit;\r" + 
	"            sort = req.query.sort + \" \" + req.query.dir || sort + \" \" + dir;\r" + 
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
	"        .skip(skip)\r" + 
	"        .limit(limit)\r" + 
	"        .sort(sort)\r" + 
	"\r" + 
	"            .exec(function findCB(err,found){\r" + 
	"                while (found.length) {\r" + 
	"                    var tmp = found.pop();\r" + 
	"                    if (searchField) {      // RETURN FULL OBJECT FOR GENERAL SEARCH\r" + 
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
	"    get: function (req, res) {\r" + 
	"        return performSearch(req, res);\r" + 
	"    },\r" + 
	"\r" + 
	"    search: function (req, res) {\r" + 
	"        return performSearch(req, res);\r" + 
	"    },\r" + 
	"\r" + 
	"    model: function(req, res) {\r" + 
	"        // MODEL REFERENCE\r" + 
	"        return res.json("+ controller + "._attributes);\r" + 
	"    },\r" + 
	"\r" + 
	"    displayOrder: function(req, res) {\r" + 
	"        return res(fields);\r" + 
	"    }\r" +  
	"};"
}