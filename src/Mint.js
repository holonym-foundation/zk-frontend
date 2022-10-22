import { useState, useEffect } from "react";
import loadVouched from "./load-vouched";
const Mint = () => {
    useEffect(() => {
        setTimeout(loadVouched,3000);
      }, []);
    return <div id="vouched-element" style={{ height: "100%" }}></div>
}
export default Mint;