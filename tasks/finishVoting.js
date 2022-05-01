require("@nomiclabs/hardhat-web3");

task("finish", "Finish voting")
.addParam("id", "Id of the created vote ")
.setAction(async taskArgs => {
    let voteId    = taskArgs.id
    let [owner, firstCandidate, secondCandidate] = await ethers.getSigners();
    const VotingManager = await ethers.getContractFactory("VotingManager", owner)
    const votingManager = await VotingManager.deploy()
    winner = firstCandidate.address
    await votingManager.addVoting([winner, secondCandidate.address])
    await votingManager.vote(parseInt(voteId), winner, {value: 10000000000000000n})
    await votingManager.finishVotingForce(voteId)
    console.log("Winner: " + winner)
});