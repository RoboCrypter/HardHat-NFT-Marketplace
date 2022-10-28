const { expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { devNetworks } = require("../helper-hardhat-config")


!devNetworks.includes(network.name) ? describe.skip

: describe("Testing NFTMarketplace Contract", () => {

    let deployer, user, nftMarketplace, basicNft, nftContractAddress

    const tokenId = 0

    const price = ethers.utils.parseEther("0.01")

    beforeEach("Deploying NFTMarketplace Contract...", async() => {

        const accounts = await ethers.getSigners()

        deployer = accounts[0]

        user = accounts[1]

        await deployments.fixture(["all"])

        nftMarketplace = await ethers.getContract("NFTMarketplace", deployer)

        basicNft = await ethers.getContract("BasicNFT", deployer)

        nftContractAddress = basicNft.address

        await basicNft.mintNft()
    })

    describe("listItem", () => {

        it("It should revert, If NFT lister is not the owner of that NFT", async() => {

            nftMarketplace = nftMarketplace.connect(user)

            await expect(nftMarketplace.listItem(nftContractAddress, tokenId, price)).to.be.revertedWith("NFTMarketplace__Not_Owner")
        })

        it("It should revert, If NFT is already been listed on the marketplace", async() => {

            await basicNft.approve(nftMarketplace.address, tokenId)

            await nftMarketplace.listItem(nftContractAddress, tokenId, price)

            await expect(nftMarketplace.listItem(nftContractAddress, tokenId, price)).to.be.revertedWith("NFTMarketplace__Already_Listed")
        })

        it("It should revert, If NFT price is <= 0", async() => {

            await expect(nftMarketplace.listItem(nftContractAddress, tokenId, 0)).to.be.revertedWith("NFTMarketplace__Price_Must_Not_Be_Zero")
        })

        it("It should revert, If NFT is not approved for marketplace", async() => {

            await expect(nftMarketplace.listItem(nftContractAddress, tokenId, price)).to.be.revertedWith("NFTMarketplace__Not_Approved_For_Marketplace")
        })

        it("It should list an NFT, If NFT is approved and price is > 0", async() => {

            await basicNft.approve(nftMarketplace.address, tokenId)

            await nftMarketplace.listItem(nftContractAddress, tokenId, price)

            const getListing = await nftMarketplace.getListing(nftContractAddress, tokenId)

            const listingPrice = getListing.price

            const listingOwner = getListing.seller

            expect(listingPrice).to.equal(price)

            expect(listingOwner).to.equal(deployer.address)
        })

        it("It should emits an event upon listing Item", async() => {

            await basicNft.approve(nftMarketplace.address, tokenId)

            await expect(nftMarketplace.listItem(nftContractAddress, tokenId, price)).to.emit(nftMarketplace, "NFTListed")
        })
    })

    describe("buyItem", () => {

        it("It should revert, If NFT is not been listed on the marketplace", async() => {

            await expect(nftMarketplace.buyItem(nftContractAddress, tokenId)).to.be.revertedWith("NFTMarketplace__Not_Listed")
        })

        it("It should revert, If buyer is the NFT owner", async() => {

            await basicNft.approve(nftMarketplace.address, tokenId)

            await nftMarketplace.listItem(nftContractAddress, tokenId, price)

            await expect(nftMarketplace.buyItem(nftContractAddress, tokenId, { value: price })).to.be.revertedWith("NFTMarketplace__Owner_Cannot_Buy_Its_Own_NFT")
        })

        it("It should revert, If buyer's price is less than listing price", async() => {

            await basicNft.approve(nftMarketplace.address, tokenId)

            await nftMarketplace.listItem(nftContractAddress, tokenId, price)

            nftMarketplace = nftMarketplace.connect(user)

            await expect(nftMarketplace.buyItem(nftContractAddress, tokenId)).to.be.revertedWith("NFTMarketplace__Price_Not_Met")
        })

        it("It should update proceeds of the seller after solding the NFT", async() => {

            await basicNft.approve(nftMarketplace.address, tokenId)

            await nftMarketplace.listItem(nftContractAddress, tokenId, price)
            
            nftMarketplace = nftMarketplace.connect(user)

            await nftMarketplace.buyItem(nftContractAddress, tokenId, { value: price })

            const sellerProceeds = await nftMarketplace.getProceeds(deployer.address)

            expect(sellerProceeds).to.equal(price)
        })

        it("It should emits an event upon solding the NFT", async() => {

            await basicNft.approve(nftMarketplace.address, tokenId)

            await nftMarketplace.listItem(nftContractAddress, tokenId, price)

            nftMarketplace = nftMarketplace.connect(user)

            await expect(nftMarketplace.buyItem(nftContractAddress, tokenId, { value: price })).to.emit(nftMarketplace, "NFTBought")
        })
    })

    describe("cancelListing", () => {

        it("It should revert, If NFT is not been listed on the marketplace", async() => {

            await expect(nftMarketplace.cancelListing(nftContractAddress, tokenId)).to.be.revertedWith("NFTMarketplace__Not_Listed")
        })

        it("It should revert, If the canceller is not the NFT owner", async() => {

            await basicNft.approve(nftMarketplace.address, tokenId)

            await nftMarketplace.listItem(nftContractAddress, tokenId, price)

            nftMarketplace = nftMarketplace.connect(user)

            await expect(nftMarketplace.cancelListing(nftContractAddress, tokenId)).to.be.revertedWith("NFTMarketplace__Not_Owner")
        })

        it("It should cancel listing, If canceller is the NFT owner and It is been listed on the marketplace", async() => {

            await basicNft.approve(nftMarketplace.address, tokenId)

            await nftMarketplace.listItem(nftContractAddress, tokenId, price)

            await nftMarketplace.cancelListing(nftContractAddress, tokenId)

            const getListing = await nftMarketplace.getListing(nftContractAddress, tokenId)

            const listingPrice = getListing.price

            expect(listingPrice).to.equal(0)
        })

        it("It should emits an event upon cancelling the NFT", async() => {

            await basicNft.approve(nftMarketplace.address, tokenId)

            await nftMarketplace.listItem(nftContractAddress, tokenId, price)

            await expect(nftMarketplace.cancelListing(nftContractAddress, tokenId)).to.emit(nftMarketplace, "NFTCancelled")
        })
    })

    describe("updateListing", () => {

        it("It should revert, If updater is not the NFT owner", async() => {

            await basicNft.approve(nftMarketplace.address, tokenId)

            await nftMarketplace.listItem(nftContractAddress, tokenId, price)

            const newPrice = ethers.utils.parseEther("0.02")

            nftMarketplace = nftMarketplace.connect(user)

            await expect(nftMarketplace.updateListing(nftContractAddress, tokenId, newPrice)).to.be.revertedWith("NFTMarketplace__Not_Owner")
        })

        it("It should revert, If NFT is not been listed on the marketplace", async() => {

            const newPrice = ethers.utils.parseEther("0.02")

            await expect(nftMarketplace.updateListing(nftContractAddress, tokenId, newPrice)).to.be.revertedWith("NFTMarketplace__Not_Listed")
        })

        it("It should update the listing, If updater is the NFT owner and It is been listed on the marketplace", async() => {

            await basicNft.approve(nftMarketplace.address, tokenId)

            await nftMarketplace.listItem(nftContractAddress, tokenId, price)

            const newPrice = ethers.utils.parseEther("0.02")

            await nftMarketplace.updateListing(nftContractAddress, tokenId, newPrice)

            const getListing = await nftMarketplace.getListing(nftContractAddress, tokenId)

            const updatedListingPrice = getListing.price

            expect(updatedListingPrice).to.equal(newPrice)
        })

        it("It should emits an event upon updating the NFT", async() => {

            await basicNft.approve(nftMarketplace.address, tokenId)

            await nftMarketplace.listItem(nftContractAddress, tokenId, price)

            const newPrice = ethers.utils.parseEther("0.02")

            await expect(nftMarketplace.updateListing(nftContractAddress, tokenId, newPrice)).to.emit(nftMarketplace, "NFTListed")
        })
    })

    describe("withdrawProceeds", () => {

        it("It should revert, If proceeds are <= 0", async() => {

            await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith("NFTMarketplace__No_Proceeds")
        })

        it("Proceeds owner should be able to withdraw proceeds", async() => {

            await basicNft.approve(nftMarketplace.address, tokenId)

            await nftMarketplace.listItem(nftContractAddress, tokenId, price)

            nftMarketplace = nftMarketplace.connect(user)

            await nftMarketplace.buyItem(nftContractAddress, tokenId, { value: price })

            const afterSoldingSellerProceeds = await nftMarketplace.getProceeds(deployer.address)

            nftMarketplace = nftMarketplace.connect(deployer)

            await nftMarketplace.withdrawProceeds()

            const afterWithdrawingSellerProceeds = await nftMarketplace.getProceeds(deployer.address)

            expect(afterSoldingSellerProceeds).to.equal(price)

            expect(afterWithdrawingSellerProceeds).to.equal(0)
        })
    })
})