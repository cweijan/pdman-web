export function convertOldDbs(dbs) {
    if(!dbs){
        return;
    }
    var urlLib = require('url');
    for (const db of dbs) {
        const properties = db.properties
        if(!properties){
            continue;
        }
        const url = properties.url;
        if (!url.startsWith("jdbc:")) {
            continue;
        }
        const newUrl = urlLib.parse(url.replace('jdbc:', ''));
        if (!properties.port) {
            properties.port = newUrl.port||3306;
        }
        if (!properties.database) {
            properties.database = newUrl.pathname.replace("/",'');
        }
    }

}