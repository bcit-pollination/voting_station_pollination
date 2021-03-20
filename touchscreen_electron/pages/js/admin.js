console.log('admin.js')


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
} = require('../utils/pollination-api.js')

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
})

// step-II: getUserOrgs()
document.getElementById('get-organization-list-button').addEventListener('click', () => {
    console.log('clicked: ')
})

// TODO:step-III: get election list, render it to a div
document.getElementById('get-election-list-button').addEventListener('click', () => {
    console.log('clicked: get-election-list-button')


    // TODO-1: get election list & render election list 
    let org_id = 16 //FIXME: change it to the value entered by the user
    getElectionsList(org_id).then(r => {
        console.log(r)
    })
    // TODO-2: allow the user to choose one election and start downloading
    // TODO-3: hide step-2 items

})

// TODO step-IV: download
//Added the download-electron-package id to the getelementbyid statement.
document.getElementById('download-electron-package-button').addEventListener('click', () => {
    console.log('clicked: download-election-package-button')
    // TODO: download package

    let election_id = 15

    let list_display_div = getElementById('election-list-display')

    document.getElementById('download-electron-package-button')
        .addEventListener('click', () => {

        })

})

// TODO: think of a way to do step-III: export json to usb


function goBack() {
    window.history.back();
  }
  
