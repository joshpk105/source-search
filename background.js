// Initialize the demo on install
chrome.runtime.onInstalled.addListener((reason) => {
  if (reason !== chrome.runtime.OnInstalledReason.INSTALL) { return }

  openDemoTab();
});

chrome.action.onClicked.addListener(openDemoTab);

function openDemoTab() {
  chrome.tabs.create({ url: 'editor/editor.html' });
}

function constructSiteSearch(sites) {
  let searches = [];
  for(const s in sites) {
    searches.push("site:"+s);
  }
  return " AND (" + searches.join(" OR ") + ")";
}

chrome.omnibox.onInputEntered.addListener((text) => {
  // Encode user input for special characters , / ? : @ & = + $ #
  chrome.storage.synv.get(["library"], function(result){
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