const path = require('path')
const settings = require('electron-settings')
const electron = require('electron');
//自动更新
var win;
var tray; //TODO
//初始化默认应用窗口菜单快捷键
function initDefMenu() {
    let menu = new electron.Menu();
    /* f11 打开控制台 */
    let f11_menuItem = new electron.MenuItem({
        accelerator: 'f11',
        click: function (menuItem, browserWindow, event) {
            let webContents = browserWindow.webContents;
            if (webContents != null) {
                if (webContents.isDevToolsOpened()) {
                    webContents.closeDevTools();
                } else {
                    webContents.openDevTools({
                        mode: 'bottom'
                    })
                }
            }
        },
        visible: false
    });
    /* f5:刷新页面 */
    let f5_menuItem = new electron.MenuItem({
        accelerator: 'f5',
        click: function (menuItem, browserWindow, event) {
            let webContents = browserWindow.webContents;
            webContents.reload();
        },
        visible: false
    });
    menu.append(f11_menuItem)
    menu.append(f5_menuItem)
    electron.app.setApplicationMenu(menu)
}

//初始化窗口
function initWindow() {
    /* 打开主窗口 */
    win = new electron.BrowserWindow({
        transparent: true,
        alwaysOnTop: true,
        fullscreen: true,
        center: true,
        frame: false,
        icon: path.join(__dirname, "favicon.png"),
        title: electron.app.getName(),
        autoHideMenuBar: true
    });
    win.setIgnoreMouseEvents(true)
    win.loadFile('index.html');
    win.on('closed', function () {
        electron.app.quit();
    })
    win.on('restore',function(){
        win.maximize()
    })
    // win.webContents.openDevTools()
}

//初始化托盘图标
function initTray() {
    tray = new electron.Tray(path.join(__dirname, "favicon.png"));
    let quit = new electron.MenuItem({
        label: '退出',
        type: 'normal',
        click: function () {
            electron.app.quit();
        }
    });
    /* f5:刷新页面 */
    let microphone = new electron.MenuItem({
        type: 'checkbox',
        label: '使用麦克风',
        checked: settings.get('isOpenAudio'),
        click: function (item) {
            settings.set('isOpenAudio', item.checked)
            win.webContents.send('restart')
        },
    });
    let restart = new electron.MenuItem({
        label: '重载',
        type: 'normal',
        click: function () {
            win.webContents.send('restart')
        }
    });
    let console = new electron.MenuItem({
        label: '控制台',
        type: 'normal',
        click: function () {
            win.setIgnoreMouseEvents(false)
            win.webContents.openDevTools({
                mode: 'bottom'
            })
        }
    });
    let menu = new electron.Menu()
    menu.append(microphone)
    menu.append(restart)
    menu.append(console)
    menu.append(quit)
    tray.setContextMenu(menu)
}


electron.app.on('ready', function () {
    initDefMenu()
    initWindow()
    initTray()
});