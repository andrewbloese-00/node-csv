# node-csv
A lightweight csv reader for nodejs.


## Usage
The utilities are exposed via the "CSV" class. Please refer to the directions below for help getting started. 

1. Install the library either by cloning this repo or with npm
```
 npm install csvjs
```

2. Create a new file script.js with the following contents

```

// import library
const {CSV} = require("csvjs")

// reading a file
let csv = new CSV("<path-to-csv-file>")

//get rows
let rows = csv.read()

//get object list
let objects = csv.read(true)

//append an object to the csv file
csv.append({...yourObject})

//write object list to file
csv.write(objectList:{}[])

//write object list to a different file
csv.write(objectList:{}[],"<new-file-name>")
```


