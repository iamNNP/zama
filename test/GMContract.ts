import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { GMContract, GMContract__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("GMContract")) as GMContract__factory;
  const fheGMContract = (await factory.deploy()) as GMContract;
  const fheGMContractAddress = await fheGMContract.getAddress();

  return { fheGMContract, fheGMContractAddress };
}

describe("GMContract", function () {
  let signers: Signers;
  let fheGMContract: GMContract;
  let fheGMContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async () => {
    if (!fhevm.isMock) {
      throw new Error(`This hardhat test suite cannot run on Sepolia Testnet`);
    }
    ({ fheGMContract, fheGMContractAddress } = await deployFixture());
  });

  it("encrypted GM count should be uninitialized after deployment", async function () {
    const encryptedGMCount = await fheGMContract.getGMCount();
    expect(encryptedGMCount).to.eq(ethers.ZeroHash);
  });

  it("encrypted timestamp should be uninitialized after deployment", async function () {
    const encryptedTimestamp = await fheGMContract.getTimestamp();
    expect(encryptedTimestamp).to.eq(ethers.ZeroHash);
  });

  it("should perform GM and increment encrypted count by 1", async function () {
    const clearOne = 1;
    const encryptedOne = await fhevm
      .createEncryptedInput(fheGMContractAddress, signers.alice.address)
      .add32(clearOne)
      .encrypt();

    await fheGMContract.connect(signers.alice).gm(encryptedOne.handles[0], encryptedOne.inputProof);

    const encryptedGMCount = await fheGMContract.connect(signers.alice).getGMCount();
    const clearGMCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedGMCount,
      fheGMContractAddress,
      signers.alice,
    );

    expect(clearGMCount).to.equal(1);
  });

  it("should skip GM increment if called too early", async function () {
    const clearOne = 1;
    const encryptedOne = await fhevm
      .createEncryptedInput(fheGMContractAddress, signers.alice.address)
      .add32(clearOne)
      .encrypt();

    // First call initializes and sets timestamp
    await fheGMContract.connect(signers.alice).gm(encryptedOne.handles[0], encryptedOne.inputProof);

    // Immediate second call should be too early (FHE.select prevents increment)
    await fheGMContract.connect(signers.alice).gm(encryptedOne.handles[0], encryptedOne.inputProof);

    const encryptedGMCount = await fheGMContract.connect(signers.alice).getGMCount();
    const clearGMCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedGMCount,
      fheGMContractAddress,
      signers.alice,
    );

    expect(clearGMCount).to.equal(1); // should not increment again
  });
});
