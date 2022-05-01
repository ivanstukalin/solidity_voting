
require("@nomiclabs/hardhat-web3");

task("vote", "To cast your vote for the candidate")
.addParam("candidate", "The address of the candidate")
.addParam("id", "Id of the created vote ")
.setAction(async taskArgs => {
    let candidate = taskArgs.candidate
    let voteId    = taskArgs.id
    let [owner, secondCandidate] = await ethers.getSigners();
    const VotingManager = await ethers.getContractFactory("VotingManager", owner)
    const votingManager = await VotingManager.deploy()
    await votingManager.addVoting([candidate, secondCandidate.address])
    await votingManager.vote(parseInt(voteId), candidate, {value: 10000000000000000n})
    let result = await votingManager.getVotingResults(parseInt(voteId), candidate)
    console.log(result)
});