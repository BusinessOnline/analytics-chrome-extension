/**
 * Analytics Preview
 * @author  Stuart Runyan
 * @copyright 2013 BusinessOnline
 *
 * Google Analytics JavaScript API
 * @required https://code.google.com/p/google-api-javascript-client/
 *
 * Chrome Extensions
 * @see  http://developer.chrome.com/extensions/getstarted.html
 */

var ext = {
    auth: {},
    debug: true,
    resp: {},
    profiles: [],
    profileNameOptions: "",

    /**
     * [checkAuth Check if user has been authorized]
     * @param  {Function} callback Code to fire after authorization
     * @see  https://developers.google.com/analytics/solutions/articles/hello-analytics-api#query_profile
     */
    checkAuth: function (callback) {
        if(ext.debug) {ext.logArgs([Array.prototype.slice.call(arguments)], 'Background->checkAuth: Parameters');}

        gapi.auth.authorize({
            client_id: config.clientId,
            scope: config.scope,
            immediate: true
        }, function (auth) {
            ext.loadClient(auth, callback);
        });
    },

    /**
     * [loadClient description]
     * @param  {[type]}   auth     [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    loadClient: function (auth, callback) {
        if(ext.debug) {ext.logArgs([Array.prototype.slice.call(arguments)], 'Background->loadClient: Parameters');}

        if (auth) {
            ext.auth = auth;
            gapi.auth.setToken(auth);
            gapi.client.load('analytics', 'v3', function (resp) {

                /*
                If the token expires and the extension hasn't been reloaded it gives an 401 response code
                {code: 401, message: "Login Required", data: Array[1], error: Object}
                TODO: solve for this response and show auth button.
                 */
                //if(ext.debug) {ext.logArgs([Array.prototype.slice.call(arguments)], 'Background->loadClient: Auth Response');}
                callback(auth);
            });
        } else {
            ext.auth = false;
        }
    },

    /**
     * [authClick description]
     * @param  {Function} callback [description]
     */
    authClick: function (callback) {
        if(ext.debug) {ext.logArgs([Array.prototype.slice.call(arguments)], 'Background->authClick: Parameters');}
        gapi.auth.authorize({client_id: config.clientId, scope: config.scope, immediate:  false}, ext.loadClient);
    },

    /**
     * [getAccounts description]
     * @param  {Function} callback [description]
     */
    getAccounts: function (callback) {
        if(ext.debug) {ext.logArgs([Array.prototype.slice.call(arguments)], 'Background->getAccounts: Parameters');}
        gapi.client.analytics.management.accounts.list().execute(function(resp) {
            //if(ext.debug) {ext.logArgs([Array.prototype.slice.call(arguments)], 'Background->getAccounts: Auth Response');}
            callback(resp);
        });
    },

    /**
     * [getWebProperties description]
     * @param  {[]}   accounts [array of GA accounts]
     * @param  {Function} callback [code to execute with response]
     */
    getWebProperties: function (accounts, callback) {
        if(ext.debug) {ext.logArgs([Array.prototype.slice.call(arguments)], 'Background->getWebProperties: Parameters');}
        // See loop description in `getProfiles`
        // @todo abstract loop out of both `getWebProperties` and `getProfiles`
        (function myLoop (i) {
            setTimeout(function () {
                var x = i - 1; // Reduce by one so we can get to the array 0 index
                if (accounts.result.items[x] !== undefined) {
                    var account = accounts.result.items[x].id;
                    gapi.client.analytics.management.webproperties.list({'accountId': account}).execute(function (resp) {
                        //if(ext.debug) {ext.logArgs([Array.prototype.slice.call(arguments)], 'Background->getWebProperties: Auth Response');}
                        callback(resp);
                    });
                }
                if (--i) myLoop(i); //  decrement i and call myLoop again if i > 0
            }, 100);
        })(accounts.items.length);
    },

    /**
     * [getProfiles description]
     * @param  {[type]}   properties [description]
     * @param  {Function} callback   [description]
     * @return {[type]}              [description]
     */
    getProfiles: function (properties, callback) {
        if (ext.debug) {ext.logArgs([Array.prototype.slice.call(arguments)], 'Background->getProfiles: Parameters');}
        if (properties !== undefined) {
            /**
             * myLoop This function sets a timeout which prevents requesting to quickly from GA and receiving 403 errors.
             * @param  {int} i Properties variable length
             * @see http://stackoverflow.com/a/3583740
             */
            (function myLoop (i) {
                setTimeout(function () {
                    var x = i - 1; // Reduce by one so we can get to the array 0 index
                    if (properties.items[x] !== undefined) {
                        gapi.client.analytics.management.profiles.list({
                            'accountId': properties.items[x].accountId,
                            'webPropertyId': properties.items[x].id
                        }).execute(function (resp) {
                            //if(ext.debug) {ext.logArgs([Array.prototype.slice.call(arguments)], 'Background->getProfiles: Auth Response');}
                            callback(resp);
                        });
                    }
                    if (--i) myLoop(i); //  decrement i and call myLoop again if i > 0
                }, 1000); // The time to wait between next request.
            })(properties.items.length); // Set how many times we loop

        }
    },

    /**
     * [queryRealTime description]
     * @param  {[type]} profile [description]
     * @param  {[type]} metrics [description]
     * @return {[type]}         [description]
     */
    queryRealTime: function (profile, metrics) {
        if(ext.debug) {ext.logArgs([Array.prototype.slice.call(arguments)], 'Background->queryRealTime: Parameters');}
        gapi.client.analytics.data.realtime.get({
            'ids': profile,
            'metrics': metrics
        }).execute(function(resp){
            //if(ext.debug) {ext.logArgs([Array.prototype.slice.call(arguments)], 'Background->queryRealTime: Auth Response');}
        });
    },
    queryReporting: function (profile, metrics, dimensions, callback) {
        if(ext.debug) {ext.logArgs([Array.prototype.slice.call(arguments)], 'Background->queryReporting: Parameters');}

        // Defaults to last 30 days
        var today = new Date();
        var endDate = today.toISOString().split('T');
        var past = new Date(today.setDate(today.getDate() - 30));
        var startDate = past.toISOString().split('T');

        gapi.client.analytics.data.ga.get({
            'ids': profile,
            'start-date': startDate[0],
            'end-date': endDate[0],
            'metrics': metrics,
            'dimensions': dimensions
        }).execute(function (resp) {
            //if(ext.debug) {ext.logArgs([Array.prototype.slice.call(arguments)], 'Background->queryReporting: Auth Response');}
            callback(resp);
        });

    },
    logArgs: function (param, name) {
        console.log('START: '+ name);
        for (var i = 0, l = param[0].length; i < l; i++) {
            console.log(param[0][i]);
        }
        console.log('END');
    }
};


function gapiIsLoaded () {
    console.log('Extension Init');
    gapi.client.setApiKey(config.apiKey);
    ext.checkAuth(function (auth) {
        ext.getAccounts(function (accounts) {
            ext.getWebProperties(accounts, function(properties) {
                ext.getProfiles(properties, function(profile) {

                    // Capture profile information
                    ext.profiles.push(profile);

                });
            });
        });
    });
}


// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {

    //Show page action if not authed
    if (!ext.auth || ext.auth.code === 401) {
        chrome.pageAction.show(tabId);
    }

    // Reset
    ext.profileNameOptions = "";

    // Iterate Profiles
    for (var a = 0, b = ext.profiles.length; a < b; a++) {

        if (ext.profiles[a].items) {

            // Iterate Profile Items
            for (var x = 0, y = ext.profiles[a].items.length; x < y; x++) {

                // If item "websiteUrl" matches browser bar url
                if (tab.url.indexOf(ext.profiles[a].items[x].websiteUrl) > -1 ) {
                    chrome.pageAction.show(tabId);
                    // Store on Ext object
                    ext.profileNameOptions += "<option value="+ext.profiles[a].items[x].id+">"+ext.profiles[a].items[x].name+"</option>";
                }
            }
        }
    }
}


// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);
