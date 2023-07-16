import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "wagmi";
import { 
  clientPortalUrl, 
} from "../../constants";
import { Oval } from "react-loader-spinner";
import RoundedWindow from "../RoundedWindow";
import useGenericProofsState from "./useGenericProofsState";

const CustomOval = () => (
	<Oval
		height={10}
		width={10}
		color="#464646"
		wrapperStyle={{ marginLeft: "5px" }}
		wrapperClass=""
		visible={true}
		ariaLabel="oval-loading"
		secondaryColor="#01010c"
		strokeWidth={2}
		strokeWidthSecondary={2}
	/>
)

const LoadingProofsButton = (props) => (
	<button className="x-button" onClick={props.onClick}>
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			Proof Loading
			<CustomOval />
		</div>
	</button>
);


const Proofs = () => {
  const [searchParams] = useSearchParams();
	const {
    params,
    proofs,
    hasNecessaryCreds,
    proof,
    error,
		setError,
  } = useGenericProofsState();

  const sessionQuery = useQuery(
    ["getSession"],
    async () => {
      try {
        if (!searchParams.get("sessionId")) return { error: "No session id" };
        const sessionId = searchParams.get("sessionId");
        const resp = await fetch(`${clientPortalUrl}/api/sessions/${sessionId}`);
        return await resp.json();
      } catch (err) {
        console.error(err)
        return { error: err };
      }
    },
    {
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.error(err);
    }
    // enabled:
    // onSuccess:
    // onError:
  });

  // Steps:
  // 1. Ensure sessionId and callback params are present
  // 2. Ensure sessionId is valid
  // 3. Redirect user to callback URL & include proof in query params

  useEffect(() => {
    (async () => {
      // Get sessionId and callback from URL
      const sessionId = searchParams.get("sessionId");
      const callbackUrl = searchParams.get("callback");
      if (!(sessionId || callbackUrl)) setError({ message: "Missing sessionId and callback" });
      if (!sessionId) setError({ message: "Missing sessionId" });
      if (!callbackUrl) setError({ message: "Missing callback" });
      else if (sessionId && callbackUrl) {
        try {
          console.log('sessionQuery.data before refetch', sessionQuery.data)
          if (!sessionQuery.data) await sessionQuery.refetch() // manually call queryFn
          console.log('sessionQuery.data after refetch', sessionQuery.data)
          const returnedSessionId = sessionQuery?.data?.sessionId;
          if (!returnedSessionId) setError({ message: "Invalid sessionId" });
          else if (sessionQuery?.data.error) setError(sessionQuery?.data?.error?.message);
        } catch (err) {
          console.error(err)
          setError({ message: "Invalid sessionId" });
        }
      }
    })()
  }, [searchParams, sessionQuery, sessionQuery.data, sessionQuery.isError, sessionQuery.isLoading, sessionQuery.isSuccess, setError]);

  function handleSubmit() {
    if (error || !sessionQuery?.data || sessionQuery?.isError || !proof) return;
    // Redirect user to callback URL & include proof in query params
    const callback = searchParams.get("callback");
    const proofString = encodeURIComponent(JSON.stringify(proof));
    // TODO: Encrypt (at least part of) proof using client's public encryption key
    window.location.href = `${callback}?proof=${proofString}`;
  }


  return (
		<RoundedWindow>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<h2>Prove {proofs[params.proofType].name}</h2>
				<div className="spacer-med" />
				<br />
				{error?.message ? (
					<p style={{ color: "red", fontSize: "1rem" }}>Error: {error.message}</p>
				) : hasNecessaryCreds ? (
					<p>
						This will generate a proof showing only this one attribute of you:{" "}
            <code>{proofs[params.proofType].name}</code>. It may take 5-15 seconds to load.
					</p>
				) : (
					<p>
						&nbsp;Note: You cannot generate this proof without the necessary credentials. If
						you have not already, please{" "}
						{/* TODO: Get specific. Tell the user which credentials they need to get/verify. */}
						<a href="/issuance" style={{ color: "#fdc094" }}>
							verify yourself
						</a>
						.
					</p>
				)}
				<div className="spacer-med" />
				<br />
				{hasNecessaryCreds ? (
					proof ? (
						<button
							className="x-button"
							onClick={handleSubmit}
						>
              Submit proof
						</button>
					) : (
						<LoadingProofsButton />
					)
				) : (
					""
				)}
			</div>
		</RoundedWindow>
  );
};

export default Proofs;
