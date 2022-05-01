
task("startVoting", "Start voting with 2 candidates")
.setAction(async function () {
    [owner, firstCandidate, secondCandidate] = await ethers.getSigners()
    const VotingManager = await ethers.getContractFactory("VotingManager", owner)
    const votingManager = await VotingManager.deploy()
    await votingManager.addVoting([firstCandidate.address, secondCandidate.address])
});