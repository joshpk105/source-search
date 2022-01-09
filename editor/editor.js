// Copyright 2021 Google LLC
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file or at
// https://developers.google.com/open-source/licenses/bsd
/*
const display = document.querySelector('.alarm-display');
const log = document.querySelector('.alarm-log');
const form = document.querySelector('.create-alarm');
const clearButton = document.getElementById('clear-display');
const refreshButton = document.getElementById('refresh-display');
const pad = (val, len = 2) => val.toString().padStart(len, '0');

// DOM event bindings

//// Alarm display buttons

clearButton.addEventListener('click', () => manager.cancelAllAlarms());
refreshButton.addEventListener('click', () => manager.refreshDisplay());

//// New alarm form

form.addEventListener('submit', (event) => {
  event.preventDefault();
  let formData = new FormData(form);
  let data = Object.fromEntries(formData);

  // Extract form values
  let name = data['alarm-name'];
  let delay = Number.parseFloat(data['time-value']);
  let delayFormat = data['time-format'];
  let period = Number.parseFloat(data['period']);

  // Prepare alarm info for creation call
  let alarmInfo = {};

  if (delayFormat === 'ms') {
    // Specified in milliseconds, use `when` property
    alarmInfo.when = Date.now() + delay;
  } else if (delayFormat === 'min') {
    // specified in minutes, use `delayInMinutes` property
    alarmInfo.delayInMinutes = delay;
  }

  if (period) {
    alarmInfo.periodInMinutes = period;
  }

  // Create the alarm – this uses the same signature as chrome.alarms.create
  manager.createAlarm(name, alarmInfo);
});

class SourceManager {
    constructor() {
        chrome.storage.sync.get(["library"])
    }

    displayLibrary()
}

class AlarmManager {
  constructor(display, log) {
    this.displayElement = display;
    this.logElement = log;

    this.logMessage('Manager: initializing demo');

    this.displayElement.addEventListener('click', this.handleCancelAlarm);
    chrome.alarms.onAlarm.addListener(this.handleAlarm);
  }

  logMessage(message) {
    let date = new Date();
    let pad = (val, len = 2) => val.toString().padStart(len, '0');
    let h = pad(date.getHours());
    let m = pad(date.getMinutes());
    let s = pad(date.getSeconds());
    let ms = pad(date.getMilliseconds(), 3);
    let time = `${h}:${m}:${s}.${ms}`;

    let logLine = document.createElement('div');
    logLine.textContent = `[${time}] ${message}`;

    // Log events in reverse chronological order
    this.logElement.insertBefore(logLine, this.logElement.firstChild);
  }

  handleAlarm = async (alarm) => {
    let json = JSON.stringify(alarm);
    this.logMessage(`Alarm "${alarm.name}" fired\n${json}}`);
    await this.refreshDisplay();
  }

  handleCancelAlarm = async (event) => {
    if (!event.target.classList.contains('alarm-row__cancel-button')) {
      return;
    }

    let name = event.target.parentElement.dataset.name;
    await this.cancelAlarm(name);
    await this.refreshDisplay();
  }

  async cancelAlarm(name) {
    // TODO: Remove custom promise wrapper once the Alarms API supports promises
    return new Promise((resolve) => {
      chrome.alarms.clear(name, (wasCleared) => {
        if (wasCleared) {
          this.logMessage(`Manager: canceled alarm "${name}"`);
        } else {
          this.logMessage(`Manager: could not canceled alarm "${name}"`);
        }

        resolve(wasCleared);
      });
    });
  }

  // Thin wrapper around alarms.create to log creation event
  createAlarm(name, alarmInfo) {
    chrome.alarms.create(name, alarmInfo);
    let json = JSON.stringify(alarmInfo, null, 2).replace(/\s+/g, ' ');
    this.logMessage(`Created "${name}"\n${json}`);
    this.refreshDisplay();
  }

  renderAlarm(alarm, isLast) {
    let alarmEl = document.createElement('div');
    alarmEl.classList.add('alarm-row');
    alarmEl.dataset.name = alarm.name;
    alarmEl.textContent = JSON.stringify(alarm, 0, 2) + (isLast ? '' : ',');

    let cancelButton = document.createElement('button');
    cancelButton.classList.add('alarm-row__cancel-button');
    cancelButton.textContent = 'cancel';
    alarmEl.appendChild(cancelButton);

    this.displayElement.appendChild(alarmEl);
  }

  async cancelAllAlarms() {
    // TODO: Remove custom promise wrapper once the Alarms API supports promises
    return new Promise((resolve) => {
      chrome.alarms.clearAll((wasCleared) => {
        if (wasCleared) {
          this.logMessage(`Manager: canceled all alarms"`);
        } else {
          this.logMessage(`Manager: could not canceled all alarms`);
        }

        resolve(wasCleared);
      });
    })
  }

  async populateDisplay() {
    // TODO: Remove custom promise wrapper once the Alarms API supports promises
    return new Promise((resolve) => {
      chrome.alarms.getAll((alarms) => {
        for (let [index, alarm] of alarms.entries()) {
          let isLast = index === alarms.length - 1;
          this.renderAlarm(alarm, isLast);
        }
        resolve();
      });
    });
  }

  // Simple locking mechanism to prevent multiple concurrent refreshes from rendering duplicate
  // entries in the alarms list
  #refreshing = false;

  async refreshDisplay() {
    if (this.#refreshing) { return } // refresh in progress, bail

    this.#refreshing = true;         // acquire lock
    try {
      await Promise.all([
        this.clearDisplay(),
        this.populateDisplay(),
      ]);
    } finally {
      this.#refreshing = false;      // release lock
    }
  }

  async clearDisplay() {
    this.displayElement.textContent = '';
  }
}


let manager = new AlarmManager(display, log);
manager.refreshDisplay();

chrome.storage.onChange.addListener((changes, area) => {
    console.log("Storage Change");
    if (area === 'sync' && changes.library?.newValue) {
        const debugMode = Boolean(changes.options.newValue.debug);
        console.log('Library updated: ', changes.library?.newValue);
        setDebugMode(debugMode);
      }
})

function addLibrary() {
    var lib = document.getElementById("newLibrary");
    example[lib.value] = [];
    updateTree();
}

function constructParent(key, sites) {
    var li = document.createElement("li");
    var ul = document.createElement("ul");
    li.textContent = key;
    var addButton = document.createElement("button");
    addButton.textContent = "Add";
    li.appendChild(addButton);
    var delButton = document.createElement("button");
    delButton.textContent = "Delete";
    li.appendChild(delButton);
    li.appendChild(ul);
    for(var i = 0; i < sites.length; i++) {
        var child_li = document.createElement("li");
        child_li.textContent = sites[i];
        ul.appendChild(child_li);
        var editButton = document.createElement("button");
        editButton.textContent = "Edit";
        child_li.appendChild(editButton);
        var del2Button = document.createElement("button");
        del2Button.textContent = "Delete";
        child_li.appendChild(del2Button);
    }
    return(li);
}

// For some reason this doesn't clear children correctly
// probably due to defered call?
function updateTree() {
  var ul = document.getElementById("myUL");
  console.log("Children count: ", ul.children.length);
  for (var i = 0; i < ul.children.length; i++) {
    console.log(ul.children[i]);
    ul.removeChild(ul.children[i]);
  }
  for (const [key, entry] of Object.entries(example)) {
      ul.appendChild(constructParent(key, entry));
  }
}

var example = {"src" : ["github.com"], "news" : ["npr.com","nbc.com"]};
updateTree();

var addLib = document.getElementById("addLibrary");
addLib.addEventListener('click', () => addLibrary());



*/

class Site {
  constructor(site, parent, library) {
    this.site = site;
    this.li = document.createElement("li");
    this.li.textContent = site;
    this.del = document.createElement("button");
    this.del.textContent = "Delete";
    this.li.appendChild(this.del);
    parent.appendChild(this.li);
    this.library = library;
    this.initEvents();
  }
  initEvents() {
    let self = this;
    this.del.addEventListener('click', function(){ self.removeSite(); });
  }
  removeSite() {
    this.li.parentNode.removeChild(this.li);
    this.library.removeSite(this.site);
  }
}

class Library {
  constructor(key, parent, src, sites) {
    this.src = src;
    this.key = key;
    console.log(key, sites);
    this.parent = parent;
    this.li = document.createElement("li");
    this.ul = document.createElement("ul");
    this.li.textContent = key;
    this.del = document.createElement("button");
    this.del.textContent = "Delete";
    this.li.appendChild(this.del);
    this.input = document.createElement("input",{"type": "text"});
    this.li.appendChild(this.input);
    this.add = document.createElement("button");
    this.add.textContent = "Add";
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
    this.add.addEventListener('click', function(){ self.addSite(); });
    this.del.addEventListener('click', function(){ self.deleteLibrary(); });
  }
  deleteLibrary() {
    console.log("delete", this);
    this.src.removeLibrary(this.key);
    this.parent.removeChild(this.li);
  }
  initSite(s) {
    new Site(s, this.ul, this)
  }
  addSite() {
    console.log("add", this);
    new Site(this.input.value, this.ul, this);
    this.input.value = "";
  }
  removeSite(s) {
    this.src.removeLibrarySite(this.key, s);
  }
}

class SourceEditor {
  constructor(library) {
    console.log(library);
    this.library = library;
    if(this.library == undefined) {
      this.library = {};
    }
    this.addButton = document.getElementById("addLibrary");
    this.newLibrary = document.getElementById("newLibrary");
    this.initEvents();
    for(const l in this.library) {
      new Library(l, document.body, this, this.library[l]);
    }
  }
  initEvents() {
    let self = this;
    this.addButton.addEventListener("click", function(){ self.addLibrary(); });
  }
  addLibrary() {
    this.library[this.newLibrary.value] = {};
    chrome.storage.sync.set({"library": this.library});
    new Library(this.newLibrary.value, document.body, this, []);
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
      this.library[key][site] = true;
      chrome.storage.sync.set({"library": this.library});
    }
  }
  removeLibrarySite(key, site) {
    if(key in this.library) {
      if(site in this.library[key]){
        delete this.library[key][site];
        chrome.storage.sync.set({"library": this.library});
      }
    }
  }
}

let srcEdit;
chrome.storage.sync.get(["library"], function(result){
  srcEdit = new SourceEditor(result["library"]);
});
