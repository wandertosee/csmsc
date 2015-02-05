# cSmSc

This is a node.js command line utility that creates SailsJS base Models and Controllers for API use.

## Installation

This utility is available on npm. Globally install it by using the **-g** flag:

```bash
npm install -g cSmSc
```

## Usage

To use it, `cd` into a project directory, and run `cSmSc` with -n and -f args to represent model name and properties respectively.

### Examples

Make a model and controller for 'modelName' with properties 'primaryproperty', 'anotherproperty' and 'aThirdproperty':

```bash
cSmSc -n ModelName -f 'primaryproperty','anotherproperty','aThirdproperty'
```

### Notes

SailsJS expects controllers and models to be created using Pascal Case please appropriately name Models with the first character uppercase to ensure compatibility.

cSmSc will write the model into the api/models/ folder.
cSmSc will write the controller into the api/controllers/ folder.

Existing files will be over written.

Model properties are string by default, modify as needed.

MongoDb will add the following

	_id as a unique identifier.
	createdAt date created.
	updatedAt date last updated.

cSmSc will add the following

	createdBy user that created the record.
	updatedBy user that last updated the record.

createdBy and updatedBy values must be passed to the api or will default to 'admin'

