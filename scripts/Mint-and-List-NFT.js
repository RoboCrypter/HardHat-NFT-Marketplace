const { ethers, network } = require("hardhat")
const { devNetworks } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")


const price = ethers.utils.parseEther("0.01")


async function mintAndListNft() {

    const nftMarketplace = await ethers.getContract("NFTMarketplace")

    const basicNft = await ethers.getContract("BasicNFT")

    const nftContractAddress = basicNft.address

    const mintNft = await basicNft.mintNft()

    console.log("Minted...!")

    const mintNftReceipt = await mintNft.wait(1)

    const tokenId = mintNftReceipt.events[0].args.tokenId

    await basicNft.approve(nftMarketplace.address, tokenId)

    await nftMarketplace.listItem(nftContractAddress, tokenId, price)
    
    console.log("Listed...!")


    if(devNetworks.includes(network.name)) {

        await moveBlocks(1, (sleepAmount = 1000))
    }
}



mintAndListNft()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })