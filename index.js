const fs = require('fs');

function capitalize(str){
    let chars = str.split("")
    chars[0] = chars[0].toUpperCase()
    return chars.join("")
}

class CSV { 
    /**
     * 
     * @param {string} filepath the path to the csv file to use
     * @param {string} delimeter the delimeter to use. Default is "," 
     */
    constructor(filepath,delimeter=","){
        this._file = filepath;
        this.delimeter = delimeter;
        this._content = undefined
    }

    /**
     * @description reads the csv file and writes a new json file 
     * @param {string} writeToFolder [optional] the path of the folder to write the new file to.
     */
    convertToJson(writeToFolder=undefined){
        if(writeToFolder && !writeToFolder.endsWith("/")){
            writeToFolder += "/"
        }
        let convertedName = this._file.split(".")[0] + "_converted.json"
        let path = writeToFolder 
            ? writeToFolder + convertedName
            : convertedName
        
        fs.writeFileSync(path, JSON.stringify(this.read(true),undefined,4))
    }

    /**
     * 
     * @param {{}[]} objects an array of objects to covert to csv string
     * @returns {string} a string of the csv representation of the provided list of objects
     */
    convertToCSV(objects){
        if(!objects.length) return { error: "Invalid format. Must be a JSON array of objects"}
        let rows = []
        let schema = Object.keys(objects[0])
        rows.push(schema.map(capitalize))
    

        for(let i = 0; i < objects.length; i++){
            let currentRow = []
            for( const attr of schema ){ 
                currentRow.push(objects[i][attr])
            }
            rows.push(currentRow);
        }

        let csvString = ""
        rows.forEach((row,i)=>{
            let doNewLine = (i <= rows.length -1) ? "\n" : "" 
            csvString += (row.join(this.delimeter)) + doNewLine
        
        })
        return csvString;
    }

    /**
     * 
     * @param {boolean} as_json default to false. If true, will convert the read data to a JSON list, otherwise will return the read rows 
     * @returns 
     */
    read(as_json=false){
        if(this._content) {
            if(as_json){
                return this._content.json
            } 
            return this._content.plain
        }
        try {
            let rows = []
            const buffer = fs.readFileSync(this._file)
            rows = buffer
                    .toString("utf-8")
                    .split("\n")
                    .map(row=>row.split(this.delimeter))
            
            //check "do we need to format to json?"
            if(!as_json) return { rows } 
            
            const result = []
            const schemaKeys = rows[0].map(i=>i.trim().toLowerCase().split(" ").join("_"))
            // for all rows except the header row
            for(let row = 1; row < rows.length; ++row){
                // parse the csv to create json objects for each row
                let appendee={}
                schemaKeys.forEach((key,idx)=>{
                    isNaN(Number(rows[row][idx])) 
                        ? appendee[key] = rows[row][idx]
                        : appendee[key] = Number(rows[row][idx].trim())
                    if(String(rows[row][idx]).includes(",")){
                         appendee[key] = rows[row][idx].split(",")
                    }
            
                })
                result.push(appendee)
            }
            this._content = {plain: rows, json: result}
            return result;
        } catch (err) {
            console.warn("Failed to read CSV at " + this._file)
            console.error(err)
        }

    }

    /**
     * 
     * @param {{}[]} arrayOfObjects 
     * @param {string} newFile [optional] the name of the new file to write to
     */
    write(arrayOfObjects,newFile=null){
        let csvString = this.convertToCSV(arrayOfObjects)
        if(!newFile){ //if overwriting file then reset content cache
            this._content = undefined
        }
        let writingTo = (newFile ? newFile : this._file)
        fs.writeFile(writingTo, csvString, {encoding: "utf-8"},(err=>{
            if(err){
                console.warn("Failed to write file " + this._file)
                console.error(err)
            }
        }))
    }

    /**
     * 
     * @param {{}} object an object to add to the end of the csv file
     * @description converts the object to a row in the table and then appends the row text to the file
     * @returns {void}
     */
    append(object){
        let row = []
        Object.keys(object).forEach(key=>row.push(object[key]))
        if(!fs.existsSync(this._file)){
            return console.error("Failed to find file " + this._file)
        }
        let txt = `\n${row.join(",")}`
        fs.appendFileSync(this._file,txt)
        this._content = undefined
    }

}



module.exports = {CSV}



