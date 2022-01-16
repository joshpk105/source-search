// Initialize the demo on install
chrome.runtime.onInstalled.addListener((reason) => {
  if (reason !== chrome.runtime.OnInstalledReason.INSTALL) { return }

  openDemoTab();
});

chrome.action.onClicked.addListener(openDemoTab);

function openDemoTab() {
  chrome.tabs.create({ url: 'editor/editor.html' });
}

let libraryCache = {};
chrome.storage.sync.get(["library"], function(result){
  console.log("Init libraryCache");
  libraryCache = result.library;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if(area === 'sync' && changes.library?.newValue) {
    libraryCache = changes.library;
  }
});

function constructSiteSearch(sites) {
  let searches = [];
  for(const s in sites) {
    searches.push("site:"+s);
  }
  return " AND (" + searches.join(" OR ") + ")";
}

chrome.omnibox.onInputEntered.addListener((text) => {
  console.log("OnInputEntered.");
  let parts = text.split(" ");
  let key = parts.shift();
  if(key in libraryCache) {
    let search = parts.join(" ") + constructSiteSearch(libraryCache[key]);
    var newURL = 'https://www.google.com/search?q=' + encodeURIComponent(search);
    chrome.tabs.create({ url: newURL });
  }
  else {
    let search = key + " " + parts.join(" ");
    var newURL = 'https://www.google.com/search?q=' + encodeURIComponent(search);
    chrome.tabs.create({ url: newURL });
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