// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    FHE,
    euint8,
    externalEuint8,
    euint32,
    externalEuint32,
    euint64,
    externalEuint64,
    ebool
} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "hardhat/console.sol";

/// @title A simple FHE counter contract
contract GMContract is SepoliaConfig {
    /// @notice Mapping from GMer to thier GM count.
    mapping(address account => euint32 gmCount) private gmCounts;

    /// @notice Mapping from GMer to thier last GM timestamp.
    mapping(address account => euint64 time) private timestamps;

    /// @notice Returns the gmCount.
    function getGMCount() external view returns (euint32) {
        return gmCounts[msg.sender];
    }

    /// @notice Returns the timestamp.
    function getTimestamp() external view returns (euint64) {
        return timestamps[msg.sender];
    }

    /// @notice Does a GM
    function gm(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);
        euint64 nextGMTime;
        if (!FHE.isInitialized(gmCounts[msg.sender])) {
            gmCounts[msg.sender] = FHE.asEuint32(0);
            timestamps[msg.sender] = FHE.asEuint64(uint64(block.timestamp));
            nextGMTime = timestamps[msg.sender];
        } else {
            euint64 midday = FHE.asEuint64(12 * 60 * 60);
            nextGMTime = FHE.add(timestamps[msg.sender], midday);
        }

        euint64 time = FHE.asEuint64(uint64(block.timestamp));
        ebool tooEarly = FHE.lt(time, nextGMTime);
        euint32 gmCountBefore = gmCounts[msg.sender];
        euint32 gmCountAfter = FHE.select(tooEarly, gmCountBefore, FHE.add(gmCountBefore, encryptedEuint32));
        gmCounts[msg.sender] = gmCountAfter;
        timestamps[msg.sender] = FHE.select(tooEarly, timestamps[msg.sender], FHE.asEuint64(uint64(block.timestamp)));

        // like chmod 777 for contract and sender
        FHE.allowThis(gmCounts[msg.sender]);
        FHE.allow(gmCounts[msg.sender], msg.sender);
        FHE.allowThis(timestamps[msg.sender]);
        FHE.allow(timestamps[msg.sender], msg.sender);
    }
}
