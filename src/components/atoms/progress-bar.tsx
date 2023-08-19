import React from "react";
import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";

const Container = ({ idx, text }: { idx: number; text: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
    }}
  >
    <span style={{ position: "relative" }} className="progress-bar-item">
      <a
        // @ts-ignore
        href={() => false}
        style={{ fontFamily: "Montserrat" }}
      >
        {idx + 1}
      </a>
    </span>
    <h5 style={{ position: "absolute", bottom: "-40px" }}>{text}</h5>
  </div>
);

const Progress = ({
  steps,
  currentIdx,
}: {
  steps: string[];
  currentIdx: number;
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ProgressBar
        width="80%"
        percent={(100 * currentIdx) / (steps.length - 1)}
        filledBackground="linear-gradient(to right, rgb(106,148,223), rgb(64, 124, 104))"
      >
        {steps.map((step, idx) => (
          <Step key={step} transition="scale">
            {({ accomplished }: { accomplished: any }) => (
              <Container idx={idx} text={step} />
            )}
          </Step>
        ))}
      </ProgressBar>
    </div>
  );
};
export default Progress;
