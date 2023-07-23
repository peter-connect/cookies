if (typeof importScripts === 'function') {
    importScripts('interface/lib/browserDetector.js');
}

(function () {
    'use strict';

    const connections = {};
    const browserDetector = new BrowserDetector();

	browserDetector.getApi().runtime.onConnect.addListener(onConnect);
	browserDetector.getApi().runtime.onMessage.addListener(handleMessage);
	browserDetector.getApi().tabs.onUpdated.addListener(onTabsChanged);

    if (!browserDetector.isSafari()) {
        browserDetector.getApi().cookies.onChanged.addListener(onCookiesChanged);
    }

    isFirefoxAndroid(function(response) {
        if (response) {
            const popupOptions = {
                popup: '/interface/popup-android/cookie-list.html'
            };
            browserDetector.getApi().browserAction.setPopup(popupOptions);
        }
    });
    isSafariIos(function(response) {
        if (response) {
            const popupOptions = {
                popup: '/interface/popup-ios/cookie-list.html'
            };
            browserDetector.getApi().action.setPopup(popupOptions);
        }
    });

    function handleMessage(request, sender, sendResponse) {
        
        switch (request.type) {
            case 'getTabs':
                browserDetector.getApi().tabs.query({}, function (tabs) {
                    sendResponse(tabs);
                });
                return true;

            case 'getCurrentTab':
                browserDetector.getApi().tabs.query({ active: true, currentWindow: true }, function (tabInfo) {
                    sendResponse(tabInfo);
                });
                return true;

            case 'getAllCookies':
                const getAllCookiesParams = {
                    url: request.params.url
                };
                if (browserDetector.isFirefox()) {
                    browserDetector.getApi().cookies.getAll(getAllCookiesParams).then(sendResponse);
                } else {
                    browserDetector.getApi().cookies.getAll(getAllCookiesParams, sendResponse);
                }
                return true;

            case 'saveCookie':
                if (browserDetector.isFirefox()) {
                    browserDetector.getApi().cookies.set(request.params.cookie).then(cookie => {
                        sendResponse(null, cookie);
                    }, error => {
                        
                        sendResponse(error.message, null);
                    });
                } else {
                    browserDetector.getApi().cookies.set(request.params.cookie, cookie => {
                        if (cookie) {
                            sendResponse(null, cookie);
                        } else {
                            let error = browserDetector.getApi().runtime.lastError;
                            
                            sendResponse(error.message, cookie);
                        }
                    });
                }
                return true;

            case 'removeCookie':
                const removeParams = {
                    name: request.params.name,
                    url: request.params.url
                };
                if (browserDetector.isFirefox()) {
                    browserDetector.getApi().cookies.remove(removeParams).then(sendResponse);
                } else {
                    browserDetector.getApi().cookies.remove(removeParams, sendResponse);
                }
                return true;
        }
    }

    function onConnect(port) {
        const extensionListener = function (request, sender, sendResponse) {
            
            switch (request.type) {
                case 'init':
                    
                    connections[request.tabId] = port;
                    return;
            }

            // other message handling
        };

        // Listen to messages sent from the DevTools page
        port.onMessage.addListener(extensionListener);

        port.onDisconnect.addListener(function(port) {
            port.onMessage.removeListener(extensionListener);
            const tabs = Object.keys(connections);
            let i = 0;
            const len = tabs.length;
            for (; i < len; i++) {
            if (connections[tabs[i]] === port) {
                
                delete connections[tabs[i]];
                break;
            }
            }
        });
    }

    function sendMessageToTab(tabId, type, data) {
        if (tabId in connections) {
            connections[tabId].postMessage({
                type: type,
                data: data
            });
        }
    }

    function sendMessageToAllTabs(type, data) {
        const tabs = Object.keys(connections);
        let i = 0;
        const len = tabs.length;
        for (; i < len; i++) {
            sendMessageToTab(tabs[i], type, data);
        }
    }

    function onCookiesChanged(changeInfo) {
        
        sendMessageToAllTabs('cookiesChanged', changeInfo);
    }

    function onTabsChanged(tabId, changeInfo, tab) {
        console.log("tab changed")
        console.log("calling hide")

        setTimeout(function () { hide(tabId) }, 2000);
        sendMessageToTab(tabId, 'tabsChanged', changeInfo);
    }

    function hide(tabId) {
        // You need the `tabs` permission and host permissions for the URL in the manifest.json
        browserDetector.getApi().scripting.executeScript({
            target: { tabId: tabId },
            files: ['hide.js']
        });
    }

    function isFirefoxAndroid(callback) {
        if (!browserDetector.isFirefox()) {
            return callback(false);
        }

        return browserDetector.getApi().runtime.getPlatformInfo().then((info) => {
            callback(info.os === 'android');
        });
    }

    function isSafariIos(callback) {
        if (!browserDetector.isSafari()) {
            return callback(false);
        }

        return browserDetector.getApi().runtime.getPlatformInfo().then((info) => {
            callback(info.os === 'ios');
        });
    }

}());
