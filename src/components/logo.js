import logo from "../img/Holo-Logo.png";

export const HomeLogo = () => {
  return (
    <a href="/" className="nav-logo w-inline-block">
      <div className="logo w-embed">
        <img src={logo} style={{height: "32px"}}/>
        {/* <svg width="83" height="30" viewBox="0 0 83 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 0H3.8V11C4.8 8.5 7.4 6.6 10.6 6.6C16.6 6.6 20 11.2 20 17.3V29.5H16.2V17.3C16.2 12.6 13.9 9.8 10.2 9.8C6.2 9.8 3.8 12.8 3.8 17.6V29.5H0V0Z"
            fill="white"
          ></path>
          <path d="M51.3 23V0H55.1V22.6C55.1 25.3 55.9 26.2 57.6 26.4V29.5C54.1 29.2 51.3 28 51.3 23Z" fill="white"></path>
          <path
            d="M59 18.2C59 11 64.4 6.39999 70.9 6.39999C77.2 6.39999 82.7 11 82.7 18.1C82.7 25.4 77.4 29.9 70.9 29.9C64.4 30 59 25.5 59 18.2ZM70.9 27C75.5 27 78.9 23.4 78.9 18.2C78.9 13.2 75.4 9.49999 70.9 9.49999C66.3 9.49999 62.9 13.1 62.9 18.2C62.8 23.4 66.2 27 70.9 27Z"
            fill="white"
          ></path>
          <path
            d="M23.8 18.2C23.8 11 29.2 6.5 35.6 6.5C41.9001 6.5 47.4001 11.1 47.4001 18.2C47.4001 25.5 42.1 30 35.6 30C29.2 30 23.8 25.5 23.8 18.2Z"
            fill="url(#paint0_linear_8_845)"
          ></path>
          <defs>
            <linearGradient id="paint0_linear_8_845" x1="25.8253" y1="8.4185" x2="41.1259" y2="23.719" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" stopOpacity="0"></stop>
              <stop offset="0.00783956" stopColor="white" stopOpacity="0.01"></stop>
              <stop offset="1" stopColor="white"></stop>
            </linearGradient>
          </defs>
        </svg> */}
      </div>
    </a>
  );
};
