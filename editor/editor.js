// TrashButton creates the common trash button
class TrashButton {
  constructor(label, parent) {
    this.elem = document.createElement("button");
    this.elem.id = "trashButton";
    this.elem.textContent = label;
    parent.appendChild(this.elem);
  }
}

// Site handles site remove and display operations
class Site {
  constructor(site, parent, library) {
    this.site = site;
    this.li = document.createElement("li");
    this.li.textContent = site;
    this.del = new TrashButton('\uD83D\uDDD1', this.li);
    parent.appendChild(this.li);
    this.library = library;
    this.initEvents();
  }
  initEvents() {
    let self = this;
    this.del.elem.addEventListener('click', function(){ self.removeSite(); });
  }
  removeSite() {
    this.li.parentNode.removeChild(this.li);
    this.library.removeSite(this.site);
  }
}

// Library handles library/site settings operations
class Library {
  constructor(key, parent, src, sites) {
    this.req = new XMLHttpRequest();
    this.src = src;
    this.key = key;
    console.log(key, sites);
    this.parent = parent;
    this.li = document.createElement("li");
    this.ul = document.createElement("ul");
    this.label = document.createElement("strong");
    this.errorMsg = document.createElement("ul");
    this.ul.appendChild(this.errorMsg);
    this.label.textContent = key;
    this.del = new TrashButton('\uD83D\uDDD1', this.li);
    this.li.appendChild(this.label);
    this.input = document.createElement("input",{"type": "text"});
    this.li.appendChild(this.input);
    this.add = document.createElement("button");
    this.add.textContent = "Add Site";
    this.li.appendChild(this.add);
    this.li.appendChild(this.ul);
    parent.appendChild(this.li);
    this.initEvents();
    for(const s in sites) {
      this.initSite(s);
    }
  }
  initEvents() {
    let self = this;
    this.add.addEventListener('click', function(){ self.clearError(); self.addSite(); });
    this.del.elem.addEventListener('click', function(){ self.clearError(); self.deleteLibrary(); });
    this.req.addEventListener('load', function(e){ self.siteFound(e); });
    this.req.addEventListener('error', function(e){ self.siteNotFound(e); });
  }
  deleteLibrary() {
    console.log("delete", this);
    this.src.removeLibrary(this.key);
    this.parent.removeChild(this.li);
  }
  initSite(s) {
    new Site(s, this.ul, this);
  }
  clearError(){
    this.errorMsg.textContent = "";
  }
  addSite() {
    console.log("add", this);
    if(this.input.value == "") {
      return;
    }
    let query = this.input.value;
    let request = new Request(query);
    let self = this;
    fetch(request, {method: "HEAD"}).then(function(response){
      if(!response.ok) {
        self.siteNotFound();
      } else {
        self.siteFound(query);
      }
    }).catch(function(err) {
      self.siteNotFound();
    });
  }
  siteFound(site) {
    const http = /^https?:\/\//;
    site = site.replace(http, "");
    site = site.split("/")[0];
    if(this.src.addLibrarySite(this.key, site)){
      new Site(site, this.ul, this);
    }
    else {
      this.errorMsg.textContent = "Site already in library: " + site;
    }
    this.input.value = "";
  }
  siteNotFound() {
    this.errorMsg.textContent = "Site not found: " + this.input.value;
    this.input.value = "";
  }
  removeSite(s) {
    this.src.removeLibrarySite(this.key, s);
  }
}

// SourceEditor handles source-library settings operations
class SourceEditor {
  constructor(library) {
    console.log(library);
    this.library = library;
    this.libCol = document.getElementById("libraryCol");
    if(this.library == undefined) {
      this.library = {};
    }
    this.addButton = document.getElementById("addLibrary");
    this.newLibrary = document.getElementById("newLibrary");
    this.errorMsg = document.createElement("ul");
    this.libCol.appendChild(this.errorMsg);
    this.initEvents();
    for(const l in this.library) {
      console.log("Init Library", l, this.library[l]);
      new Library(l, this.libCol, this, this.library[l]);
    }
  }
  initEvents() {
    let self = this;
    this.addButton.addEventListener("click", function(){ self.clearError(); self.addLibrary(); });
  }
  addLibrary() {
    if(this.newLibrary.value == "") {
      return
    }
    if(this.newLibrary.value in this.library) {
      this.errorMsg.textContent = "Library key already exists: " + this.newLibrary.value;
      this.newLibrary.value = "";
      return
    }
    this.library[this.newLibrary.value] = {};
    chrome.storage.sync.set({"library": this.library});
    new Library(this.newLibrary.value, this.libCol, this, {});
    this.newLibrary.value = "";
  }
  removeLibrary(key) {
    if(key in this.library) {
      delete this.library[key];
      chrome.storage.sync.set({"library": this.library});
    }
  }
  addLibrarySite(key, site) {
    if(key in this.library) {
      if(site in this.library[key]) {
        return false;
      }
      this.library[key][site] = true;
      chrome.storage.sync.set({"library": this.library});
    }
    return true;
  }
  removeLibrarySite(key, site) {
    if(key in this.library) {
      if(site in this.library[key]){
        delete this.library[key][site];
        chrome.storage.sync.set({"library": this.library});
      }
    }
  }
  clearError() {
    this.errorMsg.textContent = "";
  }
}

// Object handling search engine options
class SearchEditor {
  constructor(current) {
    this.select = document.getElementById("search");
    if(current != ""){
      for(let i = 0; i < this.select.length; i++) {
        if(this.select.children[i].value == current){
          this.select.selectedIndex = i;
          break;
        }
      }
    }
    this.initEvents();
  }
  initEvents() {
    let self = this;
    this.select.addEventListener('change', function(e){ self.updateEngine(); });
  }
  updateEngine() {
    chrome.storage.sync.set({"search": this.select.value});
  }
}

// Object handling newTab option
class NewTabEditor {
  constructor(current) {
    this.checkbox = document.getElementById("newTab");
    if(current === undefined){
      this.checkbox.checked = true;
    }
    else if (current === true) {
      this.checkbox.checked = true;
    }
    else {
      this.checkbox.checked = false;
    }
    this.initEvents();
  }
  initEvents() {
    let self = this;
    this.checkbox.addEventListener('change', function(e){ self.updateEngine(); });
  }
  updateEngine() {
    chrome.storage.sync.set({"newTab": this.checkbox.checked});
  }
}

// Initilize newTab settings object
let newTabEdit;
chrome.storage.sync.get(["newTab"], function(result){
  newTabEdit = new NewTabEditor(result["newTab"]);
});

// Initilize search settings object
let searchEdit;
chrome.storage.sync.get(["search"], function(result){
  searchEdit = new SearchEditor(result["search"]);
});

// Initilize source settings object
let srcEdit;
chrome.storage.sync.get(["library"], function(result){
  srcEdit = new SourceEditor(result["library"]);
});
