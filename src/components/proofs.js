import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useAccount, useNetwork, useQuery } from "wagmi";
import { getCredentials, addProofMetadataItem } from "../utils/secrets";
import {
	poseidonTwoInputs,
	proofOfResidency,
	antiSybil,
} from "../utils/proofs";
import {
	serverAddress,
	defaultActionId,
	defaultChainToProveOn,
} from "../constants";
// import residencyStoreABI from "../constants/abi/zk-contracts/ResidencyStore.json";
// import antiSybilStoreABI from "../constants/abi/zk-contracts/AntiSybilStore.json";

import { Success } from "./success";
import { Oval } from "react-loader-spinner";
import { truncateAddress } from "../utils/ui-helpers";
import RoundedWindow from "./RoundedWindow";
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../context/HoloKeyGenSig";
import Relayer from "../utils/relayer";
import ConnectWalletScreen from "./atoms/connect-wallet-screen";

const ErrorScreen = ({ children }) => (
	<div className="x-container w-container">{children}</div>
);

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
		</div>
	</button>
);

async function loadAntiSybil(newSecret, serializedAsNewPreimage,
	address,
	actionId,
) {
	console.log("actionId", actionId);
	const footprint = await poseidonTwoInputs([
		actionId,
		ethers.BigNumber.from(newSecret).toString(),
	]);

	const [
		issuer_,
		_,
		countryCode_,
		nameCitySubdivisionZipStreetHash_,
		completedAt_,
		scope,
	] = serializedAsNewPreimage;

	return await antiSybil(
		address,
		issuer_,
		actionId,
		footprint,
		countryCode_,
		nameCitySubdivisionZipStreetHash_,
		completedAt_,
		scope,
		newSecret,
	);
}

async function loadPoR(newSecret, serializedAsNewPreimage, address) {
	const salt =
		"18450029681611047275023442534946896643130395402313725026917000686233641593164"; // this number is poseidon("IsFromUS")
	const footprint = await poseidonTwoInputs([
		salt,
		ethers.BigNumber.from(newSecret).toString(),
	]);

	const [
		issuer_,
		_,
		countryCode_,
		nameCitySubdivisionZipStreetHash_,
		completedAt_,
		scope,
	] = serializedAsNewPreimage;
	return await proofOfResidency(
		address,
		issuer_,
		salt,
		footprint,
		countryCode_,
		nameCitySubdivisionZipStreetHash_,
		completedAt_,
		scope,
		newSecret,
	);
}

async function submitProofThenStoreMetadata(
	proof,
	contractName,
	proofType,
	actionId,
	holoAuthSigDigest,
	holoKeyGenSigDigest,
) {
	const result = await Relayer.prove(
		proof,
		contractName,
		defaultChainToProveOn,
	);
	await addProofMetadataItem(
		result,
		proof.inputs[1],
		proofType,
		actionId,
		holoAuthSigDigest,
		holoKeyGenSigDigest,
	);
  return result;
}
const METAMASK_ERROR_TYPE = "metamask";
const MINTING_ERROR_TYPE = "mint";
const NOGOV_ERROR_TYPE = "no-idgov";
const LOAD_PROOF_TYPE = 'loadProof';
const SUBMIT_PROOF = 'submitProof';

async function testMetamask(account) {
	if (account && !window.ethereum) {
		throw new Error({
			type: METAMASK_ERROR_TYPE,
			message: "Currently, this only works with MetaMask",
		});
	}
	// Still have to do this in case metamask isn't logged in. would be good to have equivalent for other types of connectors, but we're not really using wagmi rn
	try {
		await window.ethereum.request({ method: "eth_requestAccounts" });
	} catch (e) {
		throw new Error({
			type: METAMASK_ERROR_TYPE,
			message:
				"Unable to call eth_requestAccounts. Installing Metamask may fix this bug",
		});
	}
}

const Proofs = () => {
	const params = useParams();
	const navigate = useNavigate();
	const [sortedCreds, setSortedCreds] = useState();

	const [error, setError] = useState();
	const [customError, setCustomError] = useState();
	const [proof, setProof] = useState();
	const [submissionConsent, setSubmissionConsent] = useState(false);
  const [proofSubmissionSuccess, setProofSubmissionSuccess] = useState(false);
	const { data: account } = useAccount();
	const { holoAuthSigDigest } = useHoloAuthSig();
	const { holoKeyGenSigDigest } = useHoloKeyGenSig();
	const accountReadyAddress = useMemo(
		() => account?.connector.ready && account?.address && account.address,
    []
	);

	const proofs = {
		"us-residency": {
			name: "US Residency",
			// contractName: "IsUSResident",
			contractName: "IsUSResidentV2",
		},
		uniqueness: {
			name: "Uniqueness",
			// contractName: "SybilResistance",
			contractName: "SybilResistanceV2",
		},
	};

	// Steps:
	// 1. Ensure user's wallet is connected (i.e., get account)
	// 2. Get & set holoAuthSigDigest
	// 3. Get & set creds
	// 4. Get & set proof
	// 5. Submit proof tx

	const getCredentialsQuery = useQuery(
		["getCredentials", `${holoKeyGenSigDigest}${holoAuthSigDigest}`],
		() => getCredentials(holoKeyGenSigDigest, holoAuthSigDigest),
		{
			onSuccess: (sortedCredsTemp) => {
				if (sortedCredsTemp) {
					setSortedCreds(sortedCredsTemp);
				} else {
					setError({
						type: MINTING_ERROR_TYPE,
						message:
							"Could not retrieve credentials for proof. Please make sure you have minted your Holo.",
					});
				}
			},
			onError: (error) => {
        setError({
          type: MINTING_ERROR_TYPE,
          message: String(error)
        })
      },
			enabled: !!accountReadyAddress,
		},
	);

	const loadProofQuery = useQuery(
		["loadProof"],
		async () => {
			const creds = sortedCreds[serverAddress["idgov-v2"]];
			if (!creds) {
				throw new Error({
          type: NOGOV_ERROR_TYPE
        });
			}
			console.log("Loading proof");
			if (params.proofType === "us-residency") {
				return loadPoR(creds.creds.newSecret, creds.creds.serializedAsNewPreimage, accountReadyAddress);
			} else if (params.proofType === "uniqueness") {
				if (!params.actionId)
					console.error(
						`Warning: no actionId was given, using default of ${defaultActionId} (generic cross-action sybil resistance)`,
					);
				return loadAntiSybil(
					creds.creds.newSecret,
					creds.creds.serializedAsNewPreimage,
					accountReadyAddress,
					params.actionId || defaultActionId,
				);
			}
		},
		{
			enabled: !!accountReadyAddress && !!sortedCreds && params.proofType in proofs,
			onError: (error) => {
				if ("type" in error && error.type === NOGOV_ERROR_TYPE) {
					setCustomError(
						<p>
							To do this proof, your Holo must have a government ID. Please{" "}
							<a href="/mint/idgov" style={{ color: "#fdc094" }}>
								add a government ID
							</a>
						</p>,
					);
				} else {
					setError({
            type: LOAD_PROOF_TYPE,
            message: String(error)
          });
				}
			},
			onSuccess: (data) => {
				setProof(data);
			},
		},
	);

	const submitProofThenStoreMetadataQuery = useQuery(
		["submitProofThenStoreMetadata"],
		async () =>
			submitProofThenStoreMetadata(
				proof,
				proofs[params.proofType].contractName,
				params.proofType,
				params.actionId,
				holoAuthSigDigest,
				holoKeyGenSigDigest,
			),
		{
			enabled: !!(submissionConsent && sortedCreds && proof),
			onSuccess: (result) => {
        console.log('result from submitProofThenStoreMetadata')
        console.log(result)
				if (result.error) {
					console.log("error", result);
					setError({
            type: SUBMIT_PROOF,
            message: result?.error?.response?.data?.error?.reason ||
            result?.error?.message,
          });
					// TODO: At this point, display message to user that they are now signing to store their proof metadata
				} else {
          setProofSubmissionSuccess(true);
        }
			},
			onError: (error) => {
				console.log("error", error);
				setError({
					type: SUBMIT_PROOF,
					message: error?.response?.data?.error?.reason || error?.message,
				});
			}
		},
	);

	useEffect(() => {
		try {
			testMetamask(account);
		} catch (error) {
			setError(error);
		}
	}, [account, window.ethereum]);

  // submitProofThenStoreMetadataQuery.isSuccess was being set to true before the proof was actually submitted
	if (proofSubmissionSuccess) {
		if (params.callback) window.location.href = `https://${params.callback}`;
		if (window.localStorage.getItem('register-proofType')) {
			navigate(`/register?credentialType=${window.localStorage.getItem('register-credentialType')}&proofType=${window.localStorage.getItem('register-proofType')}&callback=${window.localStorage.getItem('register-callback')}`)
		}
		return <Success title="Success" />;
	}
	if (error && "type" in error) {
		if (error.type === METAMASK_ERROR_TYPE) {
			return (
				<ErrorScreen>
					<h3>
						Please install <a href="https://metamask.io/">Metamask</a>
					</h3>
				</ErrorScreen>
			);
		}
    // if (error.type === ) {

    // }
	}
	if (customError) {
		return <ErrorScreen>{customError}</ErrorScreen>;
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
				{!account?.address ? (
					<ConnectWalletScreen />
				) : (
					<>
						<h2>Prove {proofs[params.proofType].name}</h2>
						<div className="spacer-med" />
						<br />
						{error?.message ? (
							<p>Error: {error.message}</p>
						) : sortedCreds ? (
							<p>
								This will give you,
								<code> {truncateAddress(account.address)} </code>, a{" "}
								<a
									target="_blank"
									rel="noreferrer"
									href="https://cointelegraph.com/news/what-are-soulbound-tokens-sbts-and-how-do-they-work"
									style={{ color: "#fdc094" }}
								>
									soul-bound token
								</a>{" "}
								(SBT) showing only this one attribute of you:{" "}
								<code>{proofs[params.proofType].name}</code>. It may take 5-15
								seconds to load.
							</p>
						) : (
							<p>
								&nbsp;Note: You cannot generate proofs before minting a holo. If
								you have not already, please{" "}
								<a href="/mint" style={{ color: "#fdc094" }}>
									mint your holo
								</a>
								.
							</p>
						)}
						<div className="spacer-med" />
						<br />
						{sortedCreds ? (
							proof ? (
								<button
									className="x-button"
									onClick={() => setSubmissionConsent(true)}
								>
									{submissionConsent && submitProofThenStoreMetadataQuery.isFetching
										? "Submitting..."
										: "Submit proof"}
								</button>
							) : (
								<LoadingProofsButton />
							)
						) : (
							""
						)}
					</>
				)}
			</div>
		</RoundedWindow>
	);
};

export default Proofs;
