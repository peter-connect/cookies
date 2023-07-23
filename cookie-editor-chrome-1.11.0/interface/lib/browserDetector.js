function BrowserDetector() {
    'use strict';
    let namespace = chrome || window.browser || window.chrome;
    let browserName;
    let doesSupportSameSiteCookie = null;
    let isIos = false;
    let supportPromises = false;

    try {
        supportPromises = namespace.runtime.getPlatformInfo() instanceof Promise;
    }
    catch (e) {
    }

    if (namespace === chrome || namespace === window.chrome) {
        if (supportPromises) {
            browserName = 'chrome';
        }
        else {
            browserName = 'chrome';
        }
    } else if (namespace === window.browser) {
        if (supportPromises) {
            browserName = 'firefox';
        }
        else {
            browserName = 'edge';
        }
    }

    

    this.getApi = function () {
        return namespace;
    };

    this.isFirefox = function () {
        return browserName === 'firefox';
    };

    this.isChrome = function () {
        return browserName === 'chrome';
    };

    this.isEdge = function () {
        return browserName === 'edge';
    };

    this.isSafari = function () {
        return browserName === 'safari';
    };

    this.supportsPromises = function () {
        return this.supportPromises;
    }

    this.getBrowserName = function () {
        return browserName;
    }

    this.supportSameSiteCookie = function () {
        if (doesSupportSameSiteCookie !== null) {
            return doesSupportSameSiteCookie;
        }

        const newCookie = {
            url: 'https://example.com/',
            name: 'testSameSite',
            value: 'someValue',
            sameSite: 'strict',
        };

        try {
            if (this.isFirefox()) {
                this.getApi().cookies.set(newCookie).then(cookie => {
                    doesSupportSameSiteCookie = true;
                }, error => {
                    
                    doesSupportSameSiteCookie = false;
                });
            } else {
                this.getApi().cookies.set(newCookie, (cookieResponse) => {
                    let error = this.getApi().runtime.lastError;
                    if (!cookieResponse || error) {
                        
                        doesSupportSameSiteCookie = false;
                        return;
                    }
                    doesSupportSameSiteCookie = true;
                });
            }
        } catch(e) {
            doesSupportSameSiteCookie = false;
        }

        return doesSupportSameSiteCookie;
    }

    // We call it right away to make sure the value of doesSupportSameSiteCookie is initialized
    this.supportSameSiteCookie();
}
