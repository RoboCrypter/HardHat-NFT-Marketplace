// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


error ERC721__URI_QueryFor_NonExistent_Token();


/**
*@title A Basic NFT.
*@author ABossOfMyself.
*@notice A Basic NFT Smart Contract.
 */


contract BasicNFT is ERC721 {

    string public constant TOKEN_URI = "ipfs://QmRPjvXM6TifzW8DQPMEWXmNmtbfvdUvfAi7H4ufSmNPdb";

    uint256 private s_tokenCounter;


    event NFTMinted(uint256 indexed tokenId);


    constructor() ERC721("Smilies Collection", "Smilie") {
        
        s_tokenCounter = 0;
    }

    function mintNft() public {
        
        _safeMint(msg.sender, s_tokenCounter);

        emit NFTMinted(s_tokenCounter);

        s_tokenCounter = s_tokenCounter + 1;
    }


    function tokenURI(uint256 tokenId) public view override returns(string memory) {

        if (!_exists(tokenId)) revert ERC721__URI_QueryFor_NonExistent_Token();

        return TOKEN_URI;
    }


    function getTokenCounter() public view returns(uint256) {

        return s_tokenCounter;
    }
}
