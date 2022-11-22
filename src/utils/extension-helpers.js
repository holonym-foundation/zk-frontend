// TODO: Remove this file?

let extensionId;
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    extensionId = process.env.REACT_APP_EXTENSION_ID || "cilbidmppfndfhjafdlngkaabddoofea";
if(!process.env.REACT_APP_EXTENSION_ID){ console.error("Warning: no extension ID specified")}
} else {
// production code
extensionId = "obhgknpelgngeabaclepndihajndjjnb";
}

// Adds a timeout to rejects a promise if it's too slow
function timeoutPromise(promise) {
    const timeout = new Promise(function(resolve, reject){
      setTimeout(function() { reject("Timed out"); }, 3000);
    });

    let race = Promise.race([
      promise,
      timeout
    ]);

    return race;
    // race.then((r)=>return r).catch(error=>console.error(error));
  }


function getExtensionIsInstalled() {
    const p = new Promise((resolve) => {
      const payload = {
        command: "holoGetIsInstalled",
      };
      const callback = (resp) => resolve(resp);
      try {
        // eslint-disable-next-line no-undef
        chrome.runtime.sendMessage(extensionId, payload, callback);
      } catch (err) {
        console.log(err)
        resolve()
      }
    });
  
    return timeoutPromise(p);
  }
  
function getIsRegistered() {
    const p = new Promise((resolve) => {
      const payload = {
        command: "holoGetIsRegistered",
      };
      const callback = (resp) => resolve(resp?.isRegistered);
      try {
        // eslint-disable-next-line no-undef
        chrome.runtime.sendMessage(extensionId, payload, callback);
      } catch (err) {
        console.log(err)
        resolve()
      }
    });
  
    return timeoutPromise(p);
  
  }
  
 export async function getExtensionState() {
    let isInstalled; let isRegistered;
    try {
      isInstalled = await getExtensionIsInstalled();
    } catch(e) {}
    
    try {
      isRegistered = await getIsRegistered();
    } catch(e) {}
  
    return {
      isInstalled : isInstalled,
      hasPassword : isRegistered,
      // hasCredentials : false, // TODO: change this when extension changes

    }
}
