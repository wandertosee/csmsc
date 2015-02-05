var global = Function("return this;")();
/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
!function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context.$

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules[identifier] || window[identifier]
    if (!module) throw new Error("Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules[name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  function boosh(s, r, els) {
    // string || node || nodelist || window
    if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      els = ender._select(s, r)
      els.selector = s
    } else els = isFinite(s.length) ? s : [s]
    return aug(els, boosh)
  }

  function ender(s, r) {
    return boosh(s, r)
  }

  aug(ender, {
      _VERSION: '0.3.6'
    , fn: boosh // for easy compat to jQuery plugins
    , ender: function (o, chain) {
        aug(chain ? boosh : ender, o)
      }
    , _select: function (s, r) {
        return (r || document).querySelectorAll(s)
      }
  })

  aug(boosh, {
    forEach: function (fn, scope, i) {
      // opt out of native forEach so we can intentionally call our own scope
      // defaulting to the current item and be able to return self
      for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
      // return self for chaining
      return this
    },
    $: ender // handy reference to self
  })

  ender.noConflict = function () {
    context.$ = old
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this);
// pakmanager:fs
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  console.log("I'm `fs` modules");
    
  provide("fs", module.exports);
}(global));

// pakmanager:csmsc
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  /*
    	AUTO GENERATE MODEL AND CONTROLLER FOR SAILS API
    	-n is the name of the model and controller.
    	-f is a list of comma separated fields
    		the first field is considered the primary field
    		
    		/$modelName/get/ is called
    
    			mongodb's auto generated id will be used as the key
    			primaryFild will be the value for that key
    			{
    				_id:value,
    				primaryField:value
    			}
    
    		/$modelName/model/ is called
    
    			returns model definition
    			
    	CREATING Sails MODEL AND Sails CONTROLLER EXAMPLE FROM COMMAND LINE
    	node cSmSc -n what -f oneF,twoF,threFe 
    */
    fs = require('fs');
    
    function writeFile(fileName, contents) {
    	fs.writeFile(fileName, contents, function (err) {
    	  if (err) return console.log(err);
    	  console.log('File:' + fileName + ' written');
    	});
    }
    
    var name;
    var fields = false;
    var api = "api";
    var modelFolder = api + "/models";
    var controllerFolder = api + "/controllers";
    
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
    mkDir(api);
    mkDir(modelFolder);
    mkDir(controllerFolder);
    
    process.argv.forEach(function (val, index, array) {
    	if (val.indexOf("-n") === 0) {
    		 name = array[index+1];
    	}
    	if (val.indexOf("-f") === 0) {
    		 fields = array[index+1];
    	}
    });
    if (!fields) {
    	console.log("Please add -f with field names before running.");
    }
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
    			addDefault = "default: 'admin',\r\t\t\t\t";
    		} else {
    			addDefault = "";
    		}
    	    return " \r\t\t\t"+
    	    field + ": { \r\t\t\t\t"+
            "type: 'string', \r\t\t\t\t"+
            addDefault+
            "\\\\required: true, \r\t\t\t\t"+
            "\\\\unique: true \r\t\t\t"+
      		"}";
    
    }
    
    function createModel(controller, fields) {
    
    	var array = fields.split(",");
    	var output = [];
    	for (var i = 0; i < array.length; i++) {
    		output.push(createFieldDefinition(array[i]));
    	};
    
    	var contents = "\r"+
    	"/**\r"+
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
    	"var fields = '"+ fields.split(',').join('\',\'') + "';\r" + 
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
  provide("csmsc", module.exports);
}(global));