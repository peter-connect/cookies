
function GenericStorageHandler() {
    'use strict';
    Event.call(this);
    
    const browserDetector = new BrowserDetector();

    this.getLocal = function (key, callback) {
        if (browserDetector.supportsPromises()) {
            browserDetector.getApi().storage.local.get([key]).then((data) => {
                if (callback) {
                    callback(null, data[key] ?? null);
                }
            }, error => {
                
                if (callback) {
                    callback(error.message, null);
                }
            });
        } else {
            browserDetector.getApi().storage.local.get([key], (data) => {
                let error = browserDetector.getApi().runtime.lastError;
                if (error) {
                    
                    if (callback) {
                        let errorMessage = (error ? error.message : '') || 'Unknown error';
                        return callback(errorMessage, data);
                    }
                    return;
                }

                if (callback) {
                    return callback(null, data[key] ?? null);
                }
            });
        }
    };

    this.setLocal = function (key, data, callback) {
        let dataObj = {};
        dataObj[key] = data;

        if (browserDetector.supportsPromises()) {
            browserDetector.getApi().storage.local.set(dataObj).then(() => {
                if (callback) {
                    callback();
                }
            }, error => {
                
                if (callback) {
                    callback(error.message);
                }
            });
        } else {
            browserDetector.getApi().storage.local.set(dataObj, () => {
                let error = browserDetector.getApi().runtime.lastError;
                if (error) {
                    
                    if (callback) {
                        let errorMessage = (error ? error.message : '') || 'Unknown error';
                        return callback(errorMessage);
                    }
                    return;
                }

                if (callback) {
                    return callback(null);
                }
            });
        }
    };
}