const fs = require('fs');

async function main() {
  const VotingManager = await hre.ethers.getContractFactory("VotingManager");
  const votingManager = await VotingManager.deploy([]);

  await votingManager.deployed();

  console.log("Voting deployed to:", votingManager.address);

  const config = {
    address: votingManager.address
  }

  fs.writeFileSync("./app/__config.json", JSON.stringify(config, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });