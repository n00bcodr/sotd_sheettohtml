import axios from "axios";
import fs  from "fs"

const sheetId = '1MsnLv-48N3VdoQvZH5y3rKo3zqfxZ4ZA41g_dSOXD28';
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const sheetName = 'Form Responses 1';
const query = encodeURIComponent('Select *')
const url = `${base}&sheet=${sheetName}&tq=${query}`

const DATE_COLUMN_ENUM = ["Timestamp", "Date"]


function init() {
    axios({
	method: "get",
	url: url
    })
        .then(rep => {
            let data  = []
                        //Remove additional text and extract only JSON:
            const jsonData = JSON.parse(rep.data.substring(47).slice(0, -2));
 
            const colz = [];
            //const tr = document.createElement('tr');
            //Extract column labels
            jsonData.table.cols.forEach((heading) => {
                if (heading.label) {
                    let column = heading.label;
                    colz.push(column);
                    //const th = document.createElement('th');
                    //th.innerText = column;
                    //tr.appendChild(th);
                }
            })
            //output.appendChild(tr);
            //extract row data:
            jsonData.table.rows.forEach((rowData) => {
                console.log("!!!!", rowData)
                const row = {};
                colz.forEach((ele, ind) => {
                    row[ele] = (rowData.c[ind] != null) ? rowData.c[ind].v : '' ;
                })
                data.push(row);
            })
            const fileData = processRows(data);
            console.log(fileData)

fs.writeFile('sotd.html', fileData, (err) => {
      
    // In case of a error throw err.
    if (err) throw err;
})
        })
}

const generateHTMLFile = (rowData) => {
    return `<!DOCTYPE html>
<html>
<head>
<center>
    ${rowData.map((eachIframe => eachIframe ))}
</center>
</head>
</html>

`
}

function getId(url) {
    const regExp = url.indexOf("youtu.be"!==-1)? /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/: /^.*(youtube.com\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11)
      ? match[2]
      : url.substr(url.indexOf("?"));
}


const getLinkEmbedInfo = (link) => {
    let truncatedLink = ""
    if (link.indexOf("youtube.com") !== -1) {
        truncatedLink =  "https://www.youtube.com/embed/" + getId(link)
    } else if(link.indexOf("spotify.com") !== -1) {
        truncatedLink = "https://open.spotify.com/embed/" + link.substr(link.indexOf("com/")+4)
     }else if(link.indexOf("youtu.be") !== -1) {
        truncatedLink = "https://www.youtube.com/embed/" + link.substr(link.indexOf(".be/")+4)
    }
    return `<div> 
<iframe  allowfullscreen="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen;  gyroscope; picture-in-picture" loading="lazy" src=${truncatedLink}></iframe>
</div>`
}

function processRows(json) {
    let embedFrames = []
    json.forEach((row) => {
        console.log(row)
        const embedData = getLinkEmbedInfo(row.Link)
        embedFrames.push(embedData)
    })
    return generateHTMLFile(embedFrames)
} 

init()
