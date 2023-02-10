import { useEffect, useRef } from "react";

export const Modal = (props) => {
  // stop display when clicked outside
  const ref = useRef(null);
  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        props.setVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref]);

  return (
    <div style={{ display: props.visible ? "block" : "none" }}>
      <div
        className={"bg-img x-section wf-section " + (props.blur ? "blur" : "")}
        style={{ position: "fixed", zIndex: 10000, left: "0px", top: "0px", width: "100vw", height: "100vh" }}
      >
        <div className="x-container w-container">
          <div ref={ref} className={"x-card small " + (props.blur ? "large-blur" : "")}>
            <div className="card-heading" style={{ alignItems: "normal" }}>
              <div>{props.children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SimpleModal = (props) => {
  // stop display when clicked outside
  const ref = useRef(null);
  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        props.setVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref]);

  return (
      <div className={"x-section bg-img " + (props.blur ? "blur" : "")} style={{ display: props.visible ? "block" : "none" , position:"absolute", top: "0px", left: "0px", width: "100vw", height: "100vh"}}>
        <div className="x-container w-container">
          <div ref={ref} className={"x-card blue-yellow " + (props.blur ? "large-blur" : "")}>
              <div>{props.children}</div>
          </div>
        </div>
      </div>
  );
};
