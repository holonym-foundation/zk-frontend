import React from "react";

const Error = (props) => {
  return (
    <div className="bg-img x-section wf-section" style={{ width: "100vw" }}>
      <div className="x-container w-container" style={{ display: "block", marginTop: "100px" }}>
        <h3 className="h3">Error</h3>
        <div className="spacer-small" />
        <p style={{ color: "red" }}>{props.msg}</p>
        <div className="x-container w-container">
          <a className="x-button" href="/" style={{ marginRight: "20px" }}>
            Return home
          </a>
          <a className="x-button secondary" href="mailto:wtfprotocol@gmail.com">
            Email support
          </a>
        </div>
      </div>
    </div>
  );
};
export default Error;
