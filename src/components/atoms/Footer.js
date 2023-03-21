import HoloTwitterLogo from "../../img/Holo-Twitter_1.svg";
import HoloMediumLogo from "../../img/Holo-Medium_1.svg";
import HoloGithubLogo from "../../img/Holo-Github_1.svg";
import HoloMailLogo from "../../img/Holo-Mail_1.svg";
import HoloDiscordLogo from "../../img/Holo-Discord_1.svg";

export default function Footer() {
  return (

    <div 
      className="x-container footer w-container" 
      style={{ 
        backgroundColor: "var(--dark-card-background)",
        boxShadow: "0 0 3px #5e72eb",
        padding: '0px 20px',
        borderRadius: '10px 10px 0px 0px'
      }}
    >
      <div className="x-wrapper footer">
        <div 
          className="logo-div"
          style={{ 
            // paddingTop: '5px',
            marginTop: 'auto',
            marginBottom: 'auto'
          }}
        >
          {/* <h2 style={{ color: "#fff", fontFamily: "Clover Semibold" }}>holonym</h2> */}
          {/* <img src={HolonymLogo} loading="lazy" alt="" className="logo"/> */}
        </div>
        <div className="footer-right-div">
          <div className="social-wrapper">
            <a href="https://twitter.com/0xHolonym" className="social-link-block w-inline-block">
              <img src={HoloTwitterLogo} loading="lazy" alt="" className="social-icon"/>
            </a>
            <a href="https://medium.com/holonym" className="social-link-block w-inline-block">
              <img src={HoloMediumLogo} loading="lazy" alt="" className="social-icon"/>
            </a>
            <a href="https://github.com/holonym-foundation" className="social-link-block w-inline-block">
              <img src={HoloGithubLogo} loading="lazy" alt="" className="social-icon"/>
            </a>
            <a href="mailto:hello@holonym.id" className="social-link-block w-inline-block">
              <img src={HoloMailLogo} loading="lazy" alt="" className="social-icon"/>
            </a>
            <a href="https://discord.gg/zPzsEAXrQt" className="social-link-block w-inline-block">
              <img src={HoloDiscordLogo} loading="lazy" alt="" className="social-icon"/>
            </a>
          </div>
        </div>
      </div>
      {/* <img src="images/Holo-Footer-Sphere.png" loading="lazy" width="495" sizes="(max-width: 767px) 100vw, (max-width: 991px) 600px, 750px" srcset="images/Holo-Footer-Sphere-p-500.png 500w, images/Holo-Footer-Sphere-p-800.png 800w, images/Holo-Footer-Sphere.png 990w" alt="" class="footer-img"/> */}
    </div>
  )
}