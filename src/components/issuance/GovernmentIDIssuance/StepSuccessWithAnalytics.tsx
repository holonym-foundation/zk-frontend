import { useEffect } from "react";
import StepSuccess from "../StepSuccess";
import { datadogLogs } from "@datadog/browser-logs";

const StepSuccessWithAnalytics = () => {
  useEffect(() => {
    try {
      datadogLogs.logger.info("SuccGovID", {});
      // @ts-ignore
      window.fathom.trackGoal("MTH0I1KJ", -1.38);
    } catch (err) {
      console.log(err);
    }
  }, []);
  return <StepSuccess />;
};

export default StepSuccessWithAnalytics;
