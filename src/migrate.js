import axios from "axios";
import fs  from "fs"

const sheetId = '1MsnLv-48N3VdoQvZH5y3rKo3zqfxZ4ZA41g_dSOXD28';
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const sheetName = 'SOTD Responses';
const query = encodeURIComponent('Select *')
const url = `${base}&sheet=${sheetName}&tq=${query}`

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
            //Extract column labels
            jsonData.table.cols.forEach((heading) => {
                if (heading.label) {
                    let column = heading.label;
                    colz.push(column);
                }
            })
            //extract row data
            jsonData.table.rows.forEach((rowData) => {
                const row = {};
                colz.forEach((ele, ind) => {
                    row[ele] = (rowData.c[ind] != null) ? rowData.c[ind].v : '' ;
                })
                data.push(row);
            })
            const fileData = processRows(data.reverse());

fs.writeFile('sotd.html', fileData, (err) => {
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
<link href='https://fonts.googleapis.com/css?family=Open Sans' rel='stylesheet'>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
/* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 2px grey; 
  border-radius: 20px;
}
 
/* Handle */
::-webkit-scrollbar-thumb {
  background: grey; 
  border-radius: 20px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #000000; 
}
    hr {
        display: block;
        height: 2px;
        border: 0;
        border-top: 1px solid #ccc;
        margin: 1em 0;
        padding: 2px;
    }
    .container-youtube {
        position: relative;
        width: 100%;
        overflow: hidden;
        padding-top: 40%;
        break-after: always;
      }
    .container-spotify {
        position: relative;
        width: 80%;
        overflow: hidden;
        padding-top: 30%;
        break-after: always;
        }
    .responsive-iframe {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 100%;
      border: none;
      border-radius:12px;
    }
      p {color:whitesmoke; text-emphasis: bold;}
    body {
        font-family: 'Open Sans';font-size: 12px;
    }
</style>
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
    let embedLink = ""
    if (link.indexOf("youtube.com") !== -1) {
        embedLink =  "https://www.youtube.com/embed/" + getId(link)
    } else if(link.indexOf("spotify.com") !== -1) {
        embedLink = "https://open.spotify.com/embed/" + link.substr(link.indexOf("com/")+4)
     }else if(link.indexOf("youtu.be") !== -1) {
        embedLink = "https://www.youtube.com/embed/" + link.substr(link.indexOf(".be/")+4)
    }
    let containerType = ""
    if (link.indexOf("youtube.com") !== -1) {
        containerType = "youtube"
    } else if(link.indexOf("spotify.com") !== -1) {
        containerType = "spotify"
     }else if(link.indexOf("youtu.be") !== -1) {
        containerType = "youtube"
    }
    let PublishDate = (link.split('||')[0])


    return `<p>${PublishDate}</p>
    <div class="container-${containerType}"> 
<iframe class="responsive-iframe" src=${embedLink} allowfullscreen="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen;  gyroscope; picture-in-picture" loading="lazy"></iframe>
</div>
<hr/>`
}

function processRows(json) {
    let embedFrames = []
    json.forEach((row) => {
        const embedData = getLinkEmbedInfo(row.Link)
        embedFrames.push(embedData)
    })
    return generateHTMLFile(embedFrames)
} 

init()
