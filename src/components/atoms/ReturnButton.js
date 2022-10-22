import { useState, useEffect } from 'react'

// Button to return to a site that directed the user to holo via a "sign up with holo" link
const ReturnButton = (props) => {
  // const [style, setStyle] = useState()
  const [redirectingSiteUrl, setRedirectingSiteUrl] = useState()
  const [redirectingSiteTitle, setRedirectingSiteTitle] = useState()

  useEffect(() => {
    const siteUrlTemp = sessionStorage.getItem('signUpWithHoloSiteUrl')
    const siteTitleTemp = sessionStorage.getItem('signUpWithHoloSiteTitle')
    if (siteUrlTemp && siteTitleTemp) {
      setRedirectingSiteUrl(siteUrlTemp)
      setRedirectingSiteTitle(siteTitleTemp)
    }
  }, [props])

  function handleClick() {
    sessionStorage.removeItem('signUpWithHoloSiteUrl');
    sessionStorage.removeItem('signUpWithHoloSiteTitle');
    window.location.href = redirectingSiteUrl;
  }

  return (
    <>
      {redirectingSiteUrl && redirectingSiteTitle &&
        <div href={redirectingSiteUrl} onClick={handleClick} className="x-button secondary">
          <div className="wallet-text">
            Return to {' ' + redirectingSiteTitle}
          </div>
        </div>
      }
    </>
  );
};

export default ReturnButton;
