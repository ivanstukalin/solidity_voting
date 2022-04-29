//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract VotingOrganizer {

    struct Voting {
        uint256   id;
        uint      creationDate;
        address[] candidateList;
        uint      moneyReceived;
        bool      isFinished;
    }

    uint     public votingPrice;
    uint     public commission;

    address  private _owner;
    Voting[] private _votings;

    mapping(uint256 => mapping (address => uint256)) _results;
    mapping(uint256 => address[]) _votedVoters;

    constructor() {
        _owner      = msg.sender;
        votingPrice = 0.01 ether;
        commission  = 10;
    }

    function addVoting(address[] memory addressesOfCandidates) ownerAccess public {
        uint256 votingId = _votings.length;
        
        Voting memory newVoting = Voting(votingId, block.timestamp, addressesOfCandidates, 0, false);
        _votings.push(newVoting);
        
        for (uint256 i = 0; i < addressesOfCandidates.length; i++) {
            _results[votingId][addressesOfCandidates[i]] = 0;
        }
    }

    function vote(uint256 votingId, address candidate) votingActvie(votingId) public payable {
        require(msg.value >= votingPrice, "Sum must be greater than 0,01 ETH"); 
        Voting memory voting = _getVoting(votingId); 
        _isCandidateInVoting(voting, candidate);
        require(!_hasVoterAlreadyVote(voting.id, msg.sender), "You have already voted!");
        
        _votings[voting.id].moneyReceived = _votings[voting.id].moneyReceived + msg.value;
        ++_results[voting.id][candidate];
        _votedVoters[voting.id].push(msg.sender);
    }

    function getVotings() public view returns (Voting[] memory) {
       return _votings;
    }

    function getVotingResults(uint256 votingId, address candidate) public view returns (uint256){
        Voting memory voting = _getVoting(votingId); 
        _isCandidateInVoting(voting, candidate);
        return _results[voting.id][candidate];
    }

    function getVotingCandidateList(uint256 votingId) public view returns (address[] memory) {
        Voting memory voting = _getVoting(votingId);
        return voting.candidateList;
    }

    function finishVoting(uint votingId) votingActvie(votingId) public returns (address) {
        Voting memory voting = _getVoting(votingId);
        require(voting.creationDate + 3 days < block.timestamp, "The voting has not been finished yet.");
        return _finishVoting(voting);
    }

    function finishVotingForce(uint votingId) ownerAccess() votingActvie(votingId) public returns (address) {
        Voting memory voting = _getVoting(votingId);
        return _finishVoting(voting);
    }

    function withdrawCommision() ownerAccess public {
        address payable _to   = payable(_owner);
        address _thisContract = address(this);  

        _to.transfer(_thisContract.balance);
    }

    function _finishVoting(Voting memory voting) private returns (address) {
        uint256 sum           = 0;
        address winnerAddress = _getWinner(voting);
        address payable _to   = payable(winnerAddress);
        sum                   = voting.moneyReceived * (100-commission)/100;
        
        _to.transfer(sum);

        voting.isFinished = true;
        return winnerAddress;
    }

    function _getWinner(Voting memory voting) private view returns (address) {
        uint256 winningVoteCount = 0;
        uint256 voteCount        = 0;
        uint256 winnerId         = 0;
        bool isSingleWinner      = true;
        for (uint256 p = 0; p < voting.candidateList.length; p++) {
            voteCount = _results[voting.id][voting.candidateList[p]];
            if (voteCount == winningVoteCount) {
                isSingleWinner = false;
            }
            if (voteCount > winningVoteCount) {
                winningVoteCount = voteCount;
                winnerId         = voting.id;
                isSingleWinner   = true;
            }
        }
        require(winningVoteCount != 0, "There are no one voted");
        require(isSingleWinner, "There must be one winner in the voting.");
        return voting.candidateList[winnerId];
    }


    function _hasVoterAlreadyVote(uint256 votingId, address voter) private view returns (bool) {
        for (uint256 i = 0; i < _votedVoters[votingId].length; i++) {
            if (_votedVoters[votingId][i] == voter) {
                return true;
            }
        }
        return false;
    }

    function _getVoting(uint256 votingId) private view returns (Voting memory) {
        if (votingId == 0) {
            return _votings[0];
        }
        
        uint256 id = 0;
        for (uint256 i; i < _votings.length; i++) {
            if (_votings[i].id == votingId) {
                id = votingId;
            }
        } 
        require(id > 0, "Unexpected voting id");
        return _votings[id];
    }

    function _isCandidateInVoting(Voting memory voting, address candidate) private pure {
        bool isCandidateInVoting = false;
        for (uint256 i; i < voting.candidateList.length; i++) {
            if (voting.candidateList[i] == candidate) {
                isCandidateInVoting = true;
            }
        }
        require(isCandidateInVoting, "Candidate does not exist");
    }

    modifier ownerAccess() {
        require(msg.sender == _owner, "Has no rights");
        _;
    }

    modifier votingActvie(uint256 votingId) {
        require(_votings[votingId].isFinished == false, "Voting has been finished!");
        _;
    }
}