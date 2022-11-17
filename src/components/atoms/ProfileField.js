import { useEffect, useRef } from "react";
import classNames from 'classnames';
import CircleWavy from '../../img/CircleWavy.svg';
import CircleWavyCheck from '../../img/CircleWavyCheck.svg';


export default function ProfileField({ header, fieldValue, verifyCallback }) {

  const fieldValueClasses = classNames({
    'dash-display-text': true,
    'small': true,
    'disable': !fieldValue
  })

  return (
    <div className="x-card blue-yellow">
      <div className="card-heading">
        <h3 className="h3 no-margin">{header}</h3>
        <div className="card-status-div">
          {fieldValue ? (
              <img src={CircleWavyCheck} loading="lazy" alt="" className="card-status"/>
            ) : (
              <img src={CircleWavy} loading="lazy" alt="" className="card-status"/>
          )}
        </div>
        {/* TODO: Figure out the best way to display a "Verify" button here, and 
            figure out the best way to direct user to a verification page */}
        {verifyCallback ? (
          <>
            <div onClick={verifyCallback}>
              <h3 onClick={verifyCallback} className="h3 no-margin dash">Verify</h3>
            </div>
          </>
        ) : null}
      </div>
      <h1 id="w-node-_7f02612f-b14d-3942-4118-0e889bc47c68-22284be6" className={fieldValueClasses}>
        {fieldValue ? fieldValue : 'N/A'}
      </h1>
    </div>
  );
};




  // <div class="x-section wf-section">
  //   <div class="x-container dashboard w-container">
  //     <div class="x-dash-div">
  //       <h1 class="h1">Public Info</h1>
  //       <div class="x-edit-div">
  //         <a data-w-id="1d21566f-05e7-ce44-8f51-da6dab316e3b" href="#" class="info-btn w-inline-block">
  //           <div class="info-img w-embed"><svg width="20" height="21" viewbox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
  //               <path d="M7.24219 17.3749H3.75C3.58424 17.3749 3.42527 17.3091 3.30806 17.1919C3.19085 17.0747 3.125 16.9157 3.125 16.7499V13.2577C3.12472 13.1766 3.14044 13.0962 3.17128 13.0211C3.20211 12.946 3.24745 12.8778 3.30469 12.8202L12.6797 3.44524C12.7378 3.38619 12.8072 3.33929 12.8836 3.30728C12.9601 3.27527 13.0421 3.25879 13.125 3.25879C13.2079 3.25879 13.2899 3.27527 13.3664 3.30728C13.4428 3.33929 13.5122 3.38619 13.5703 3.44524L17.0547 6.92962C17.1137 6.98777 17.1606 7.0571 17.1927 7.13355C17.2247 7.21 17.2411 7.29205 17.2411 7.37493C17.2411 7.45781 17.2247 7.53987 17.1927 7.61632C17.1606 7.69277 17.1137 7.76209 17.0547 7.82024L7.67969 17.1952C7.62216 17.2525 7.55391 17.2978 7.47884 17.3287C7.40376 17.3595 7.32335 17.3752 7.24219 17.3749V17.3749Z" stroke="#747474" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
  //               <path d="M10.625 5.5L15 9.875" stroke="#747474" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
  //             </svg></div>
  //         </a>
  //         <div class="edit-text">Edit</div>
  //       </div>
  //       <div class="spacer-small"></div>
  //     </div>
  //     <div class="spacer-small"></div>
  //     <div class="x-wrapper dash">
  //       <div class="x-card blue-yellow">
  //         <div class="card-heading">
  //           <h3 class="h3 no-margin">Age</h3>
  //           <div class="card-status-div"><img src="images/CircleWavy.svg" loading="lazy" alt="" class="card-status"></div>
  //           <h3 class="h3 no-margin dash">Verify</h3>
  //         </div>
  //         <h1 id="w-node-b709fce4-e48e-d9b3-304b-fa25e4dcae12-c262153e" class="dash-display-text disable">XX</h1>
  //       </div>
  //       <div class="x-card blue-yellow">
  //         <div class="card-heading">
  //           <h3 class="h3 no-margin">US Residency</h3>
  //           <div class="card-status-div"><img src="images/CircleWavy.svg" loading="lazy" alt="" class="card-status"></div>
  //           <h3 class="h3 no-margin dash">Verify</h3>
  //         </div>
  //         <h1 id="w-node-b709fce4-e48e-d9b3-304b-fa25e4dcae1a-c262153e" class="dash-display-text disable">N/A</h1>
  //       </div>
  //       <div class="x-card blue-yellow">
  //         <div class="card-heading">
  //           <h3 class="h3 no-margin">Unique Person</h3>
  //           <div class="card-status-div"><img src="images/CircleWavy.svg" loading="lazy" alt="" class="card-status"></div>
  //           <h3 class="h3 no-margin dash">Verify</h3>
  //         </div>
  //         <h1 id="w-node-b709fce4-e48e-d9b3-304b-fa25e4dcae22-c262153e" class="dash-display-text disable">N/A</h1>
  //       </div>
  //     </div>
  //     <div class="spacer-large"></div>
  //     <div class="x-dash-div">
  //       <h1 class="h1">Private Info</h1>
  //       <div class="x-edit-div">
  //         <a data-w-id="f766e7f4-a08e-943a-ba77-5a1a0667a7df" href="#" class="info-btn w-inline-block">
  //           <div class="info-img w-embed"><svg width="20" height="21" viewbox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
  //               <path d="M7.24219 17.3749H3.75C3.58424 17.3749 3.42527 17.3091 3.30806 17.1919C3.19085 17.0747 3.125 16.9157 3.125 16.7499V13.2577C3.12472 13.1766 3.14044 13.0962 3.17128 13.0211C3.20211 12.946 3.24745 12.8778 3.30469 12.8202L12.6797 3.44524C12.7378 3.38619 12.8072 3.33929 12.8836 3.30728C12.9601 3.27527 13.0421 3.25879 13.125 3.25879C13.2079 3.25879 13.2899 3.27527 13.3664 3.30728C13.4428 3.33929 13.5122 3.38619 13.5703 3.44524L17.0547 6.92962C17.1137 6.98777 17.1606 7.0571 17.1927 7.13355C17.2247 7.21 17.2411 7.29205 17.2411 7.37493C17.2411 7.45781 17.2247 7.53987 17.1927 7.61632C17.1606 7.69277 17.1137 7.76209 17.0547 7.82024L7.67969 17.1952C7.62216 17.2525 7.55391 17.2978 7.47884 17.3287C7.40376 17.3595 7.32335 17.3752 7.24219 17.3749V17.3749Z" stroke="#747474" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
  //               <path d="M10.625 5.5L15 9.875" stroke="#747474" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
  //             </svg></div>
  //         </a>
  //         <div class="edit-text">Edit</div>
  //       </div>
  //       <div class="spacer-small"></div>
  //     </div>
  //     <div class="spacer-small"></div>
  //     <div class="x-wrapper dash">
  //       <div class="x-card blue-yellow">
  //         <div class="card-heading">
  //           <h3 class="h3 no-margin">Government Id</h3>
  //           <div class="card-status-div"><img src="images/CircleWavy.svg" loading="lazy" alt="" class="card-status"></div>
  //           <h3 class="h3 no-margin dash">Verify</h3>
  //         </div>
  //         <h1 id="w-node-_52791ea2-3ac9-0b63-2895-09e63bda01ca-c262153e" class="dash-display-text small disable">N/A</h1>
  //       </div>
  //       <div class="x-card blue-yellow">
  //         <div class="card-heading">
  //           <h3 class="h3 no-margin">Phone Number</h3>
  //           <div class="card-status-div"><img src="images/CircleWavy.svg" loading="lazy" alt="" class="card-status"></div>
  //           <h3 class="h3 no-margin dash">Verify</h3>
  //         </div>
  //         <h1 id="w-node-_7f02612f-b14d-3942-4118-0e889bc47c68-c262153e" class="dash-display-text small disable">+X (xxx) xxx-xxxx</h1>
  //       </div>
  //     </div>
  //   </div>
  // </div>
  // <script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=6238d970bba6cc53f69c4d89" type="text/javascript" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
  // <script src="js/webflow.js" type="text/javascript"></script>
  // <!-- [if lte IE 9]><script src="https://cdnjs.cloudflare.com/ajax/libs/placeholders/3.0.2/placeholders.min.js"></script><![endif] -->
