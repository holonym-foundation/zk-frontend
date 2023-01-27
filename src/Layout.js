import React from "react";
import Navbar from "./components/atoms/Navbar";
import ToastyBugReportCard from "./components/atoms/ToastyBugReportCard";

export function Layout({ children }) {
  return (
    <div className="x-section bg-img">
      <div className="x-container nav">
        <Navbar />
      </div>
      <div className="App x-section wf-section">
        <div className="x-container nav w-container">
          {children}
        </div>
      </div>
      <ToastyBugReportCard />
      {/* <Footer /> */}
    </div>
  );
}
