import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Oval } from "react-loader-spinner";
import { useQuery, useAccount, useBalance } from "wagmi";
import { Success } from "../success";
import { truncateAddress } from "../../utils/ui-helpers";
import RoundedWindow from "../RoundedWindow";
import { useProofMetadata } from "../../context/ProofMetadata";
import { defaultChainToProveOn } from "../../constants";
import Relayer from "../../utils/relayer";
import useGenericProofsState from "./useGenericProofsState";
import useSubmitProof from "./useSubmitProof";
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";

const SUBMIT_PROOF = 'submitProof';

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
	const navigate = useNavigate();
	const { data: account } = useAccount();
	const { data: balanceData } = useBalance({
		addressOrName: account?.address
	})
	const {
    params,
    proofs,
		alreadyHasSBT,
    accountReadyAddress,
    hasNecessaryCreds,
		nonUSResidentTryingToProveUSResidency,
    proof,
    submissionConsent,
    setSubmissionConsent,
    proofSubmissionSuccess,
		setProofSubmissionSuccess,
    error,
		setError,
  } = useGenericProofsState();
	const { addProofMetadataItem } = useProofMetadata();

	const balanceGTsbtFee = useMemo(() => {
		try {
			if (!proofs[params.proofType].contractName.includes('Sybil')) {
				return true
			}

			if (!balanceData?.formatted) return true
			return Number(balanceData.formatted) > 0.005
		} catch (err) {
			console.error(err)
		}
	}, [balanceData])

	const {
    data,
    // error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    reset,
    write,
    writeAsync,
  } = useSubmitProof({
		proof,
		contractName: proofs[params.proofType].contractName,
		chain: defaultChainToProveOn,
		onSuccess: async (txResponse) => {
      const result = {...txResponse};
      if (txResponse?.wait) {
        const txReceipt = await txResponse.wait();
        result.blockNumber = txReceipt.blockNumber;
        result.transactionHash = txReceipt.transactionHash;
      }
			
			console.log('result from submitProof')
			console.log(result)
			addProofMetadataItem(
				result,
				proof.inputs[1],
				params.proofType,
				params.actionId,
			);
			setProofSubmissionSuccess(true);
		},
		onError: (error) => {
			console.error("proofSubmissionError", error);
			let message = error?.response?.data?.error?.reason ?? (error?.data?.message ?? error?.message);
			datadogLogs.logger.error('proofSubmissionError', message, {}, error);
			datadogRum.addError(error, { message: message })
			setError({
				type: SUBMIT_PROOF,
				balance: balanceData?.formatted,
				message, 
			});
		}
	})

	if (proofSubmissionSuccess) {
		if (params.callback) window.location.href = `https://${params.callback}`;
		if (window.localStorage.getItem('register-proofType')) {
			navigate(`/register?credentialType=${window.localStorage.getItem('register-credentialType')}&proofType=${window.localStorage.getItem('register-proofType')}&callback=${window.localStorage.getItem('register-callback')}`)
		}
		try {
			datadogLogs.logger.info('proofSubmissionSuccess');
			window.fathom.trackGoal('E96HHORL', 10);
		} catch (err) {
			console.error(err)
		}
		
		return <Success title="Success" />;
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
					<p>Error: {error.message}</p>
				) : alreadyHasSBT ? (
					<p>
						You already have a soul-bound token (SBT) for this attribute.
					</p>
				) : hasNecessaryCreds ? (
					<p>
						Get a ZKSNARK NFT, which proves a fact about your identity while keeping your identity private. 
						<code> {truncateAddress(accountReadyAddress)} </code> will mint a {" "}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://cointelegraph.com/news/what-are-soulbound-tokens-sbts-and-how-do-they-work"
							style={{ color: "#fdc094" }}
						>
							soul-bound NFT
						</a>{" "}
						(SBT) showing only this one attribute of you:{" "}
						<code>{proofs[params.proofType].name}</code>
					</p>
				) : (
					nonUSResidentTryingToProveUSResidency ? (
						<p>
							&nbsp;Only US residents can generate proofs of US residency.
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
					)
				)}
				<div className="spacer-med" />
				<br />
				{!alreadyHasSBT && hasNecessaryCreds ? (
					balanceGTsbtFee ? (
						proof ? (
							<button
								className="x-button"
								onClick={() => {
									try {
										write();
										window.fathom.trackGoal('OLGDI8EP', 0); 
									} catch (err) {
										console.error('An error occurred when Submit Proof button was clicked:', err);
									}
								}}
							>
								{isLoading
									? (
											<div
												style={{
													display: "flex",
													justifyContent: "center",
													alignItems: "center",
												}}
											>
												Submitting
												<CustomOval />
											</div>
										)
									: "Submit proof"}
							</button>
						) : (
							<LoadingProofsButton />
						)
					) : (
						<button
							className="x-button submit-proof-btn-disabled"
							disabled
						>
							Submit proof
						</button>
					)
				) : (
					""
				)}

				<br />

				{!balanceGTsbtFee && (
					<>
						<h2>
							Mint price:
						</h2>
						<p><code style={{ }}>0.005 ETH</code></p>
						<br />
						<a
							className="x-button"
							href="https://app.optimism.io/bridge/deposit"
							target="_blank"
							rel="noreferrer"
							onClick={() => {
								try {
									window.fathom.trackGoal('2HX0QDQW', 0);
								} catch (err) {
									console.error(err)
								}
							}}
						>
							Don&#39;t have ETH on Optimism? Click here to bridge
						</a>
					</>
				)}

			</div>
		</RoundedWindow>
	);
};

export default Proofs;
