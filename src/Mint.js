import { useState, useEffect } from "react";
import loadVouched from "./load-vouched";
import { getExtensionState } from "./utils/extension-helpers";

  // console.log(isInstalled, isRegistered)
  // if (!isInstalled) {
  //   document.getElementById("no-extension").style.display="block";
  // } else if (isInstalled && !isRegistered) {
  //   document.getElementById("not-registered").style.display="block";
  // } else if (isInstalled && isRegistered) {
  //   setupVouched()
  // } else {
  //   // TODO: Set error. If this happens, there's probably a bug in the extension
  // }


// Vouched element will not mount unless user 
    // (a) has extension and 
    // (b) has set their extension password
    // waitForInstalled().then(setupVouched)
    

const Mint = () => {
    getExtensionState().then(x=>console.log(x))
    useEffect(() => {
        setTimeout(loadVouched,3000);
      }, []);
    return <div id="vouched-element" style={{ height: "100%" }}></div>
}
export default Mint;