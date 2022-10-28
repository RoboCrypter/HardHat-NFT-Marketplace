const { network } = require("hardhat")


async function sleep(timeInMilisecond) {

    return new Promise((resolve) => setTimeout(resolve, timeInMilisecond))
}


async function moveBlocks(amount, sleepAmount = 0) {

    for(let index = 0; index < amount; index++) {

        await network.provider.request({ method: "evm_mine", prams: [] })
    }

    if(sleepAmount) {

        console.log(`Sleeping for ${sleepAmount} milisecond`)

        await sleep(sleepAmount)
    }
}


module.exports = { moveBlocks, sleep }