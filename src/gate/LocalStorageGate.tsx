import { useState, useEffect } from "react";
import { Layout } from "../Layout";
import RoundedWindow from "../components/RoundedWindow";

const LocalStorageGate = ({ children }: {
  children: React.ReactNode
}) => {
  const [localStorageIsSupported, setLocalStorageIsSupported] = useState(true);
  useEffect(() => {
    try {
      window.localStorage.setItem("test", "test");
      window.localStorage.removeItem("test");
      setLocalStorageIsSupported(true);
    } catch (err) {
      setLocalStorageIsSupported(false);
    }
  }, []);
  if (localStorageIsSupported) {
    return <>{children}</>;
  }
  return (
    <Layout>
      <RoundedWindow>
        <div className="spacer-medium" />
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: 'red' }}>Error</h2>
          <p>
            localStorage is unsupported in this browser.
          </p>
          <p>
            This error can occur if you are using a private browsing mode or if
            you have disabled localStorage in your browser settings. Please
            exit private browsing mode or enable localStorage and try again.
          </p>
        </div>
      </RoundedWindow>
    </Layout>
  );
};

export default LocalStorageGate;
