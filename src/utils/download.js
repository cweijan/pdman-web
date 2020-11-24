export const download=(name,text) =>{
    var link = document.createElement("a");
    link.setAttribute('download', name);
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    document.body.appendChild(link);
    link.click();
    link.remove();
} 