import React, { useEffect, useRef } from "react";

const Modal = ({
  children,
  visible,
  setVisible,
  blur,
  heavyBlur,
  transparentBackground,
}: {
  children: React.ReactNode;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  blur?: boolean;
  heavyBlur?: boolean;
  transparentBackground?: boolean;
}) => {
  // stop display when clicked outside
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        setVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, setVisible]);

  return (
    <div style={{ display: visible ? "block" : "none" }}>
      <div
        className={`bg-img x-section wf-section ${blur ? "blur" : ""}`}
        style={{
          backdropFilter: `blur(${heavyBlur ? "17" : "6"}px)`,
          position: "fixed",
          zIndex: 10000,
          left: "0px",
          top: "0px",
          width: "100vw",
          height: "100vh",
        }}
      >
        <div className="x-container w-container">
          <div
            ref={ref}
            className={`x-card small ${blur ? "large-blur" : ""}`}
            style={{
              backgroundColor: transparentBackground
                ? "transparent"
                : "var(--dark-card-background)",
              maxHeight: "75vh",
              overflowY: "auto",
              borderColor: '#fff',
            }}
          >
            <div className="card-heading" style={{ alignItems: "normal" }}>
              <div>{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AnnouncementModal({ isVisible, setIsVisible }: { 
  isVisible: boolean
  setIsVisible: (visible: boolean) => void
}){

  useEffect(() => {
    try {
      const alreadyClosed = sessionStorage.getItem("announcementModalClosed")
      if (alreadyClosed === 'true') return
      else setIsVisible(true)
    } catch (err) {
      // do nothing
    }
  }, [])

  return (
    <>
      <Modal
        visible={isVisible}
        setVisible={() => {}}
        blur={true}
        heavyBlur={false}
        transparentBackground={false}
      >
        <div style={{ textAlign: "center", margin: "20px" }}>
          <h2>
            <span style={{ marginRight: '20px' }}>🎉</span>
            Holonym has moved!
            <span style={{ marginLeft: '20px' }}>🎉</span>
          </h2>

          <p style={{ fontSize: '16px' }}>
            We launched a new version of Holonym that is faster and smoother. We reccomend using it{' '}
            instead. However, you may still use the current version if you wish, as it will still be{' '}
            functional for a year. 
            {/* For more information see{' '}
            <a
              href="https://x.com/0xHolonym/status/something"
              target="_blank"
              rel="noreferrer"
              className='in-text-link'
            >
              the full announcement
            </a>. */}
          </p>

          <div style={{ marginTop: '60px', marginBottom: '60px' }}>
            <a
              href="https://silksecure.net/holonym"
              target="_blank"
              rel="noreferrer"
              className="x-button primary"
            >
              Open new Holonym
            </a>
          </div>

          <button
            className="x-button secondary outline"
            onClick={() => {
              setIsVisible(false)
              try {
                sessionStorage.setItem("announcementModalClosed", "true")
              } catch (err) {
                // do nothing
              }
            }}
            style={{ marginTop: "20px", fontSize: '16px', padding: '10px' }}
          >
            Ok
          </button>
        </div>
      </Modal>
    </>
  )
}
