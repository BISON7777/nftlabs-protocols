import hre, { ethers } from "hardhat";

async function verify() {
  const txhash = "";
  const types = [
    "Coin",
    "LazyMintERC721",
    "LazyMintERC1155",
    "VotingGovernor",
    "Marketplace",
    "LazyNFT",
    "NFT",
    "NFTCollection",
    "Royalty",
    "Pack",
    "DataStore",
    "Market",
  ];

  const tx = await ethers.provider.getTransaction(txhash);
  const txdata = tx.data;
  const address = (tx as any).creates;

  console.log("txhash", txhash, address, txdata.length);

  for (const type of types) {
    let contract;
    try {
      contract = await ethers.getContractFactory(type);
    } catch (e) {
      console.log("invalid artifacts", type);
      continue;
    }
    const { bytecode, deployedBytecode } = await hre.artifacts.readArtifact(type);

    // make sure that deployed bytecode matches with contract bytecode
    if (txdata.indexOf(bytecode) === -1) {
      //console.log("txdata", txdata, txdata.length);
      //console.log("bytecode", bytecode, bytecode.length);
      console.log("invalid contract bytecode", type);
      continue;
    }

    const paramsData = `0x${txdata.substring(bytecode.length)}`;
    const paramsDeployed = ethers.utils.defaultAbiCoder.decode(contract.interface.deploy.inputs, paramsData);
    const paramsArguments = paramsDeployed.toString().split(",");
    await hre.run("verify:verify", {
      address,
      constructorArguments: [...paramsArguments],
    });
    break;
  }
}

verify()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
