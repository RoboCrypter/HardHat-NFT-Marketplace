const { ethers, network } = require("hardhat")
const { devNetworks } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")


const tokenId = 0


async function cancelNft() {

    const nftMarketplace = await ethers.getContract("NFTMarketplace")

    const basicNft = await ethers.getContract("BasicNFT")

    const nftContractAddress = basicNft.address

    const cancelListing = await nftMarketplace.cancelListing(nftContractAddress, tokenId)

    await cancelListing.wait(1)

    console.log("Cancelled...!")


    if(devNetworks.includes(network.name)) {

        await moveBlocks(1, (sleepAmount = 1000))
    }
}



cancelNft()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })