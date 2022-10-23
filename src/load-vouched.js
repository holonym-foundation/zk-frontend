const config = {
    // Optional verification properties.
      verification: {
        // verify the user's information 
        firstName: '',
        lastName: '',
        // used for the crosscheck feature
        email: '',
        phone: ''
      },
      liveness: 'mouth',
      id: 'camera',
      includeBarcode: 'true',
      manualCaptureTimeout: '15000',
      showTermsAndPrivacy: false,
      // production: delete sandbox: true and replace appId with 'DcNi!YHU!bPJ@ojAEOn!dt@BP4Mg6E'
      // sandbox: true,
      appId: 'DcNi!YHU!bPJ@ojAEOn!dt@BP4Mg6E',//'*pBtwb!Awcr._em.UYpQdutkDheUV~',
    // your webhook for POST verification processing
      // callbackURL: 'https://relayer.holonym.id/deleteThisRoute',

      // mobile handoff
      crossDevice: true,
      crossDeviceQRCode: true,
      // crossDeviceSMS: true,
      
      // called when the verification is completed.
      onDone: (job) => {
        console.log("done");
        console.log(JSON.stringify(job));
        // token used to query jobs
        console.log("Scanning complete", { token: job.token });

        // An alternative way to update your system based on the 
        // results of the job. Your backend could perform the following:
        // 1. query jobs with the token
        // 2. store relevant job information such as the id and 
        //    success property into the user's profile
        // fetch(`/yourapi/idv?job_token=${job.token}`);

        // Redirect to the next page based on the job success
        if( job.result.success){
          console.log('jobID is', job.id)
          window.location.href=(`https://holonym.io/verified/${job.id}`);
      } else{
          alert('Verification failed')
      //   window.location.href=("");
        }
      },

      // content
      content: {
        crossDeviceInstructions : ' ',//Scan the QR to start ID verification',
        qrDesktopLink : 'verify on desktop',
        qrDesktopInstructions : ' ',//'Or if your webcam is good, you can {qrDesktopLink}.',
        // qrHandoffInstructions : 'Scan that fucker'
        // crossDeviceTitle : ''// 'Join the Privacy Pool'
      },
      
      // theme
      theme: {
        name: 'avant',
        // iconLabelColor : '#89b3e5',
        bgColor : '#02070c',
        // logo : { src: 'https://holonym.id/images/Holo-Logo.png', style: { 'max-width': 150, 'margin-bottom': 30 }},
        // navigationActiveText : '#89b3e5',
        // iconColor : '#ff9190',
        // iconBackground : '#0e2433',
        baseColor : '#89b3e5',
        fontColor : '#ffffff',
        font : 'Montserrat',
        secondaryButtonColor : '#0e2433',
        handoffLinkColor : '#89b3e5',

      },
    };
  
  const loadVouched = () => {
    const existingScript = document.getElementById("vouched");
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://static.vouched.id/widget/vouched-2.0.0.js";
      script.id = "vouched";
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => {
        var vouched = window["Vouched"]({ ...config });
        console.log("mount vouched-element");
        vouched.mount("#vouched-element");
      };
    }
  };
  
  export default loadVouched;