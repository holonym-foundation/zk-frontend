import { truncateAddress } from "../../utils/ui-helpers";
import userIcon from "../../img/User.svg";
import { useAccount } from "wagmi";

// profile pic and truncated address
const InnerContent = (props: { address?: string }) => {
  return (
    <>
      <img src={userIcon} loading="lazy" alt="" className="wallet-icon" />
      <div className="wallet-text">{truncateAddress(props.address)}</div>
    </>
  );
};

const Address = () => {
  const { address, connector } = useAccount();

  return (
    <div className="nav-btn" style={{ maxHeight: "64px" }}>
      <div
        // onClick={() => {
        //   if (connector) {
        //     connector.connect();
        //   }
        // }}
        className="wallet-connected"
      >
        <InnerContent address={address} />
      </div>
    </div>
  );
};

export default Address;
