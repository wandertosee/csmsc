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
csmsc -n ModelName -f 'primaryproperty','anotherproperty','aThirdproperty'
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

	csmsc -n NewModel -f one,two,three 