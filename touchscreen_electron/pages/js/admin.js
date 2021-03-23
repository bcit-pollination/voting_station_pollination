console.log('admin.js')
const export_controller = require('../utils/export_tool/export_controller.js');
const ipc = window.require('electron').ipcRenderer;

// stores the jwt returned by login globally
let session_jwt = {}
// stores the election package globally
let election_package = {}

const {
    // start_load_question_process,
    start_BLE_server_process,
    // voting_express_server_process,
} = require('../utils/voting_pi')


const {
    login,
    getElectionsList,
    electionDownload,
} = require('../utils/pollination-api.js');
// const { electionDownload } = require('../../utils/pollination-api');

const {
    ElectionPackageSchema,
    ElectionPackage,
    Schema,
} = require ('../utils/load-questions.js')

let button1 = document.getElementById('get-organization-list-button');
let button2 = document.getElementById('download-electron-package-button');
let button3 = document.getElementById('import-election-button');
let button4 = document.getElementById('export-election-button');
let button5 = document.getElementById('get-election-list-button');

// go Back
document.getElementById('go-back').addEventListener('click', () => {
    console.log('clicked: go-back');
    ipc.send("go-back", "cat");
});

// step-I: login
document.getElementById('central-login-button').addEventListener('click', () => {
    console.log('clicked: central-login-button')
    let email = document.getElementById('login-username-input').value
    let password = document.getElementById('login-password-input').value
    console.log(email, password)

    // stores the jwt in the global variable
    login(email, password).then((jwt) => {
        session_jwt = jwt;
        console.log(jwt)
    });
    
    // hides step-1 items
    document.getElementById('step-I').style.display = "none";
    button5.style.visibility = 'visible';
})

// step-II: getUserOrgs()
document.getElementById('get-organization-list-button').addEventListener('click', () => {
    console.log('clicked: ')
})

// TODO:step-III: get election list, render it to a div
document.getElementById('get-election-list-button').addEventListener('click', () => {
    console.log('clicked: get-election-list-button')

    let electionDisplay = document.getElementById("election-list-display");
    electionDisplay.innerHTML = "<h2>List of Elections:</h2>";

    let org_id = 16 //FIXME: change it to the value entered by the user
    let list = getElectionsList(org_id).then(list => {
        for (let item of list.elections) {
            let electionItem = document.createElement("table");
            electionItem.style.border = "thin solid black";
            electionItem.style.width = "66%";
            electionItem.style.alignItems = "center";
            electionItem.style.textAlign = "center";

            let electionTitleRow = document.createElement("tr");
            electionItem.appendChild(electionTitleRow);
            let electionTitleHeader = document.createElement("td");
            electionTitleRow.appendChild(electionTitleHeader);
            electionTitleHeader.colSpan = 2;
            electionTitleHeader.style.textAlign = "center";
            let electionTitleHeaderButton = document.createElement("button");
            electionTitleHeader.appendChild(electionTitleHeaderButton);
            electionTitleHeaderButton.innerHTML = item.election_description;
            electionTitleHeaderButton.style.fontWeight = "bold";
            electionTitleHeaderButton.style.borderRadius = "3px";

            let startRow = document.createElement("tr");
            electionItem.appendChild(startRow);
            let startTitle = document.createElement("td");
            startRow.appendChild(startTitle);
            startTitle.innerHTML = "Start Time";
            let startData = document.createElement("td");
            startRow.appendChild(startData);
            startData.innerHTML = item.start_time;

            let endRow = document.createElement("tr");
            electionItem.appendChild(endRow);
            let endTitle = document.createElement("td");
            endRow.appendChild(endTitle);
            endTitle.innerHTML = "End Time";
            let endData = document.createElement("td");
            endRow.appendChild(endData);
            endData.innerHTML = item.start_time;

            let br = document.createElement("br");

            electionDisplay.appendChild(electionItem);
            electionDisplay.appendChild(br);

            // FIXME: Check if the .save() saves to the MongoDB
            electionTitleHeaderButton.onclick = function() {
                let id = item.election_id;
                button2.style.visibility = 'visible';

                electionDownload(id).then(result => {
                    result.save((err, doc) => {
                        console.log('saving')
                        err && console.log(err);
                        console.log(doc)
                        return
                    })
                });
            }
        };
    });

    // TODO-2: allow the user to choose one election and start downloading

    // This part of the function, handles hiding the buttons when the table is generated, 
    // and creates a return button to bring it all back.

    button1.style.visibility = 'hidden';
    button2.style.visibility = 'hidden';
    button3.style.visibility = 'hidden';
    button4.style.visibility = 'hidden';
    button5.style.visibility = 'hidden';
})

// TODO step-IV: download
//Added the download-electron-package id to the getelementbyid statement.
document.getElementById('download-electron-package-button').addEventListener('click', () => {
    console.log('clicked: download-election-package-button')
    // TODO: download package

    let election_id = 15
    button3.style.visibility = 'visible';
    button4.style.visibility = 'visible';


    document.getElementById('download-electron-package-button')
        .addEventListener('click', () => {
        })
})

// TODO: think of a way to do step-III: export json to usb


function exportData() {
    const checkedRadio = document.querySelector('input[name="usb"]:checked');
    if(!checkedRadio) return;

     const path = checkedRadio.value;
        
    
    const url = new URL("http://localhost:4000/dataExport");
    const params = {pathName: path};
    
    url.search = new URLSearchParams(params).toString();
    fetch(url).then(response => response.json())
            .then((body) => {
                    console.log(body);
                 
                    
            }); 
}

function importData() {
    const checkedRadio = document.querySelector('input[name="usb"]:checked');
    if(!checkedRadio) return;

     const path = checkedRadio.value;
        
    
    const url = new URL("http://localhost:4000/dataImport");
    const params = {pathName: path};
    
    url.search = new URLSearchParams(params).toString();
    fetch(url).then(response => response.json())
        .then((body) => {
            console.log(body);
            // TODO: Store imported data accordingly
        }); 
}

function showUsbs() {
    fetch('http://localhost:4000/usbs')
  .then(response => response.json())
  .then(data => {
    data = JSON.parse(data);
    console.log(data);
    let usbsDiv = document.getElementById("usbs");
    usbsDiv.innerHTML = "";
        for(const usb of data.usbs){
        if(usb.path == "/" || usb.path == "/boot/efi") continue; // HACK should not show these
        let div = document.createElement("div");
        let input = document.createElement("input");
        let label = document.createElement("label");
        input.setAttribute("type", "radio");
        input.setAttribute("id", usb.path);
        input.setAttribute("name", "usb");
        input.setAttribute("value", usb.path);
        input.setAttribute("class", "radio");
        input.checked = false;
        label.innerText = usb.path;
        div.appendChild(input);
        div.appendChild(label);
        usbsDiv.appendChild(div);
    }

  })
}
showUsbs()
function goBack() {
    window.history.back();
  }
  
