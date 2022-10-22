import { truncateAddress } from "../../utils/ui-helpers";
import userIcon from "../../img/User.svg";
import { useSigner, useAccount } from "wagmi";

// profile pic and truncated address
const InnerContent = (props) => {
  return (
    <>
      <img src={userIcon} loading="lazy" alt="" className="wallet-icon" />
      <div className="wallet-text">{truncateAddress(props.address)}</div>
    </>
  );
};

const Address = (props) => {
  const { data: account, refetch } = useAccount();
  const onMyHolo = window.location.href.endsWith("myholo");
  console.log("onMyHolo", onMyHolo);

  return (
    <div className="nav-btn" style={{ maxHeight: "64px" }}>
      {onMyHolo ? (
        <div onClick={refetch} className="wallet-connected">
          <InnerContent address={account.address} />
        </div>
      ) : (
        <a className="wallet-connected"> {/*href="/myholo" */}
          <InnerContent address={account.address} />
        </a>
      )}
    </div>
  );
};

export default Address;
