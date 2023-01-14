import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import ConnectWalletScreen from "./atoms/connect-wallet-screen";
import { truncateAddress } from "../utils/ui-helpers";
// import { InfoButton } from "./info-button";
import RoundedWindow from "./RoundedWindow";

const ProofMenu = ()=>{
    const { data: account } = useAccount();
    const navigate = useNavigate();
    return (
        <RoundedWindow>
            {!account?.address ? (
                <ConnectWalletScreen />
            ) : (
                <div className="x-wrapper small-center" style={{width:"100%"}}>
                    <h1>Get your SBTs</h1>
                    <p>These will give you (<code> {truncateAddress(account?.address)} </code>) soulbound tokens for these attributes about yourself. E.g., if you are a us resident, you can get a US Resident SBT</p> 
                        {/* <h4>Warning: these become more private as time passes. For extra privacy, feel free to wait a bit</h4>
                        <InfoButton
                            type="proofMenu"
                            text={`Anonymity is provided by the anonymity set, a.k.a. Privacy Pool. If we wanted to spy and you only waited a minute, we could see you verified at a certain time and that some wallet submitted a proof a minute later. We could then guess you were that wallet. But if you waited a whole week, a lot of people have also will have registered, so we can't tell it's you. Everyone's verification would be pooled together, so we would only know the prover was one person in the whole pool. Whether you wait a second, a day, or year depends on how much you want to stay anonymous to Holonym Foundation. If you trust us not to track you, you can prove now...`}
                        /> */}
                    <div className="spacer-large"></div>
                    <button onClick={()=>navigate("/prove/us-residency")} className="x-button">US Residency</button>
                    <div className="spacer-large"></div>
                    <button onClick={()=>navigate("/prove/uniqueness")} className="x-button">Unique Personhood</button>
                    <div className="spacer-large"></div>
                    {/* <button disabled onClick={()=>navigate("/")} className="x-button secondary">More proofs coming soon</button> */}

                </div>
            )}
        </RoundedWindow>
    )
}
export default ProofMenu;
