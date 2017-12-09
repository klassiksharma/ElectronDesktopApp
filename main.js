const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

app.on('ready', function() {

  mainWindow = new BrowserWindow({});

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  //Quit app when Closed

  mainWindow.on('closed',function () {
    app.quit();
  })

  //Build from Menu Template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  //Insert Menu
  Menu.setApplicationMenu(mainMenu);
});

function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shopping List Item'
  });

  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  //Garbage Collection
  addWindow.on('closed',function () {
    addWindow = null;
  })
}

//Catch Item:add
ipcMain.on('item:add',function (e, item) {
//  console.log(item);
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
})

//create Menu Template
const mainMenuTemplate = [
  {
    label:'file',
    submenu:[
      {
        label: 'Add Item',
        click(){
          createAddWindow();
        }
      },
      {
        label: 'Clear Items',
        click(){
          //console.log("send clear");
            mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
]

//Check for mac to add empty space

if(process.platform=='darwin'){
  mainMenuTemplate.unshift({});
}

//Add Dev Tools Item if not in Production
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: "Toggle Dev Tools",
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}
