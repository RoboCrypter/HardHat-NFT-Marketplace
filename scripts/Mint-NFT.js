const { ethers, network } = require("hardhat")
const { devNetworks } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")


async function mintNft() {

    const basicNft = await ethers.getContract("BasicNFT")

    const nftContractAddress = basicNft.address

    const mintNft = await basicNft.mintNft()

    const mintNftReceipt = await mintNft.wait(1)

    const tokenId = mintNftReceipt.events[0].args.tokenId

    console.log("Minted...!")

    console.log(`Token ID : ${tokenId}`)

    console.log(`NFT Contract Address : ${nftContractAddress}`)


    if(devNetworks.includes(network.name)) {

        await moveBlocks(1, (sleepAmount = 1000))
    }
}



mintNft()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })