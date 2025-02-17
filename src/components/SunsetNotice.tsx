import RoundedWindow from "./RoundedWindow";

export default function SunsetNotice() {
  return (
    <RoundedWindow>
      <div
        className="x-wrapper small-center"
        style={{ height: "95%", width: "80%" }}
      >
        <h1>Holonym has moved!</h1>
        {/* <h5 className="h5">Holonym is now Human ID</h5> */}

        <a 
          style={{ fontSize: '20px' }}
          className="in-text-link" 
          href="https://silksecure.net/holonym/diff-wallet" 
          target="_blank" 
          rel="noreferrer"
        >
          Verify now with the new Holonym
        </a>

      </div>
    </RoundedWindow>
  );
}
