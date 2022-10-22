import React, { useEffect, useState } from "react";

export const DisplayPOAPs = (props) => {
  const [poaps, setPoaps] = useState([]);

  const getPoaps = async (address) => {
    console.log(`Calling api.poap.xyz for POAPs claimed by ${address}`);

    const url = `https://api.poap.xyz/actions/scan/${address}`;
    const resp = await fetch(url);
    const poaps = await resp.json();
    const poapDisplay = poaps.map((poap) => (
      <div key={poap["event"]["id"]} style={{ height: "126px" }}>
        <img
          src={poap["event"]["image_url"]}
          alt={`POAP for ${poap["event"]["name"]}`}
          style={{ margin: "10px", height: "100px", minWidth: "100px" }}
        />
      </div>
    ));
    return poapDisplay;
  };

  useEffect(() => {
    getPoaps(props.address).then((poaps) => setPoaps(poaps));
  }, [props.address]);

  return <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", overflowX: "scroll" }}>{poaps}</div>;
};
