import React from 'react';
import classNames from 'classnames';
import useSessionStorage from '../../hooks/useSessionStorage';

export default function ToastyBugReportCard() {
  const [showCard, setShowCard] = useSessionStorage('showToastyBugReportCard', true);

  const cardClasses = classNames({
    'toasty-bug-report-card': true,
    'toasty-bug-report-card--hide': !showCard,
  });

  return (
    <div className="toasty-bug-report-card-container" >
      {showCard ? (
        <div className={cardClasses}>
          <p style={{ fontSize: "1.5rem", fontFamily: "Clover Regular" }}>Experiencing bugs?</p>
          <p>Open a ticket in the{" "}
            <a href="https://discord.gg/aJ8fgYzxmc" target="_blank" rel="noreferrer" className="in-text-link">
              #support-tickets
            </a>{" "}
            channel in the Holonym Discord with a description of the bug.
          </p>
          <button
            style={{
              float: 'right',
              fontSize: "1rem",
              padding: "10px",
              marginTop: "5px"
            }}
            className="x-button secondary outline"
            onClick={() => setShowCard(false)}
          >
            Close
          </button>
        </div>
      ) : (
        <button
          style={{ fontSize: "1rem" }}
          className="toasty-bug-report-card-open-button"
          onClick={() => setShowCard(true)}
        >
          Experiencing bugs?
        </button>
      )}
    </div>
  );
}

