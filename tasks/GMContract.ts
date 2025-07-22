import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the FHECounter contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the FHECounter contract
 *
 *   npx hardhat --network localhost task:decrypt-count
 *   npx hardhat --network localhost task:increment --value 2
 *   npx hardhat --network localhost task:decrement --value 1
 *   npx hardhat --network localhost task:decrypt-count
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the FHECounter contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the FHECounter contract
 *
 *   npx hardhat --network sepolia task:decrypt-count
 *   npx hardhat --network sepolia task:increment --value 2
 *   npx hardhat --network sepolia task:decrement --value 1
 *   npx hardhat --network sepolia task:decrypt-count
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */

task("task:address", "Prints the GMContract address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const fheCounter = await deployments.get("GMContract");

  console.log("GMContract address is " + fheCounter.address);
});

task("task:decrypt-gmcount", "Calls the getGMCount() function of Counter Contract")
  .addOptionalParam("address", "Optionally specify the Counter contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const GMContractDeployement = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("GMContract");
    console.log(`GMContract: ${GMContractDeployement.address}`);

    const signers = await ethers.getSigners();

    const fheGMContract = await ethers.getContractAt("GMContract", GMContractDeployement.address);

    const encryptedCount = await fheGMContract.getGMCount();
    if (encryptedCount === ethers.ZeroHash) {
      console.log(`encrypted count: ${encryptedCount}`);
      console.log("clear count    : 0");
      return;
    }

    const clearCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCount,
      GMContractDeployement.address,
      signers[0],
    );
    console.log(`Encrypted count: ${encryptedCount}`);
    console.log(`Clear count    : ${clearCount}`);
  });

task("task:decrypt-timestamp", "Calls the getTimestamp() function of Counter Contract")
  .addOptionalParam("address", "Optionally specify the Counter contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const GMContractDeployement = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("GMContract");
    console.log(`GMContract: ${GMContractDeployement.address}`);

    const signers = await ethers.getSigners();

    const fheGMContract = await ethers.getContractAt("GMContract", GMContractDeployement.address);

    const encryptedTimestamp = await fheGMContract.getTimestamp();
    if (encryptedTimestamp === ethers.ZeroHash) {
      console.log(`encrypted timestamp: ${encryptedTimestamp}`);
      console.log("clear timestamp    : 0");
      return;
    }

    const clearTimestamp = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedTimestamp,
      GMContractDeployement.address,
      signers[0],
    );
    console.log(`Encrypted timestamp: ${encryptedTimestamp}`);
    console.log(`Clear timestamp    : ${clearTimestamp}`);
  });

task("task:gm", "Calls the gm() function of GMContract Contract")
  .addOptionalParam("address", "Optionally specify the GMContract contract address")
  .addParam("value", "The gm value")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const value = parseInt(taskArguments.value);
    if (!Number.isInteger(value)) {
      throw new Error(`Argument --value is not an integer`);
    }

    await fhevm.initializeCLIApi();

    const GMContractDeployement = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("GMContract");
    console.log(`GMContract: ${GMContractDeployement.address}`);

    const signers = await ethers.getSigners();

    const fheGMContract = await ethers.getContractAt("GMContract", GMContractDeployement.address);

    // Encrypt the value passed as argument
    const encryptedValue = await fhevm
      .createEncryptedInput(GMContractDeployement.address, signers[0].address)
      .add32(value)
      .encrypt();

    const tx = await fheGMContract.connect(signers[0]).gm(encryptedValue.handles[0], encryptedValue.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const newEncryptedCount = await fheGMContract.getGMCount();
    console.log("Encrypted count after gm:", newEncryptedCount);

    console.log(`GMContract gm(${value}) succeeded!`);
  });
