// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


error NFTMarketplace__Price_Must_Not_Be_Zero();
error NFTMarketplace__Not_Approved_For_Marketplace();
error NFTMarketplace__Already_Listed(address NFTContractAddress, uint256 tokenId);
error NFTMarketplace__Not_Owner();
error NFTMarketplace__Not_Listed(address NFTContractAddress, uint256 tokenId);
error NFTMarketplace__Owner_Cannot_Buy_Its_Own_NFT(address NFTContractAddress, uint256 tokenId, address buyer);
error NFTMarketplace__Price_Not_Met(address NFTContractAddress, uint256 tokenId, uint256 price);
error NFTMarketplace__No_Proceeds();
error NFTMarketplace__Transfer_Failed();


/**
*@title A fully Decentralized NFT Marketplace.
*@author ABossOfMyself.
*@notice NFT Marketplace Contract.
*@dev This contract uses Openzeppelin-Contracts library.
 */


contract NFTMarketplace is ReentrancyGuard {

    struct Listing {
        
        uint256 price;
        address seller;
    }


    event NFTListed(address indexed seller, address indexed NFTContractAddress, uint256 indexed tokenId, uint256 price);

    event NFTBought(address indexed buyer, address indexed NFTContractAddress, uint256 indexed tokenId, uint256 price);

    event NFTCancelled(address indexed seller, address indexed NFTContractAddress, uint256 indexed tokenId);


    mapping(address => mapping(uint256 => Listing)) private s_listings;

    mapping(address => uint256) private s_proceeds;


    modifier notListed(address NFTContractAddress, uint256 tokenId, address owner) {
        
        Listing memory listing = s_listings[NFTContractAddress][tokenId];

        if(listing.price > 0) revert NFTMarketplace__Already_Listed(NFTContractAddress, tokenId);
        
        _;
    }


    modifier isOwner(address NFTContractAddress, uint256 tokenId, address lister) {

        IERC721 NFT = IERC721(NFTContractAddress);

        address owner = NFT.ownerOf(tokenId);

        if(lister != owner) revert NFTMarketplace__Not_Owner();

        _;
    }


    modifier isListed(address NFTContractAddress, uint256 tokenId) {

        Listing memory listing = s_listings[NFTContractAddress][tokenId];

        if(listing.price <= 0) revert NFTMarketplace__Not_Listed(NFTContractAddress, tokenId);

        _;
    }


    modifier notOwner(address NFTContractAddress, uint256 tokenId, address buyer) {

        IERC721 NFT = IERC721(NFTContractAddress);

        address owner = NFT.ownerOf(tokenId);

        if(buyer == owner) revert NFTMarketplace__Owner_Cannot_Buy_Its_Own_NFT(NFTContractAddress, tokenId, buyer);

        _;
    }


    function listItem(address NFTContractAddress, uint256 tokenId, uint256 price) external notListed(NFTContractAddress, tokenId, msg.sender) isOwner(NFTContractAddress, tokenId, msg.sender) {

        if(price <= 0) revert NFTMarketplace__Price_Must_Not_Be_Zero();

        IERC721 NFT = IERC721(NFTContractAddress);

        if(NFT.getApproved(tokenId) != address(this)) revert NFTMarketplace__Not_Approved_For_Marketplace();

        s_listings[NFTContractAddress][tokenId] = Listing(price, msg.sender);

        emit NFTListed(msg.sender, NFTContractAddress, tokenId, price);
    }


    function buyItem(address NFTContractAddress, uint256 tokenId) external payable isListed(NFTContractAddress, tokenId) notOwner(NFTContractAddress, tokenId, msg.sender) nonReentrant {

        Listing memory listedItems = s_listings[NFTContractAddress][tokenId];

        if(msg.value < listedItems.price) revert NFTMarketplace__Price_Not_Met(NFTContractAddress, tokenId, listedItems.price);

        s_proceeds[listedItems.seller] = s_proceeds[listedItems.seller] + msg.value;

        delete(s_listings[NFTContractAddress][tokenId]);

        IERC721(NFTContractAddress).safeTransferFrom(listedItems.seller, msg.sender, tokenId);

        emit NFTBought(msg.sender, NFTContractAddress, tokenId, listedItems.price);
    }


    function cancelListing(address NFTContractAddress, uint256 tokenId) external isOwner(NFTContractAddress, tokenId, msg.sender) isListed(NFTContractAddress, tokenId) {

        delete(s_listings[NFTContractAddress][tokenId]);

        emit NFTCancelled(msg.sender, NFTContractAddress, tokenId);
    }


    function updateListing(address NFTContractAddress, uint256 tokenId, uint256 newPrice) external isListed(NFTContractAddress, tokenId) isOwner(NFTContractAddress, tokenId, msg.sender) {

        s_listings[NFTContractAddress][tokenId].price = newPrice;

        emit NFTListed(msg.sender, NFTContractAddress, tokenId, newPrice);
    }


    function withdrawProceeds() external {

        uint256 proceeds = s_proceeds[msg.sender];

        if(proceeds <= 0) revert NFTMarketplace__No_Proceeds();

        s_proceeds[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{ value: proceeds }("");

        if(!success) revert NFTMarketplace__Transfer_Failed();
    }



    function getListing(address NFTContractAddress, uint256 tokenId) external view returns(Listing memory) {

        return s_listings[NFTContractAddress][tokenId];
    }


    function getProceeds(address seller) external view returns(uint256) {

        return s_proceeds[seller];
    }
}
