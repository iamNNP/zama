// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConfidentialERC20 is SepoliaConfig {
    mapping(address => euint64) private balances;

    string public name = "ConfidentialToken";
    string public symbol = "CFT";
    uint8 public decimals = 18;

    constructor(address initialHolder, uint64 initialSupply) {
        balances[initialHolder] = FHE.asEuint64(initialSupply);
        FHE.allowThis(balances[initialHolder]);
        FHE.allow(balances[initialHolder], initialHolder);
    }

    function balanceOf() external view returns (euint64) {
        return balances[msg.sender];
    }

    function transfer(externalEuint64 encryptedAmount, address to, bytes calldata proof) external {
        // require(FHE.isSenderAllowed(encryptedAmount), "The caller is not authorized to access this encrypted amount.");
        euint64 amount = FHE.fromExternal(encryptedAmount, proof);
        euint64 senderBal = balances[msg.sender];
        euint64 receiverBal = balances[to];

        euint64 newSenderBal = FHE.sub(senderBal, amount);
        euint64 newReceiverBal = FHE.add(receiverBal, amount);

        balances[msg.sender] = newSenderBal;
        balances[to] = newReceiverBal;

        FHE.allowThis(newSenderBal);
        FHE.allowThis(newReceiverBal);
        FHE.allow(newSenderBal, msg.sender);
        FHE.allow(newReceiverBal, to);
    }
}
