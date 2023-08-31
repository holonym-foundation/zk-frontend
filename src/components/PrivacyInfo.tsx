import RoundedWindow from "./RoundedWindow"

const PrivacyInfo = () => {
    return (
        <RoundedWindow>
            <div
                className="x-wrapper small-center"
                style={{ height: "95%", width: "80%" }}
            >
                <h1>Privacy</h1>

                <h5 className="h5">Anonymity through Zero-Knowledge Proofs</h5>
                <h6>
                    After verifying one's ID, all usage of Holonym is safegauded through zero-knowledge proofs that protect against anyone, 
                    even Holonym Foundation, tracking users.
                </h6>

                <h5 className="h5">Deletion of user records</h5>
                <h6>
                    Holonym does not store any personal data except those strictly necessary for functionality, which it deletes after five days. 
                    When ID verification is successful, all personal data is deleted immediately from our servers and is stored in the user's device. 
                    If it fails, we retain it for 5 days to provide customer support.
                </h6>
                <h5 className="h5">Privacy Pointers</h5>
                <h6>
                    Already, Holonym gives a high degree of privacy. For higher privacy, you may choose to wait hours, days, or even weeks before proving facts about yourself on Holonym.
                    This increases the size of the anonymity set (see <a href="https://docs.holonym.id/for-developers/start-here#option-b-harder-ux-math-based-privacy" target="_blank">anonymity set</a>).
                    You may also opt to pay for the credentials via fiat, which is not linked to your wallet address, or through a "burner" wallet.
                </h6>

                
                
                <h5 className="h5">Detailed Documentation</h5>
                <h6>
                    The specifics of the Holonym privacy protocol can be found in our <a href="https://docs.holonym.id" target="_blank">documentation</a>.
                </h6>
           </div>
        </RoundedWindow>
    )
}
export default PrivacyInfo;