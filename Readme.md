# csmsc

This is a node.js command line utility that creates SailsJS base Models and Controllers for API use.

## Installation

This utility is available on npm. Globally install it by using the **-g** flag:

```bash
npm install -g csmsc
```

## Usage

To use it, `cd` into a project directory, and run `csmsc` with -n and -f args to represent model name and properties respectively.

### Examples

Make a model and controller for 'modelName' with properties 'primaryproperty', 'anotherproperty' and 'aThirdproperty':

```bash
csmsc -n ModelName -f firstprop,secondprop,thirdprop
```

```bash
csmsc -n ModelName -f title,url,subtitle,text,author -c tags -m company
```

### Notes

SailsJS expects controllers and models to be created using Pascal Case please appropriately name Models with the first character uppercase to ensure compatibility.

csmsc will write the model into the api/models/ folder.
csmsc will write the controller into the api/controllers/ folder.

Existing files will be over written.

Model properties are string by default, modify as needed.

MongoDb will add the following

	_id as a unique identifier.
	createdAt date created.
	updatedAt date last updated.

csmsc will add the following

	createdBy user that created the record.
	updatedBy user that last updated the record.

createdBy and updatedBy values must be passed to the api or will default to 'admin'


### Additional Notes

#### GENERATE model and Sails controller for SailsJS api
	
	-n is the name of the model and controller.
	-f is a list of comma separated fields
	-c is a list of comma separated collections (one to many)
	-m is a list of comma separated models (one to one)

the first field in the field list is considered the primary field.
		
#### CREATE Sails model and Sails controller EXAMPLE FROM COMMAND LINE

	csmsc -n NewModel -f one,two,three 

#### MODEL - Returns model definition for frontend Validation Error Checking

	http://localhost:1337/newmodel/model/

#### DISPLAYORDER - Returns list of fields for ordered Dynamic view presentation

	http://localhost:1337/newmodel/displayOrder/

#### GET - Returns ID AND PRIMARY fields for dropdowns / suggestive lists

	http://localhost:1337/newmodel/get/

mongodb's auto generated id will be used as the key
primaryFild will be the value for that key

#### SEARCH - Returns results after searching primary or specified field for string

	http://localhost:1337/newmodel/search/la?field=ObjectName

Search string follows the slash

Field string is optional and follows ?field=

Using a search string without a field name will search the primary field / node of the object.

Using a search string with a field name specified will search the specified field / node for the string provided.

#### LIMIT, SKIP

	Limit

		&limit=

	Skip

		&skip= 

#### SORT

Implementation is not complete, this is a placeholder.
