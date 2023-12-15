"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = __importDefault(require("process"));
const electron_1 = __importDefault(require("electron"));
const notionIpc = __importStar(require("../helpers/notionIpc"));
const urlHelpers = __importStar(require("../shared/urlHelpers"));
const electronApi = {
    openInNewWindow(urlPath) {
        notionIpc.sendToMainListeners("notion:create-window", urlPath);
    },
    openExternalUrl(url) {
        const sanitizedUrl = urlHelpers.sanitizeUrlStrict(url);
        if (sanitizedUrl) {
            void electron_1.default.shell.openExternal(url);
        }
    },
    clearBrowserHistory() {
        electron_1.default.remote.getCurrentWebContents().clearHistory();
    },
    getAppVersion() {
        return electron_1.default.remote.app.getVersion();
    },
    setBadge(str) {
        const dock = electron_1.default.remote.app.dock;
        if (dock) {
            dock.setBadge(str);
            return;
        }
        const win = electron_1.default.remote.getCurrentWindow();
        if (win.setOverlayIcon) {
            if (str === "") {
                win.setOverlayIcon(null, "");
                return;
            }
            const canvas = document.createElement("canvas");
            canvas.width = 16 * window.devicePixelRatio;
            canvas.height = 16 * window.devicePixelRatio;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                return;
            }
            const scale = 18 / 20;
            const centerX = canvas.width / 2 / scale;
            const centerY = canvas.height / 2 / scale;
            const radius = (canvas.width / 2) * scale * scale;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = "rgba(247,94,79,0.95)";
            ctx.fill();
            ctx.font = `${9 * scale * window.devicePixelRatio}px sans-serif`;
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(str, centerX, centerY + 3.5 * scale * window.devicePixelRatio);
            const pngData = electron_1.default.remote.nativeImage
                .createFromDataURL(canvas.toDataURL("image/png"))
                .toPNG();
            const img = electron_1.default.remote.nativeImage.createFromBuffer(pngData, {
                scaleFactor: window.devicePixelRatio,
            });
            win.setOverlayIcon(img, `${str} unread notifications`);
        }
    },
    windowFocus: {
        addListener(fn) {
            electron_1.default.remote.app.addListener("browser-window-focus", fn);
        },
        removeListener(fn) {
            electron_1.default.remote.app.removeListener("browser-window-focus", fn);
        },
    },
    fullscreen: {
        get() {
            const window = electron_1.default.remote.getCurrentWindow();
            return window && window.isFullScreen();
        },
        addListener(fn) {
            notionIpc.receiveNotionFromIndex.addListener("notion:full-screen-changed", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromIndex.removeListener("notion:full-screen-changed", fn);
        },
    },
    inPageSearch: {
        start(isPeekView) {
            notionIpc.sendNotionToIndex("search:start", isPeekView);
        },
        stop() {
            notionIpc.sendNotionToIndex("search:stop");
        },
        started: {
            addListener(fn) {
                notionIpc.receiveNotionFromIndex.addListener("search:started", fn);
            },
            removeListener(fn) {
                notionIpc.receiveNotionFromIndex.removeListener("search:started", fn);
            },
        },
        stopped: {
            addListener(fn) {
                notionIpc.receiveNotionFromIndex.addListener("search:stopped", fn);
            },
            removeListener(fn) {
                notionIpc.receiveNotionFromIndex.removeListener("search:stopped", fn);
            },
        },
    },
    zoom: {
        set(scale) {
            notionIpc.sendNotionToIndex("zoom", scale);
        },
        get() {
            return electron_1.default.webFrame.getZoomFactor();
        },
    },
    loadSpellcheck: () => {
        try {
            const cld = require("cld");
            electronApi.cld = {
                detect: (text, fn) => {
                    cld.detect(text, fn);
                },
            };
        }
        catch (error) {
            console.error("Failed to load spellchecker", error);
        }
    },
    setSpellCheckerLanguages: languages => {
        const session = electron_1.default.remote.getCurrentWebContents().session;
        session.setSpellCheckerLanguages(languages.filter(language => session.availableSpellCheckerLanguages.includes(language)));
    },
    contextMenu: {
        addListener: fn => {
            electron_1.default.remote.getCurrentWebContents().addListener("context-menu", fn);
        },
        removeListener: fn => {
            electron_1.default.remote.getCurrentWebContents().removeListener("context-menu", fn);
        },
    },
    replaceMisspelling: (word) => {
        electron_1.default.remote.getCurrentWebContents().replaceMisspelling(word);
    },
    cut: () => {
        electron_1.default.remote.getCurrentWebContents().cut();
    },
    copy: () => {
        electron_1.default.remote.getCurrentWebContents().copy();
    },
    paste: () => {
        electron_1.default.remote.getCurrentWebContents().paste();
    },
    inspectElement: (x, y) => {
        electron_1.default.remote.getCurrentWebContents().inspectElement(x, y);
    },
    copyText: (text) => {
        electron_1.default.clipboard.writeText(text);
    },
    copyImage: (src) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            canvas.height = img.height;
            canvas.width = img.width;
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL("image/png");
                electron_1.default.clipboard.writeImage(electron_1.default.nativeImage.createFromDataURL(dataURL));
            }
        };
        img.src = src;
    },
    openDevTools: () => {
        electron_1.default.remote.getCurrentWebContents().openDevTools();
    },
    setWindowTitle: title => {
        const browserWindow = electron_1.default.remote.getCurrentWindow();
        if (browserWindow.getTitle() !== title) {
            browserWindow.setTitle(title);
        }
    },
    toggleMaximized: () => {
        const win = electron_1.default.remote.getCurrentWindow();
        if (win.isMaximized()) {
            win.unmaximize();
        }
        else {
            win.maximize();
        }
    },
    checkForUpdates() {
        notionIpc.sendToMainListeners("notion:check-for-updates");
    },
    updateReady: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:update-ready", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:update-ready", fn);
        },
    },
    installUpdate() {
        notionIpc.sendToMainListeners("notion:install-update");
    },
    updateError: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:update-error", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:update-error", fn);
        },
    },
    updateChecking: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:checking-for-update", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:checking-for-update", fn);
        },
    },
    updateAvailable: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:update-available", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:update-available", fn);
        },
    },
    updateProgress: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:update-progress", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:update-progress", fn);
        },
    },
    updateNotAvailable: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:update-not-available", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:update-not-available", fn);
        },
    },
    checkForAppUpdates() {
        notionIpc.sendToMainListeners("notion:check-for-app-updates");
    },
    appUpdateReady: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:app-update-ready", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:app-update-ready", fn);
        },
    },
    appUpdateError: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:app-update-error", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:app-update-error", fn);
        },
    },
    appUpdateChecking: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:checking-for-app-update", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:checking-for-app-update", fn);
        },
    },
    appUpdateAvailable: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:app-update-available", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:app-update-available", fn);
        },
    },
    appUpdateProgress: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:app-update-progress", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:app-update-progress", fn);
        },
    },
    appUpdateNotAvailable: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:app-update-not-available", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:app-update-not-available", fn);
        },
    },
    appUpdateFinished: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:app-update-finished", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:app-update-finished", fn);
        },
    },
    appUpdateInstall: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:app-update-install", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:app-update-install", fn);
        },
    },
    windowsBackgrounded: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:windows-backgrounded", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:windows-backgrounded", fn);
        },
    },
    getSubstitutions() {
        return ((electron_1.default.remote.systemPreferences.getUserDefault &&
            electron_1.default.remote.systemPreferences.getUserDefault("NSUserDictionaryReplacementItems", "array")) ||
            []);
    },
    isMainWindow() {
        const currentWindow = electron_1.default.remote.getCurrentWindow();
        const focusedWindow = electron_1.default.remote.BrowserWindow.getFocusedWindow();
        if (focusedWindow && focusedWindow.isVisible()) {
            return focusedWindow.id === currentWindow.id;
        }
        const firstWindow = electron_1.default.remote.BrowserWindow.getAllWindows().filter(window => window.isVisible())[0];
        return firstWindow && firstWindow.id === currentWindow.id;
    },
    windowIsVisible() {
        const currentWindow = electron_1.default.remote.getCurrentWindow();
        return currentWindow.isVisible();
    },
    setTheme(theme) {
        notionIpc.sendNotionToIndex("search:set-theme", theme);
    },
    newWindow: {
        addListener: fn => {
            electron_1.default.remote.getCurrentWebContents().addListener("new-window", fn);
        },
        removeListener: fn => {
            electron_1.default.remote.getCurrentWebContents().removeListener("new-window", fn);
        },
    },
    openOauthPopup: async (args) => {
        notionIpc.sendToMainListeners("notion:create-popup", args);
        return new Promise(resolve => {
            const handlePopupCallback = (sender, url) => {
                notionIpc.receiveNotionFromMain.removeListener("notion:popup-callback", handlePopupCallback);
                resolve(url);
            };
            notionIpc.receiveNotionFromMain.addListener("notion:popup-callback", handlePopupCallback);
        });
    },
    openGoogleDrivePickerPopup: async (args) => {
        notionIpc.sendToMainListeners("notion:create-google-drive-picker", args);
        return new Promise(resolve => {
            const handlePopupCallback = (sender, file) => {
                notionIpc.receiveNotionFromMain.removeListener("notion:google-drive-picker-callback", handlePopupCallback);
                resolve(file);
            };
            notionIpc.receiveNotionFromMain.addListener("notion:google-drive-picker-callback", handlePopupCallback);
        });
    },
    getCookie: (cookieName) => {
        return notionIpc.invokeMainHandler("notion:get-cookie", cookieName);
    },
    setLogglyData: data => {
        notionIpc.sendToMainListeners("notion:set-loggly-data", data);
    },
    clearCookies: () => {
        notionIpc.sendToMainListeners("notion:clear-cookies");
    },
    resetAppCache() {
        notionIpc.sendToMainListeners("notion:reset-app-cache");
    },
    appUpdateReload: {
        emit: info => {
            notionIpc.broadcast.emit("notion:app-update-reload", info);
        },
        addListener(fn) {
            notionIpc.broadcast.addListener("notion:app-update-reload", fn);
        },
        removeListener(fn) {
            notionIpc.broadcast.removeListener("notion:app-update-reload", fn);
        },
    },
    getAppPath() {
        return electron_1.default.remote.app.getAppPath();
    },
    clearAllCookies: () => {
        notionIpc.sendToMainListeners("notion:clear-all-cookies");
    },
    downloadUrl(url) {
        electron_1.default.remote.getCurrentWebContents().downloadURL(url);
    },
    onNavigate: {
        addListener(fn) {
            notionIpc.receiveNotionFromMain.addListener("notion:navigate-to-url", fn);
        },
        removeListener(fn) {
            notionIpc.receiveNotionFromMain.removeListener("notion:navigate-to-url", fn);
        },
    },
    getSqliteMeta: () => {
        return notionIpc.invokeMainHandler("notion:get-sqlite-meta");
    },
    refreshAll: includeFocusedWindow => {
        return notionIpc.invokeMainHandler("notion:refresh-all", includeFocusedWindow);
    },
    ready() {
        const currentWindow = electron_1.default.remote.getCurrentWindow();
        return notionIpc.invokeMainHandler("notion:ready", currentWindow.id);
    },
    sqliteServerEnabled: false,
};
window["__electronApi"] = electronApi;
window["__isElectron"] = true;
window["__platform"] = process_1.default.platform;
//# sourceMappingURL=preload.js.map

//notion-enhancer
require('notion-enhancer')('renderer/preload', exports, (js) => eval(js));

function at(n) {
    // ToInteger() abstract op
    n = Math.trunc(n) || 0;
    // Allow negative indexing from the end
    if (n < 0) n += this.length;
    // OOB access is guaranteed to return undefined
    if (n < 0 || n >= this.length) return undefined;
    // Otherwise, this is just normal property access
    return this[n];
}

const TypedArray = Reflect.getPrototypeOf(Int8Array);
for (const C of [Array, String, TypedArray]) {
    Object.defineProperty(C.prototype, "at",
                          { value: at,
                            writable: true,
                            enumerable: false,
                            configurable: true });
}


(function __polyfill_2() {
    function getClientHints(navigator) {
        let { userAgent } = navigator;
        let mobile, platform = '', platformVersion = '', architecture = '', bitness = '', model = '', uaFullVersion = '', fullVersionList = [];
        let platformInfo = userAgent;
        let found = false;
        let versionInfo = userAgent.replace(/\(([^)]+)\)?/g, ($0, $1) => {
            if (!found) {
                platformInfo = $1;
                found = true;
            }
            return '';
        });
        let items = versionInfo.match(/(\S+)\/(\S+)/g);
        let webview = false;
        // detect mobile
        mobile = userAgent.indexOf('Mobile') !== -1;
        let m;
        let m2;
        // detect platform
        if ((m = /Windows NT (\d+(\.\d+)*)/.exec(platformInfo)) !== null) {
            platform = 'Windows';
            // see https://docs.microsoft.com/en-us/microsoft-edge/web-platform/how-to-detect-win11
            let nt2win = {
                '6.1': '0.1', // win-7
                '6.2': '0.2', // win-8
                '6.3': '0.3', // win-8.1
                '10.0': '10.0', // win-10
                '11.0': '13.0', // win-11
            };
            let ver = nt2win[m[1]];
            if (ver)
                platformVersion = padVersion(ver, 3);
            if ((m2 = /\b(WOW64|Win64|x64)\b/.exec(platformInfo)) !== null) {
                architecture = 'x86';
                bitness = '64';
            }
        } else if ((m = /Android (\d+(\.\d+)*)/.exec(platformInfo)) !== null) {
            platform = 'Android';
            platformVersion = padVersion(m[1]);
            if ((m2 = /Linux (\w+)/.exec(navigator.platform)) !== null) {
                if (m2[1]) {
                    m2 = parseArch(m2[1]);
                    architecture = m2[0];
                    bitness = m2[1];
                }
            }
        } else if ((m = /(iPhone|iPod touch); CPU iPhone OS (\d+(_\d+)*)/.exec(platformInfo)) !== null) {
            // see special notes at https://www.whatismybrowser.com/guides/the-latest-user-agent/safari
            platform = 'iOS';
            platformVersion = padVersion(m[2].replace(/_/g, '.'));
        } else if ((m = /(iPad); CPU OS (\d+(_\d+)*)/.exec(platformInfo)) !== null) {
            platform = 'iOS';
            platformVersion = padVersion(m[2].replace(/_/g, '.'));
        } else if ((m = /Macintosh; (Intel|\w+) Mac OS X (\d+(_\d+)*)/.exec(platformInfo)) !== null) {
            platform = 'macOS';
            platformVersion = padVersion(m[2].replace(/_/g, '.'));
        } else if ((m = /Linux/.exec(platformInfo)) !== null) {
            platform = 'Linux';
            platformVersion = '';
            // TODO
        } else if ((m = /CrOS (\w+) (\d+(\.\d+)*)/.exec(platformInfo)) !== null) {
            platform = 'Chrome OS';
            platformVersion = padVersion(m[2]);
            m2 = parseArch(m[1]);
            architecture = m2[0];
            bitness = m2[1];
        }
        if (!platform) {
            platform = 'Unknown';
        }
        // detect fullVersionList / brands
        let notABrand = { brand: ' Not;A Brand', version: '99.0.0.0' };
        if ((m = /Chrome\/(\d+(\.\d+)*)/.exec(versionInfo)) !== null && navigator.vendor === 'Google Inc.') {
            fullVersionList.push({ brand: 'Chromium', version: padVersion(m[1], 4) });
            if ((m2 = /(Edge?)\/(\d+(\.\d+)*)/.exec(versionInfo)) !== null) {
                let identBrandMap = {
                    'Edge': 'Microsoft Edge',
                    'Edg': 'Microsoft Edge',
                };
                let brand = identBrandMap[m[1]];
                fullVersionList.push({ brand: brand, version: padVersion(m2[2], 4) });
            } else {
                fullVersionList.push({ brand: 'Google Chrome', version: padVersion(m[1], 4) });
            }
            if (/\bwv\b/.exec(platformInfo)) {
                webview = true;
            }
        } else if ((m = /AppleWebKit\/(\d+(\.\d+)*)/.exec(versionInfo)) !== null && navigator.vendor === 'Apple Computer, Inc.') {
            fullVersionList.push({ brand: 'WebKit', version: padVersion(m[1]) });
            if (platform === 'iOS' && (m2 = /(CriOS|EdgiOS|FxiOS|Version)\/(\d+(\.\d+)*)/.exec(versionInfo)) != null) {
                let identBrandMap = { // no
                    'CriOS': 'Google Chrome',
                    'EdgiOS': 'Microsoft Edge',
                    'FxiOS': 'Mozilla Firefox',
                    'Version': 'Apple Safari',
                };
                let brand = identBrandMap[m2[1]];
                fullVersionList.push({ brand, version: padVersion(m2[2]) });
                if (items.findIndex((s) => s.startsWith('Safari/')) === -1) {
                    webview = true;
                }
            }
        } else if ((m = /Firefox\/(\d+(\.\d+)*)/.exec(versionInfo)) !== null) {
            fullVersionList.push({ brand: 'Firefox', version: padVersion(m[1]) });
        } else if ((m = /(MSIE |rv:)(\d+\.\d+)/.exec(platformInfo)) !== null) {
            fullVersionList.push({ brand: 'Internet Explorer', version: padVersion(m[2]) });
        } else {
            fullVersionList.push(notABrand);
        }
        uaFullVersion = fullVersionList.length > 0 ? fullVersionList[fullVersionList.length - 1] : '';
        let brands = fullVersionList.map((b) => {
            let pos = b.version.indexOf('.');
            let version = pos === -1 ? b.version : b.version.slice(0, pos);
            return { brand: b.brand, version };
        });
        // TODO detect architecture, bitness and model
        return {
            mobile,
            platform,
            brands,
            platformVersion,
            architecture,
            bitness,
            model,
            uaFullVersion,
            fullVersionList,
            webview
        };
    }

    function parseArch(arch) {
        switch (arch) {
            case 'x86_64':
            case 'x64':
                return ['x86', '64'];
            case 'x86_32':
            case 'x86':
                return ['x86', ''];
            case 'armv6l':
            case 'armv7l':
            case 'armv8l':
                return [arch, ''];
            case 'aarch64':
                return ['arm', '64'];
            default:
                return ['', ''];
        }
    }
    function padVersion(ver, minSegs = 3) {
        let parts = ver.split('.');
        let len = parts.length;
        if (len < minSegs) {
            for (let i = 0, lenToPad = minSegs - len; i < lenToPad; i += 1) {
                parts.push('0');
            }
            return parts.join('.');
        }
        return ver;
    }

    class NavigatorUAData {
        constructor() {
            this._ch = getClientHints(navigator);
            Object.defineProperties(this, {
                _ch: { enumerable: false },
            });
        }
        get mobile() {
            return this._ch.mobile;
        }
        get platform() {
            return this._ch.platform;
        }
        get brands() {
            return this._ch.brands;
        }
        getHighEntropyValues(hints) {
            return new Promise((resolve, reject) => {
                if (!Array.isArray(hints)) {
                    throw new TypeError('argument hints is not an array');
                }
                let hintSet = new Set(hints);
                let data = this._ch;
                let obj = {
                    mobile: data.mobile,
                    platform: data.platform,
                    brands: data.brands,
                };
                if (hintSet.has('architecture'))
                    obj.architecture = data.architecture;
                if (hintSet.has('bitness'))
                    obj.bitness = data.bitness;
                if (hintSet.has('model'))
                    obj.model = data.model;
                if (hintSet.has('platformVersion'))
                    obj.platformVersion = data.platformVersion;
                if (hintSet.has('uaFullVersion'))
                    obj.uaFullVersion = data.uaFullVersion;
                if (hintSet.has('fullVersionList'))
                    obj.fullVersionList = data.fullVersionList;
                resolve(obj);
            });
        }
        toJSON() {
            let data = this._ch;
            return {
                mobile: data.mobile,
                brands: data.brands,
            };
        }
    }
    Object.defineProperty(NavigatorUAData.prototype, Symbol.toStringTag, {
        enumerable: false,
        configurable: true,
        writable: false,
        value: 'NavigatorUAData'
    });

    function ponyfill() {
        return new NavigatorUAData(navigator);
    }
    function polyfill() {
        console.log("Try polyfill .  .  .");

        // When Notion , no need https?
        const ____use_https = false;

        if (
            (!____use_https || location.protocol === 'https:')
            && !navigator.userAgentData
        ) {
            console.log("Here,begin userAgentData polyfill .  .  .")
            let userAgentData = new NavigatorUAData(navigator);
            Object.defineProperty(Navigator.prototype, 'userAgentData', {
                enumerable: true,
                configurable: true,
                get: function getUseAgentData() {
                    return userAgentData;
                }
            });
            Object.defineProperty(window, 'NavigatorUAData', {
                enumerable: false,
                configurable: true,
                writable: true,
                value: NavigatorUAData
            });
            return true;
        }
        return false;
    }


    // Simple Apply this code.
    ponyfill();
    polyfill();
})();

const RPC = require('discord-rpc');


const client = new RPC.Client({ transport: 'ipc' });
const rpcOpt = {
  details: `Currently working (I guess ?)`,
  state: `In a certain workspace`,
  startTimestamp: new Date(),
  largeImageKey: `logo`,
  
  
};

client.on('ready', () => {
  client.setActivity(rpcOpt);
  console.log(`Client ready 👍`);
});

window.addEventListener('DOMContentLoaded', () => {
  client.login({ clientId: "1185302959903486026" });
});

var oldTitle = document.title;
var oldWorkspace = "";
var modified = false;

window.setInterval(function(){
    if (document.title !== oldTitle){
      rpcOpt.details = `Currently working on ${document.title}`;
      modified = true;
    }
    oldTitle = document.title;

    try {
      var newWorkspace = document.querySelector("#notion-app").querySelector("div").querySelector("div").querySelector("div").querySelector("div").querySelector("div").querySelector("div").querySelectorAll(".notranslate")[1].querySelector("div").querySelector("div").textContent;
    } catch (e) {
      var newWorkspace = "";
    }
    if (newWorkspace !== null && newWorkspace !== oldWorkspace){
      rpcOpt.state = `In ${newWorkspace}`;
      modified = true;
    }
    oldWorkspace = newWorkspace;

    if (modified){
      modified = false;
      client.setActivity(rpcOpt);
    }
}, 100);
