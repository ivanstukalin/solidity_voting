const { expect } = require("chai");
const { ethers } = require("hardhat");

const VOTING_PRICE = 10000000000000000n;

describe("Voting", function () {
  let owner
  let firstCandidate
  let secondCandidate
  let thirdCandidate
  let firstVoter
  let secondVoter
  let votingManager

  beforeEach(async function() {
    [owner, firstCandidate, secondCandidate, thirdCandidate, fourthCandidate, firstVoter, secondVoter] = await ethers.getSigners()
    const VotingManager = await ethers.getContractFactory("VotingManager", owner)
    votingManager = await VotingManager.deploy()
    await votingManager.deployed()
    await votingManager.addVoting([firstCandidate.address, secondCandidate.address])
    await votingManager.addVoting([thirdCandidate.address, fourthCandidate.address])
  })

  it("should be deployed", async function() {
    expect(votingManager.address).to.be.properAddress
  })

  it("Votings have been created", async function() {
    let createdVotings = await votingManager.getVotings()
    expect(createdVotings.length).to.equal(2)
  })

  it("Vote proccess", async function(){
    await votingManager.connect(firstVoter).vote(0, secondCandidate.address, {value: VOTING_PRICE})
    await votingManager.connect(secondVoter).vote(0, secondCandidate.address, {value: VOTING_PRICE})
    let voteCount = await votingManager.getVotingResults(0, secondCandidate.address);
    expect(voteCount).to.equal(2)
  })

  it("Voting finished", async function() {
    await votingManager.connect(firstVoter).vote(1, thirdCandidate.address, {value: VOTING_PRICE})
    await votingManager.connect(secondVoter).vote(1, thirdCandidate.address, {value: VOTING_PRICE})
    await votingManager.vote(1, thirdCandidate.address, {value: VOTING_PRICE})
    await votingManager.finishVotingForce(1);
    let createdVotings = await votingManager.getVotings()
    expect(createdVotings[1].isFinished).to.equal(true)
  })

  it("winner's balance should be correct after finish", async function() {
    await votingManager.vote(0, firstCandidate.address, {value: VOTING_PRICE})
    await votingManager.connect(firstVoter).vote(0, firstCandidate.address, {value: VOTING_PRICE})
    const tx = await votingManager.finishVotingForce(0)
    await expect(() => tx)
      .to.changeEtherBalances([firstCandidate], [18000000000000000n]);
  })

  it("Amount of voter's payment should be correct", async function() {
    const tx = await votingManager.connect(firstVoter).vote(0, secondCandidate.address, {value: VOTING_PRICE})
    await expect(() => tx)
      .to.changeEtherBalances([firstVoter], [-VOTING_PRICE]);
  })

  it("Owner's balance should be correct after finish", async function() {
    await votingManager.vote(0, firstCandidate.address, {value: VOTING_PRICE})
    await votingManager.connect(firstVoter).vote(0, firstCandidate.address, {value: VOTING_PRICE})
    await votingManager.finishVotingForce(0);
    const tx = await votingManager.withdrawCommision()
    await expect(() => tx)
      .to.changeEtherBalances([owner], [2000000000000000n]);
  })
});