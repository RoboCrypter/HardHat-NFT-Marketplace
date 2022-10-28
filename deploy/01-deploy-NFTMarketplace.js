const { network } = require("hardhat")
const { devNetworks } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")


module.exports = async ({ getNamedAccounts, deployments}) => {

    const { deploy, log } = deployments

    const { deployer } = await getNamedAccounts()


    const NftMarketplace = await deploy("NFTMarketplace", {

        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    log("NFTMarketplace deployed...!")

    log("-----------------------------------------")


    if(!devNetworks.includes(network.name) && process.env.ETHERSCAN_API_KEY) {

        await verify(NftMarketplace.address, [])
    }
}


module.exports.tags = ["all", "NftMarketplace"]