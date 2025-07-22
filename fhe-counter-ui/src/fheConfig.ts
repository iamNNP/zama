export const GM_CONTRACT_ADDRESS = "0xd97586504caaF0F20A3B2C6CBAbbc33BAf34Be2f";

export const CONTRACT_ABI = [
  {
    inputs: [],
    name: "getGMCount",
    outputs: [
      {
        internalType: "euint32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTimestamp",
    outputs: [
      {
        internalType: "euint64",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "externalEuint32",
        name: "inputEuint32",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "inputProof",
        type: "bytes",
      },
    ],
    name: "gm",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
