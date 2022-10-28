const { ethers, network } = require("hardhat")
const { devNetworks } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")


const tokenId = 0


async function buyNft() {

    let nftMarketplace = await ethers.getContract("NFTMarketplace")

    const basicNft = await ethers.getContract("BasicNFT")

    const nftContractAddress = basicNft.address

    const listing = await nftMarketplace.getListing(nftContractAddress, tokenId)

    const price = listing.price

    const accounts = await ethers.getSigners()

    const user = accounts[1]

    nftMarketplace = nftMarketplace.connect(user)

    const buyItem = await nftMarketplace.buyItem(nftContractAddress, tokenId, { value: price })

    await buyItem.wait(1)

    console.log("Bought...!")


    if(devNetworks.includes(network.name)) {

        await moveBlocks(1, (sleepAmount = 1000))
    }
}



buyNft()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })