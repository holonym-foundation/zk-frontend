declare module "snarkjs" {
  export const groth16: any;
}

declare module "react-step-progress-bar" {
  interface ProgressBarProps {
    percent?: number;
    filledBackground?: any;
    width?: string | number;
    height?: string | number;
    stepPositions?: number;
    children?: any;
  }

  interface StepProps {
    transition?: any;
    position?: any;
    children?: any;
  }
  class ProgressBar extends React.Component<ProgressBarProps, any> {}
  class Step extends React.Component<StepProps, any> {}
}
