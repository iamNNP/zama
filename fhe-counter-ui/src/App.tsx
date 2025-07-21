// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/bundle";
// import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./fheConfig";
import { useEffect, useState, type ReactNode } from "react";
import { initSDK, createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/bundle";
import { ethers } from "ethers";
import type { EIP712, FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./fheConfig";
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
  const [count, setCount] = useState<any>(null);
  useEffect(() => {
    const setup = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = await provider.getSigner();
      await initInstance();

      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      console.log("instance : ", getInstance());
      console.log("signer: ", signer);
      console.log("contract: ", contract);
    };

    setup();
  }, []);

  const refresh = async () => {
    const enc = await contract.getCount();
    console.log("Enc: ", enc);

    instance = await getInstance();
    keypair = await instance.generateKeypair();
    const handleContractPairs = [
      {
        handle: String(enc),
        contractAddress: CONTRACT_ADDRESS,
      },
    ];
    startTimestamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "10"; // String for consistency
    const contractAddresses = [CONTRACT_ADDRESS];

    eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimestamp, durationDays);

    const signature = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
      },
      eip712.message,
    );

    const result = await instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace("0x", ""),
      contractAddresses,
      signer.address,
      startTimestamp,
      durationDays,
    );

    const dec = result[String(enc)];
    console.log("Dec: ", dec);
    setCount(dec.toString());
  };

  const increment = async () => {
    const encryptedInput = await instance.createEncryptedInput(CONTRACT_ADDRESS, await signer.getAddress());
    encryptedInput.add32(1);
    const { handles, inputProof } = await encryptedInput.encrypt();

    await contract.increment(handles[0], inputProof);
    await refresh();
  };

  if (!window.ethereum)
    return (
      <>
        <div className="App">You need to use a browser with an Ethereum wallet.</div>
      </>
    );

  return (
    <>
      <h1>FHE Counter</h1>
      <p>Value: {count}</p>
      <button onClick={increment}>+1</button>
      <br />
      <br />
      <br />
      <button onClick={refresh}>Refresh</button>
    </>
  );
}

export default App;
