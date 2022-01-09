// Initialize the demo on install
chrome.runtime.onInstalled.addListener((reason) => {
  if (reason !== chrome.runtime.OnInstalledReason.INSTALL) { return }

  openDemoTab();
});

chrome.action.onClicked.addListener(openDemoTab);

function openDemoTab() {
  chrome.tabs.create({ url: 'editor/editor.html' });
}

/*
let searchLibrary;
chrome.storage.onChanged.addListener((changes, area) => {
  if(area === 'sync' && changes.options?.newValue) {
    chrome.storage.suy
  }
});*/

function constructSiteSearch(sites) {
  let searches = [];
  for(const s in sites) {
    searches.push("site:"+s);
  }
  return " AND (" + searches.join(" OR ") + ")";
}

// Should be background cached instead of parsed every time
chrome.omnibox.onInputEntered.addListener((text) => {
  console.log("OnInputEntered.");
  // Encode user input for special characters , / ? : @ & = + $ #
  chrome.storage.sync.get(["library"], function(result){
    console.log("In storage get.");
    let parts = text.split(" ");
    let key = parts.shift();
    if(key in result.library) {
      let search = parts.join(" ") + constructSiteSearch(result.library[key]);
      var newURL = 'https://www.google.com/search?q=' + encodeURIComponent(search);
      chrome.tabs.create({ url: newURL });
    }
    else {
      let search = key + " " + parts.join(" ");
      var newURL = 'https://www.google.com/search?q=' + encodeURIComponent(search);
      chrome.tabs.create({ url: newURL });
    }
  });
});