import { useState } from "react";
import { useAccount } from "wagmi";
import HolonymLogo from "../../img/Holonym-Logo-W.png";
import UserImage from "../../img/User.svg";
import { truncateAddress } from "../../utils/ui-helpers";
import WalletModal from "./WalletModal";
import AnnouncementBanner from "./AnnouncementBanner";
import { useNavigate } from "react-router-dom";

const thisUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3002"
    : "https://app.holonym.id";

export default function Navbar() {
  const navigate = useNavigate();
  const { address, connector } = useAccount();
  const [walletModalShowing, setWalletModalShowing] = useState(false);

  function handleNavigate(e: any) {
    e.preventDefault();
    navigate(e.target.href.replace(e.target.origin, ""));
  }

  return (
    <>
      <WalletModal
        visible={walletModalShowing}
        setVisible={setWalletModalShowing}
        blur={true}
      />
      <div
        data-animation="default"
        data-collapse="medium"
        data-duration="700"
        data-easing="ease-out-quint"
        data-easing2="ease-out-quint"
        role="banner"
        className="navbar w-nav"
      >
        <div className="x-container nav w-container">
          <a href={thisUrl} className="logo-div w-nav-brand">
            <div className="logo hide w-embed">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 222.17 50">
                <defs>
                  <style>{".cls-1{fill:currentColor;}"}</style>
                </defs>
                <g id="Layer_2" data-name="Layer 2">
                  <g id="Layer_1-2" data-name="Layer 1">
                    <path
                      className="cls-1"
                      d="M84.48,0h6.26V18.33A11.9,11.9,0,0,1,102,11c10,0,15.73,7.6,15.73,17.88V49.25h-6.26V28.91c0-7.82-3.88-12.52-10.06-12.52-6.71,0-10.66,5-10.66,13V49.25H84.48Z"
                    />
                    <path
                      className="cls-1"
                      d="M170,38.38,170.08,0h6.26l-.07,37.7c0,4.48,1.26,6,4.09,6.41l-.07,5.14C174.63,48.73,170,46.72,170,38.38Z"
                    />
                    <path
                      className="cls-1"
                      d="M182.82,30.25c0-12,9-19.52,19.75-19.52s19.6,7.6,19.6,19.52c0,12.22-8.87,19.75-19.6,19.75S182.82,42.47,182.82,30.25Zm19.75,14.68c7.67,0,13.34-6,13.34-14.68,0-8.34-5.89-14.45-13.34-14.45s-13.41,6-13.41,14.45C189.16,39,194.82,44.93,202.57,44.93Z"
                    />
                    <path
                      className="cls-1"
                      d="M124.19,30.25c0-12,9-19.52,19.75-19.52s19.59,7.6,19.59,19.52c0,12.22-8.86,19.75-19.59,19.75S124.19,42.47,124.19,30.25Zm19.75,14.68c7.67,0,13.34-6,13.34-14.68,0-8.34-5.89-14.45-13.34-14.45-7.61,0-13.42,6-13.42,14.45C130.52,39,136.19,44.93,143.94,44.93Z"
                    />
                    <path
                      className="cls-1"
                      d="M41.38,26.44H27A1.73,1.73,0,0,1,27,23H41.38a1.73,1.73,0,0,1,0,3.45Z"
                    />
                    <path
                      className="cls-1"
                      d="M37.36,36.78H31a1.73,1.73,0,0,1,0-3.45h6.33a1.73,1.73,0,0,1,0,3.45Z"
                    />
                    <path
                      className="cls-1"
                      d="M37.36,16.09H31a1.73,1.73,0,0,1,0-3.45h6.33a1.73,1.73,0,0,1,0,3.45Z"
                    />
                    <path
                      className="cls-1"
                      d="M24.71,3.45A21.27,21.27,0,1,1,3.45,24.71,21.29,21.29,0,0,1,24.71,3.45m0-3.45A24.72,24.72,0,1,0,49.43,24.71,24.71,24.71,0,0,0,24.71,0Z"
                    />
                    <path
                      className="cls-1"
                      d="M42.53,4A21.27,21.27,0,1,1,21.26,25.29,21.29,21.29,0,0,1,42.53,4m0-3.45A24.72,24.72,0,1,0,67.24,25.29,24.71,24.71,0,0,0,42.53.57Z"
                    />
                  </g>
                </g>
              </svg>
            </div>
            <img
              src={HolonymLogo}
              loading="lazy"
              alt=""
              sizes="200px"
              className="logo"
            />
          </a>
          <nav
            role="navigation"
            className="nav-menu flex w-nav-menu"
            style={{ fontSize: "1rem" }}
          >
            {/* rome-ignore lint/a11y/useValidAnchor: <explanation> */}
            <a
              href="/issuance"
              onClick={handleNavigate}
              className="nav-link w-nav-link"
            >
              Verify
            </a>
            {/* rome-ignore lint/a11y/useValidAnchor: <explanation> */}
            <a
              href="/prove"
              onClick={handleNavigate}
              className="nav-link w-nav-link"
            >
              Prove
            </a>
            {/* rome-ignore lint/a11y/useValidAnchor: <explanation> */}
            <a
              href="/profile"
              onClick={handleNavigate}
              className="nav-link w-nav-link"
            >
              Profile
            </a>
            <div
              className="nav-wallet"
              style={{ backgroundColor: "var(--dark-card-background)" }}
            >
              <img
                src={UserImage}
                loading="lazy"
                alt=""
                className="nav-wallet-img"
              />
              {address && connector ? (
                <div className="nav-wallet-text">
                  {truncateAddress(address)}
                </div>
              ) : (
                <div
                  className="nav-wallet-text nav-link w-nav-link"
                  onClick={() => setWalletModalShowing(true)}
                >
                  Connect wallet
                </div>
              )}
            </div>
          </nav>
        </div>
        <AnnouncementBanner />
      </div>
    </>
  );
}
