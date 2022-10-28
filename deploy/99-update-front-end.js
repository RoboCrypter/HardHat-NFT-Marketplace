const { ethers, network } = require("hardhat")
const fs = require("fs")


const FRONT_END_CONTRACT_ADDRESSES_FILE_LOCATION = "../nextjs-nft-marketplace-moralis/constants/networkMapping.json"

const FRONT_END_ABI_FILES_LOCATION = "../nextjs-nft-marketplace-moralis/constants/"


module.exports = async() => {

    if(process.env.UPDATE_FRONT_END) {

        await updateContractAddresses()

        await updateABIs()

        console.log("Front End has been Updated...!")
    }
}


async function updateContractAddresses() {

    const nftMarketplace = await ethers.getContract("NFTMarketplace")

    const chainId = network.config.chainId

    const contractAddresses = JSON.parse(fs.readFileSync(FRONT_END_CONTRACT_ADDRESSES_FILE_LOCATION, "utf8"))

    if(chainId in contractAddresses) {

        if(!contractAddresses[chainId]["NFTMarketplace"].includes(nftMarketplace.address)) {

            contractAddresses[chainId]["NFTMarketplace"].push(nftMarketplace.address)

        }

    } else {

        contractAddresses[chainId] = {"NFTMarketplace": [nftMarketplace.address]}
    }

    fs.writeFileSync(FRONT_END_CONTRACT_ADDRESSES_FILE_LOCATION, JSON.stringify(contractAddresses))
}


async function updateABIs() {

    const nftMarketplace = await ethers.getContract("NFTMarketplace")

    fs.writeFileSync(`${FRONT_END_ABI_FILES_LOCATION}NFTMarketplace.json`, nftMarketplace.interface.format(ethers.utils.FormatTypes.json))


    const basicNft = await ethers.getContract("BasicNFT")

    fs.writeFileSync(`${FRONT_END_ABI_FILES_LOCATION}BasicNFT.json`, basicNft.interface.format(ethers.utils.FormatTypes.json))
}


module.exports.tags = ["all", "frontend"]