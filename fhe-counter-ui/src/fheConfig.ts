export const CONTRACT_ADDRESS = "0x0Ef03A3973c0B5A25D1df08a0671722f661Eb30b";

export const CONTRACT_ABI = [
    {
        "inputs": [
        {
            "internalType": "externalEuint32",
            "name": "inputEuint32",
            "type": "bytes32"
        },
        {
            "internalType": "bytes",
            "name": "inputProof",
            "type": "bytes"
        }
        ],
        "name": "decrement",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCount",
        "outputs": [
        {
            "internalType": "euint32",
            "name": "",
            "type": "bytes32"
        }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
        {
            "internalType": "externalEuint32",
            "name": "inputEuint32",
            "type": "bytes32"
        },
        {
            "internalType": "bytes",
            "name": "inputProof",
            "type": "bytes"
        }
        ],
        "name": "increment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]; 