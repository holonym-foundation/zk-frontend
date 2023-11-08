import React from "react";
import "../../vouched-css-customization.css";
// import "react-phone-number-input/style.css";
import RoundedWindow from "../RoundedWindow";
import Progress from "../atoms/progress-bar";

const IssuanceContainer = ({
  steps,
  currentIdx,
  children,
}: {
  steps: string[];
  currentIdx: number;
  children: React.ReactNode;
}) => {
  return (
    <RoundedWindow>
      <div className="spacer-medium" />
      <Progress steps={steps} currentIdx={currentIdx} />
      <div
        style={{
          position: "relative",
          paddingTop: "100px",
          width: "100%",
          minHeight: "90%",
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </RoundedWindow>
  );
};

export default IssuanceContainer;
