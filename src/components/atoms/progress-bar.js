import React from "react";
import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";

const Container = ({idx, text}) => 
  <div style={{display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
    <span style={{position:"relative"}} className="progress-bar-item">
        <a style={{"fontFamily" : "Montserrat"}}>{idx+1}</a>
    </span>
    <h4 style={{position:"absolute", top:"5vh"}}>{text}</h4>
</div>

const Progress = ({steps, currentIdx}) => {
    return <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
    <ProgressBar width="80%"
      percent={100 * currentIdx / (steps.length - 1)}
      filledBackground="linear-gradient(to right, rgb(106,148,223), rgb(64, 124, 104))"
    >
    {steps.map((step, idx) => (
        <Step transition="scale">
        {({ accomplished }) => (
          <Container idx={idx} text={step}></Container>
        )}
      </Step>
    ))}
  </ProgressBar>
  </div>
}
export default Progress;