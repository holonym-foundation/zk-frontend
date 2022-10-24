import React from "react";
import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";

const Container = ({children}) => 
    <span style ={{
        height: "60px",
        width: "60px",
        backgroundColor: "black",
        border: "1px solid white",
        borderRadius: "30%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {children}
    </span>

const Item = ({text}) => <>


        </>
    // <Step transition="scale">
    //   {({ accomplished }) => (
    //     // <p style={{width:"30%"}}>{text}</p> //<Container>Hey</Container>
        
    //     <img
    //       style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
    //       width="30"
    //       src="https://vignette.wikia.nocookie.net/pkmnshuffle/images/9/9d/Pichu.png/revision/latest?cb=20170407222851"
    //     />
    //   )}
    // </Step>
const Progress = ({steps, currentIdx}) => {
    return <ProgressBar
    percent={100 * currentIdx / (steps.length - 1)}
    filledBackground="linear-gradient(to right, rgb(106,148,223), rgb(64, 124, 104))"
  >
    {steps.map((step, idx) => (
        <Step transition="scale">
        {({ accomplished }) => (
          <Container>{idx+1}</Container>
        )}
      </Step>
    ))}
    {/* <Step transition="scale">
          {({ accomplished }) => (
            <img
              style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
              width="30"
              src="https://vignette.wikia.nocookie.net/pkmnshuffle/images/9/9d/Pichu.png/revision/latest?cb=20170407222851"
            />
          )}
        </Step>
        <Step transition="scale">
          {({ accomplished }) => (
            <img
              style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
              width="30"
              src="https://vignette.wikia.nocookie.net/pkmnshuffle/images/9/97/Pikachu_%28Smiling%29.png/revision/latest?cb=20170410234508"
            />
          )}
        </Step>
        <Step transition="scale">
          {({ accomplished }) => (
            <img
              style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
              width="30"
              src="https://orig00.deviantart.net/493a/f/2017/095/5/4/raichu_icon_by_pokemonshuffle_icons-db4ryym.png"
            />
          )}
        </Step> */}
  </ProgressBar>
}
export default Progress;