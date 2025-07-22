import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedGMContract = await deploy("GMContract", {
    from: deployer,
    log: true,
  });

  console.log(`GMContract: `, deployedGMContract.address);
};
export default func;
func.id = "deploy_GMContract"; // id required to prevent reexecution
func.tags = ["GMContract"];
