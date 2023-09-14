import RoundedWindow from "./RoundedWindow";

const UnsupportedCountryPage = () => {
  return (
    <RoundedWindow>
      <div className="spacer-medium" />
      <div style={{ textAlign: "center" }}>
        <p>
          Holonym is currently operated by Holonym Foundation (based in the US) 
          and does not have the requisite licenses to service your location. 
          Please submit a request to expand service to your country{" "}
          <a href="https://discord.gg/Sqb6egVwuH" target="_blank" rel="noreferrer" className="in-text-link">
            here.
          </a>
        </p>
      </div>
    </RoundedWindow>
  );
};

export default UnsupportedCountryPage;
