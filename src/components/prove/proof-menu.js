import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import ConnectWalletScreen from "../atoms/connect-wallet-screen";
import { truncateAddress } from "../../utils/ui-helpers";
// import { InfoButton } from "./info-button";
import RoundedWindow from "../RoundedWindow";

const ProofMenu = ()=>{
    const { data: account } = useAccount();
    const navigate = useNavigate();
    return (
        <RoundedWindow>
            {!account?.address ? (
                <ConnectWalletScreen />
            ) : (
                <div className="x-wrapper small-center" style={{width:"100%"}}>
                    <h1>Private Soulbound NFTs</h1>
                    <h6>
                    Be one of the first people to mint the privacy-preserving soulbound NFTs                         that show only a particular attribute about yourself, without revealing who you are. For a larger anonymity set, you may choose to wait before doing so.

                    {/* {" "} 
                        <a
							target="_blank"
							rel="noreferrer"
							href="https://cointelegraph.com/news/what-are-soulbound-tokens-sbts-and-how-do-they-work"
							style={{ color: "#fdc094" }}
						>
							soul-bound NFTs
						</a>
                        {" "} */}

                        {/* <br />For now, the price is <b>only 5 OP</b> */}
                    </h6> 
                    <p><i>If you're here for Gitcoin Passport, choose "Unique Personhood (Government) ID" to boost your unique humanity score</i></p>

                        {/* <h4>Warning: these become more private as time passes. For extra privacy, feel free to wait a bit</h4>
                        <InfoButton
                            type="proofMenu"
                            text={`Anonymity is provided by the anonymity set, a.k.a. Privacy Pool. If we wanted to spy and you only waited a minute, we could see you verified at a certain time and that some wallet submitted a proof a minute later. We could then guess you were that wallet. But if you waited a whole week, a lot of people have also will have registered, so we can't tell it's you. Everyone's verification would be pooled together, so we would only know the prover was one person in the whole pool. Whether you wait a second, a day, or year depends on how much you want to stay anonymous to Holonym Foundation. If you trust us not to track you, you can prove now...`}
                        /> */}
                    <div className="spacer-large" />
                    <button onClick={()=>navigate("/prove/uniqueness")} className="glowy-green-button">Mint Unique Personhood (government ID)</button>
                    <div className="spacer-large" />
                    <button onClick={()=>navigate("/prove/uniqueness-phone")} className="glowy-green-button">Mint Unique Personhood (phone number)</button>
                    <div className="spacer-large" />
                    <button onClick={()=>navigate("/prove/us-residency")} className="glowy-green-button">Mint US Residency</button>
                    <div className="spacer-large" />
                    {/* <button onClick={()=>navigate("/prove/medical-specialty")} className="glowy-green-butto">Medical Specialty</button>
                    <div className="spacer-large" /> */}
                    {/* <button disabled onClick={()=>navigate("/")} className="x-button secondary">More proofs coming soon</button> */}

                </div>
            )}
        </RoundedWindow>
    )
}
export default ProofMenu;
