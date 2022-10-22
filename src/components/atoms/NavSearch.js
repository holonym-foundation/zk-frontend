import searchIcon from "../../img/search_white_24dp.svg";
import { useState } from "react";
// import { Lookup } from "../lookup.js";
import { useNavigate } from "react-router-dom";

const NavSearchButton = (props) => {
  const navigate = useNavigate();
  return <div className="w-inline-block small-center" style={{ position: "absolute", top:"0px", marginLeft: "30px", maxHeight: "64px" }}>
    <div onClick={()=>navigate('/lookup')} className="wallet-connected">
      <img src={searchIcon} loading="lazy" alt="" className="wallet-icon" />
      {/* <div onClick={props.handleClick} className="wallet-text" style={{opacity:"0.5"}}>Search Holos</div> */}
      <div className="wallet-text mobile-hidden" style={{opacity:"0.5"}}>Search Holos</div>
    </div>
  </div>
}

const NavSearch = ()=> {
  const [clicked, setClicked] = useState(false)
  return <NavSearchButton />
  // return (clicked ? <Lookup />: <NavSearchButton handleClick={()=>setClicked(!clicked)} />)
}
export default NavSearch;