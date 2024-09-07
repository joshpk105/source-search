// Initialize the demo on install
chrome.runtime.onInstalled.addListener((reason) => {
  if (reason !== chrome.runtime.OnInstalledReason.INSTALL) { return }

  openDemoTab();
});

chrome.action.onClicked.addListener(openDemoTab);

function openDemoTab() {
  chrome.tabs.create({ url: 'editor/editor.html' });
}
// Initilize new tab
let newTab = true;
chrome.storage.sync.get(["newTab"], function(result){
  //console.log("Get new tab state", result);
  if ("newTab" in result){
    newTab = result.newTab;
  } else {
    searchCache = true;
  }
});

// Initilize search engine
// This feature was eliminated by Chrome Web Store rule updates
/*
 * let searchCache = "https://www.google.com/search?q=";
chrome.storage.sync.get(["search"], function(result){
  if ("search" in result){
    searchCache = result.search;
  } else {
    searchCache = "https://www.google.com/search?q="
  }
});
*/

// Initilize library
let libraryCache = {};
chrome.storage.sync.get(["library"], function(result){
  libraryCache = result.library;
});

// Handle settings updates
chrome.storage.onChanged.addListener((changes, area) => {
  if(area === 'sync' && changes.library?.newValue) {
    libraryCache = changes.library.newValue;
  }
  /*if(area === 'sync' && changes.search?.newValue) {
    console.log("Search update");
    searchCache = changes.search.newValue;
  }*/
});

// Build the site search string
function constructSiteSearch(sites) {
  let searches = [];
  for(const s in sites) {
    searches.push("site:"+s);
  }
  return " AND (" + searches.join(" OR ") + ")";
}

// Handle search input in the omnibox
chrome.omnibox.onInputEntered.addListener((text) => {
  let parts = text.split(" ");
  let key = parts.shift();
  let search = text;
  if(key in libraryCache) {
    search = parts.join(" ") + constructSiteSearch(libraryCache[key]);
  }
  if(newTab) {
    chrome.search.query({disposition: chrome.search.NEW_TAB, text:search});
  }
  else {
    chrome.search.query({disposition: chrome.search.CURRENT_TAB, text: search});
  }
});

/* There appears to be an issue with key suggestions in chrome?
https://github.com/cpv123/github-go-chrome-extension/pull/3
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  let parts = text.split(" ");
  if(parts[0].length == 0) {
    return suggest;
  }
  console.log("Omni suggest: ", parts[0]);
  let suggestedKeys = [];
  for(const k in libraryCache) {
    console.log("Test Key: ", k);
    if(k.startsWith(parts[0])){
      suggestedKeys.push({content: k, description: "one"});
    }
  }
  suggest(suggestedKeys);
});
*/
