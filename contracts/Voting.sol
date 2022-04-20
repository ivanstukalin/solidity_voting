//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract Voting {

    struct Vote {
        uint256   id;
        uint      creationDate;
        address[] candidateList;
        bool      isFinished;
    }

    address private owner;
    Vote[] private votes;

    constructor() {
        owner = msg.sender;
    }

    function addVoting(address[] memory addressesOfCandidates) ownerAccess public payable {
        uint256 voteId = votes.length + 1;
        Vote memory vote = Vote(voteId, block.timestamp, addressesOfCandidates, false);
        votes.push(vote);
    }

    function getVoting() public view returns (Vote[] memory) {
       return votes;
    }

    modifier ownerAccess() {
        require(msg.sender == owner);
        _;
    }
}