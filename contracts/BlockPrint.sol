// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./Owner.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BlockPrint is Owner {
    using Counters for Counters.Counter;

    Counters.Counter tokenID;
    mapping(string => bool) private _doesCertificateExist;
    mapping(uint256 => string) private _idToURL;

    function mintCertificate(string memory _tokenURL)
        public
        isOwner
        returns (uint256 certificateId)
    {
        require(
            !_doesCertificateExist[_tokenURL],
            "The Certificate is already stored"
        );
        certificateId = tokenID.current();
        _idToURL[certificateId] = _tokenURL;
        _doesCertificateExist[_tokenURL] = true;
        tokenID.increment();
    }

    function fetchCertificate(uint256 certificateId)
        public
        view
        returns (string memory tokenURL)
    {
        tokenURL = _idToURL[certificateId];
    }
}
