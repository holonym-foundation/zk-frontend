import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import useSniffedIPAndCountry from "./hooks/useSniffedIPAndCountry";
import Navbar from "./components/atoms/Navbar";
import ToastyBugReportCard from "./components/atoms/ToastyBugReportCard";
import NewHolonymReminder from "./components/atoms/NewHolonymReminder";
import AnnouncementModal from "./components/AnnouncementModal";
import { sha1String } from "./utils/misc";

export function Layout({ children }: { children: React.ReactNode }) {
  const [announcementIsVisible, setAnnouncementIsVisible] = useState(false)

  const { data: ipAndCountry } = useSniffedIPAndCountry();

  const [showNewHolonymAnnouncement, setShowNewHolonymAnnouncement] = useState(false);

  useEffect(() => {
    async function func() {
      if (!ipAndCountry?.ip) {
        return
      }

      // If hash(ip) mod 10 === 0, show the announcement
      const digest = "0x" + (await sha1String(ipAndCountry.ip));
      const result = ethers.BigNumber.from(digest).mod(10).toNumber();
      if ([0, 1, 2, 3].includes(result)) {
        setShowNewHolonymAnnouncement(true);
      } else {
        // (For devs) If localStorage has the key "showNewHolonymAnnouncement", show the announcement
        try {
          if (window.localStorage.getItem("showNewHolonymAnnouncement") === "true") {
            setShowNewHolonymAnnouncement(true);
          }
        } catch (err) {
          // do nothing
        }
      }
    }
    func().catch(console.error)
  }, [ipAndCountry])

  return (
    <div className="x-section bg-img">
      <div className="x-container nav">
        <Navbar />
      </div>
      <div className="App x-section wf-section">
        <div className="x-container nav w-container">
          {showNewHolonymAnnouncement && (
            <AnnouncementModal 
              isVisible={announcementIsVisible}
              setIsVisible={setAnnouncementIsVisible}
            />
          )}
          {children}
        </div>
      </div>
      <ToastyBugReportCard />
      {showNewHolonymAnnouncement && (
        <NewHolonymReminder onClick={() => setAnnouncementIsVisible(true)} />
      )}
      {/* <Footer /> */}
    </div>
  );
}
