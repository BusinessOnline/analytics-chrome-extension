Marketing Health Check
==========================

A marketing tool for getting a quick health check of a url with in one of your Google Analytics accounts. Displays basic page analytics, SEO and PPC metrics.

**Chrome Extension ID**: iacadekapgbcjdccndnaejkgcoiojchp

---

## SEO Metrics

- Average Time on page
- Page Views
- Bounce Rate

## PPC Metrics

- Can I show conversion?

## Analytics Metrics

- ???


----


### Feature Wish List

- Page action badge showing data is available.
- Message passing for notifying when metrics are available for current page
- ~~Date picker to set `start-date` and `end-date` query parameters~~


### Bugz

- After loading a pageAction changing tabs keeps the old tab data
- ~~If the token expires and the extension hasn't been reloaded then the re-authorize button doesn't appear.~~
- After loading a profile with data when a new profile is loaded that doesn't contain data the metrics remain from the old profile.


### Resources

##### Javascript API
- [Google JavaScript API](https://code.google.com/p/google-api-javascript-client/)
- [Google Javascript API: Docs](https://developers.google.com/api-client-library/javascript/)
- [Google Javascript API: Reference Docs](https://developers.google.com/api-client-library/javascript/reference/referencedocs)


##### Google Analytics
- [Google API Explorer](https://developers.google.com/apis-explorer/#p/)
- [Google Analytics Query Explorer](http://ga-dev-tools.appspot.com/explorer/)
- [Google Analytics Realtime Beta](https://developers.google.com/analytics/devguides/reporting/core/v3/changelog)
- [Google API Manager](https://code.google.com/apis/console/)
- [Chrome Extension Documentation](http://developer.chrome.com/extensions/getstarted.html)



### Release Notes


#### v0.4.x

- Adding new icons for Chrome web store: 0.4.2
- Fixing manifest versioning: 0.4.1
- Added date range picker feature
- refactored `popup.js` to a moduel pattern
- Fixed re-authorize not appearing when a query returns a 401 error.
- Removed Zeptojs library dependency

#### v0.0.3

- Fixed the GA api being hit to fast and receiving 401 errors bug.
- Added `logArgs` function to clean up log calls.
- Query date range now defaults to last 30days.

#### v0.0.2

- Displaying SEO metrics.

#### v0.0.1

- Currently in alpha. It is at a working chrome extension state.