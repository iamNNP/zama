// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/bundle";
// import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./fheConfig";
import { useEffect, useState, type ReactNode } from "react";
import { initSDK, createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/bundle";
import { ethers } from "ethers";
import type { EIP712, FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";
import { GM_CONTRACT_ADDRESS, CONTRACT_ABI, FHE_COUNTER_BYTECODE, FHE_COUNTER_ABI } from "./fheConfig";
import "./App.css";

let instance: any = null;
let keypair: any = null;
let signer: any = null;
let contract: any = null;
let eip712: any = null;
let startTimestamp: any = null;

async function initInstance() {
  await initSDK(); // Load FHE
  const config = { ...SepoliaConfig, network: window.ethereum };
  instance = await createInstance(config);
  return instance;
}

async function getInstance() {
  return instance;
}

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  // useEffect(() => {
  //   const setup = async () => {
  //     const provider = new ethers.BrowserProvider(window.ethereum);
  //     await provider.send("eth_requestAccounts", []);
  //     signer = await provider.getSigner();
  //     await initInstance();

  //     contract = new ethers.Contract(GM_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  //     console.log("instance : ", getInstance());
  //     console.log("signer: ", signer);
  //     console.log("contract: ", contract);
  //   };

  //   setup();
  // }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    const address = await signer.getAddress();
    setAccount(address);
    setConnected(true);

    await initInstance();
    contract = new ethers.Contract(GM_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    console.log("instance : ", getInstance());
    console.log("signer: ", signer);
    console.log("contract: ", contract);
  };

  // const refresh = async () => {
  //   const enc = await contract.getCount();
  //   console.log("Enc: ", enc);

  //   instance = await getInstance();
  //   keypair = await instance.generateKeypair();
  //   const handleContractPairs = [
  //     {
  //       handle: String(enc),
  //       contractAddress: GM_CONTRACT_ADDRESS,
  //     },
  //   ];
  //   startTimestamp = Math.floor(Date.now() / 1000).toString();
  //   const durationDays = "10"; // String for consistency
  //   const contractAddresses = [GM_CONTRACT_ADDRESS];

  //   eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimestamp, durationDays);

  //   const signature = await signer.signTypedData(
  //     eip712.domain,
  //     {
  //       UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
  //     },
  //     eip712.message,
  //   );

  //   const result = await instance.userDecrypt(
  //     handleContractPairs,
  //     keypair.privateKey,
  //     keypair.publicKey,
  //     signature.replace("0x", ""),
  //     contractAddresses,
  //     signer.address,
  //     startTimestamp,
  //     durationDays,
  //   );

  //   const dec = result[String(enc)];
  //   console.log("Dec: ", dec);
  //   setCount(dec.toString());
  // };

  const gm = async () => {
    const encryptedInput = await instance.createEncryptedInput(GM_CONTRACT_ADDRESS, await signer.getAddress());
    encryptedInput.add32(1);
    const { handles, inputProof } = await encryptedInput.encrypt();

    await contract.gm(handles[0], inputProof);
  };

  const deployContract = async (signer: ethers.Signer) => {
    const factory = new ethers.ContractFactory(FHE_COUNTER_ABI, FHE_COUNTER_BYTECODE, signer);
    const contract = await factory.deploy(); // Add constructor args if needed
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    alert(`Contract deployed at: ${address}`);
    return address;
  };

  if (!window.ethereum)
    return (
      <>
        <div className="App">You need to use a browser with an Ethereum wallet.</div>
      </>
    );

  return (
    <>
      <h1>GMZAMA</h1>
      {!connected ? (
        <button onClick={connectWallet} className="connect-button">
          Connect Wallet
        </button>
      ) : (
        <>
          <button disabled className="connect-button">
            Connected as: {account?.substring(0, 5) + "..." + account?.substring(account.length - 3, account.length)}
          </button>
          <button onClick={gm}>GM</button>
          <br />
          <br />
          <br />
          {connected && <button onClick={() => deployContract(signer)}>Deploy Contract</button>}
        </>
      )}
    </>
  );
}

export default App;
