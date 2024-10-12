import elliptic from 'elliptic';
import sha256 from 'sha256';
import fetch from 'node-fetch';

/*******************************************************************************

 CIRCULAR LAYER 1 BLOCKCHAIN PROTOCOL INTERFACE LIBRARY
 License : Open Source for private and commercial use

 CIRCULAR GLOBAL LEDGERS, INC. - USA


 Version : 1.0.11

 Creation: 7/12/2022
 Update  : 12/10/2024

 Originator: Gianluca De Novi, PhD
 Contributors: Danny De Novi, redorc83

 *******************************************************************************/

/*
 *   Circular Class
 */
let CircularProtocolAPI = (function(){


    // Support Node Software Version
    const version = '1.0.8';

    // Library Errors Variable
    let LastError;

    // Helper function for error handling
    function handleError(error) {
        console.error('Error:', error);
        LastError = error.message || 'An unknown error occurred';
        return { success: false, error: LastError };
    }

    /*
     *  Retrieves the Library Error
     */
    function GetError(){  return LastError; }

    function hashString(str) {
        return sha256(str);
    }

    /* HELPER FUNCTIONS ***********************************************************/


    /*
     * Function to add a leading zero to numbers less than 10
     * num : number to pad
     *
     */
    function padNumber(num) {
        return num < 10 ? '0' + num : num;
    }




    /*
     *  Generate Timestamp formated
     *  YYYY:MM:DD-hh:mm:ss
     */
    function getFormattedTimestamp() {
        let date = new Date();
        let year = date.getUTCFullYear();
        let month = padNumber(date.getUTCMonth() + 1);
        let day = padNumber(date.getUTCDate());
        let hours = padNumber(date.getUTCHours());
        let minutes = padNumber(date.getUTCMinutes());
        let seconds = padNumber(date.getUTCSeconds());

        // Formats the date and time in a specific format and returns it
        return `${year}:${month}:${day}-${hours}:${minutes}:${seconds}`;
    }



    /*
     *  Sign a message using secp256k1
     *  message: Message to sign
     *  provateKey: Private key in hex format (minus '0x')
     */
    function signMessage(message, privateKey) {
        const EC = elliptic.ec;
        const ec = new EC('secp256k1');
        const key = ec.keyFromPrivate(hexFix(privateKey), 'hex');
        const msgHash = sha256(message);

        // The signature is a DER-encoded hex string
        const signature = key.sign(msgHash).toDER('hex');
        return signature;
    }





    /*
     *   Verify Message Signature
     */
    function verifySignature(publicKey, message, signature) {
        const EC = elliptic.ec;
        const ec = new EC('secp256k1');
        const key = ec.keyFromPublic(publicKey, 'hex');
        const msgHash = sha256(message);

        return key.verify(msgHash, signature, 'hex');
    }





    /*
     *   Returns a public key from a private key
     */
    function getPublicKey(privateKey) {
        const EC = elliptic.ec;
        const ec = new EC('secp256k1');
        const key = ec.keyFromPrivate(privateKey, 'hex');
        const publicKey = key.getPublic('hex');


        return publicKey;
    }




    /*
     *  Convert a string in its hexadecimal representation without '0x'
     */
    function stringToHex(str) {
        let hexString = '';
        for (let i = 0; i < str.length; i++) {
            const hex = str.charCodeAt(i).toString(16);
            hexString += ('00' + hex).slice(-2);
        }
        return hexString;
    }



    /*
     *  Converts a hexadecimal string in a regulare string
     */
    function hexToString(hex) {
        let str = '';
        hex = hexFix(hex);
        for (let i = 0; i < hex.length; i += 2) {
            let code = parseInt(hex.substr(i, 2), 16);
            if (!isNaN(code) && code !== 0) {
                str += String.fromCharCode(code);
            }
        }
        return str;
    }




    /*
     *
     *  removes '0x' from hexadecimal numbers if the have it
     *
     */
    function hexFix(word)
    {
        if (typeof word === 'string') {
            let Word = word;
            if (word.startsWith('0x')) { Word = Word.slice(2); }
            return Word;
        }
        return '';
    }








    /* NAG FUNCTIONS **************************************************************/


    // Application NAG Key
    let NAG_KEY='';

    // Default NAG Link
    let NAG_URL='https://nag.circularlabs.io/NAG.php?cep=';


    /*
     *  Sets the Application NAG Key
     */
    function setNAGKey(nagKey)
    {
        NAG_KEY = nagKey;
    }



    /*
     *  Sets the Network Access Gateway (NAG) URL
     *  If not used, the default URL is selected
     */
    function setNAGURL(nURL)
    {
        NAG_URL = nURL;
    }

    function getNAGURL(){
        return NAG_URL;
    }

    function getNAGKey(){
        return NAG_KEY;
    }




    /* Smart Contracts ************************************************************/

    /*
     *   Test the execution of a smart contract project
     *
     *   Blockchain: Blockchain where the smart contract will be tested
     *   From: Developer's wallet address
     *   Project: Hyper Code Lighe Smart Contract Project
     */
    async function testContract(blockchain, from, project) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "From": hexFix(from),
            "Timestamp": getFormattedTimestamp(),
            "Project": stringToHex(project),
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_TestContract_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error:', error);
            // Optionally, you can return null or a fallback value
            return null;
        }
    }
    



    /*
     *  Local Smart Contract Call
     *
     *  Blockchain: Blockchain where the Smart Contract is deployed
     *  From: Caller wallet Address
     *  Address: Smart Contract Address
     *  Request: Smart Contract Local endpoint
     */
    async function callContract(blockchain, from, address, request) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "From": hexFix(from),
            "Address": hexFix(address),
            "Request": stringToHex(request),
            "Timestamp": getFormattedTimestamp(),
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_CallContract_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error:', error);
            // Optionally, you can return a fallback value like null in case of failure
            return null;
        }
    }
    



    /* WALLET FUNCTIONS  **********************************************************/

    /*
     *  Checks if a Wallet is registered on the chain
     *
     *  Blockchain: Blockchain where the wallet is registered
     *  Address: Wallet Address
     */
    async function checkWallet(blockchain, address) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "Address": hexFix(address),
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_CheckWallet_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error:', error);
            return handleError(error); // Handle the error using your custom error handler
        }
    }
    


    /*
     *  Retrieves a Wallet
     *
     *  Blockchain: Blockchain where the wallet is registered
     *  Address: Wallet Address
     */
    async function getWallet(blockchain, address) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "Address": hexFix(address),
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_GetWallet_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error:', error);
            // Optionally, you can return a fallback value like null or an error object
            return null;
        }
    }
    


    /*
     *  Retrieves a Wallet
     *
     *  Blockchain: Blockchain where the wallet is registered
     *  Address: Wallet Address
     */
    async function getLatestTransactions(blockchain, address) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "Address": hexFix(address),
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_GetLatestTransactions_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error:', error);
            // Return null or handle the error as needed
            return null;
        }
    }
    



    /*
     *   Retrieves the balance of a specified asset in a Wallet
     *   Blockchain: Blockchain where the wallet is registered
     *   Address: Wallet address
     *   Asset: Asset Name (example 'CIRX')
     */
    async function getWalletBalance(blockchain, address, asset) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "Address": hexFix(address),
            "Asset": asset,
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_GetWalletBalance_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error:', error);
            // Optionally return null or handle the error as needed
            return null;
        }
    }
    



    /*
     *   Register a wallet on a desired blockchain.
     *   The same wallet can be registered on multiple blockchains
     *   Blockchain: Blockchain where the wallet will be registered
     *   PublicKey: Wallet PublicKey
     *
     *   Without registration on the blockchain the wallet will not be reachable
     */
    async function registerWallet(blockchain, publicKey) {
        // Prepare the data
        blockchain = hexFix(blockchain);
        publicKey = hexFix(publicKey);
        let From = sha256(publicKey);
        let To = From;
        let Nonce = '0';
        let Type = 'C_TYPE_REGISTERWALLET';
    
        let PayloadObj = { "Action": "CP_REGISTERWALLET", "PublicKey": publicKey };
        let jsonstr = JSON.stringify(PayloadObj);
        let Payload = stringToHex(jsonstr);
    
        let Timestamp = getFormattedTimestamp();
        let ID = sha256(blockchain + From + To + Payload + Nonce + Timestamp);
        let Signature = "";
    
        // Assuming sendTransaction is an async function, you should await it
        try {
            await sendTransaction(ID, From, To, Timestamp, Type, Payload, Nonce, Signature, blockchain);
        } catch (error) {
            console.error('Error sending transaction:', error);
            throw error; // Optionally, rethrow the error if needed
        }
    
        return ID;
    }
    


    /* DOMAINS MANAGEMENT *********************************************************/


    /*
     *  Resolves the domain name returning the wallet address associated to the domain name
     *  A single wallet can have multiple domains associations
     *  Blockchain : Blockchain where the domain and wallet are registered
     *  Name: Domain Name
     */
    async function getDomain(blockchain, name) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "Domain": name,
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_ResolveDomain_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching domain:', error);
            // Optionally return null or handle the error as needed
            return null;
        }
    }
    



/// PARAMETRIC ASSETS MANAGEMENT ///////////////////////////////////////////////////////////////////////////////////////


    /*
     *  Retrieves the list of all assets minted on a specific blockchain
     *  Blockchain: Blockchin where to request the list
     */
    async function getAssetList(blockchain) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_GetAssetList_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching asset list:', error);
            // Optionally return null or handle the error as needed
            return null;
        }
    }
    



    /*
     *  Retrieves an Asset Descriptor
     *  Blockchain: Blockchain where the asset is minted
     *  Name: Asset Name (example 'CIRX')
     */
    async function getAsset(blockchain, name) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "AssetName": name,
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_GetAsset_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching asset:', error);
            // Optionally return null or handle the error as needed
            return null;
        }
    }
    



    /*
     *  Retrieve The total, circulating and residual supply of a specified asset
     *  Blockchain: Blockchain where the asset is minted
     *  Name: Asset Name (example 'CIRX')
     */
    async function getAssetSupply(blockchain, name) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "AssetName": name,
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_GetAssetSupply_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching asset supply:', error);
            // Optionally return null or handle the error as needed
            return null;
        }
    }
    



// VOUCHERS MANAGEMENT//////////////////////////////////////////////////////////

    /*
     *  Retrieves an existing Voucher
     *  Blockchain: blockchain where the voucher was minted
     *  Code: voucher code
     */
    async function getVoucher(blockchain, code) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "Code": String(code),
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_GetVoucher_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching voucher:', error);
            // Optionally return null or handle the error as needed
            return null;
        }
    }
    



// BLOCKS MANAGEMENT //////////////////////////////////////////////////////////////////////////////////

    /*
     *  Retrieve All blocks in a specified range
     *  Blockchain: blockchain where to search the blocks
     *  Start: Initial block
     *  End: End block
     *
     *  If End = 0, then Start is the number of blocks from the last one minted going backward.
     */
    async function getBlockRange(blockchain, start, end) {
        // Prepare the data for the POST request
        let data = {
            "Blockchain": hexFix(blockchain),
            "Start": String(start),
            "End": String(end),
            "Version": version
        };
    
        try {
            // Make the POST request to fetch the block range
            const response = await fetch(NAG_URL + 'Circular_GetBlockRange_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            // Check if the response is ok
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Log the raw response for debugging purposes (optional)
            console.log(JSON.stringify(response));
    
            // Parse and return the JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching block range:', error);
            // Optionally, return null or handle the error as needed
            return null;
        }
    }
    


    /*
     *  Retrieve a desired block
     *  Blockchain: blockchain where to search the block
     *  Num: Block number
     */
    async function getBlock(blockchain, num) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "BlockNumber": String(num),
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_GetBlock_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching block:', error);
            // Optionally, return null or handle the error as needed
            return null;
        }
    }
    


    /*
     *   Retrieves the blockchain block height
     *
     *   Blockchain: blockchain where to count the blocks
     */
    async function getBlockCount(blockchain) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_GetBlockHeight_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching block count:', error);
            // Optionally return null or handle the error as needed
            return null;
        }
    }
    



// ANALYTICS ////////////////////////////////////////////////////////////////////////////////////////////////

    /*
     *   Retrieves the Blockchain  Amalytics
     *
     *   Blockchain: selected blockchain
     */
    async function getAnalytics(blockchain) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_GetAnalytics_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching analytics:', error);
            // Optionally, return null or handle the error as needed
            return null;
        }
    }
    


    /*
     *   Get The list of blockchains available in the network
     *
     */
    async function getBlockchains() {
        let data = {};
    
        try {
            const response = await fetch(NAG_URL + 'Circular_GetBlockchains_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching blockchains:', error);
            // Optionally return null or handle the error as needed
            return null;
        }
    }
    



/// TRANSACTIONS ////////////////////////////////////////////////////////////////////////////////////////////


    /*
     *
     *  Searches a transaction by ID between the pending transactions
     *
     *  Blockchain: Blockchain where to search the transaction
     *  TxID: Transaction ID
     *
     */
    async function getPendingTransaction(blockchain, txID) {
        try {
            let data = {
                "Blockchain": hexFix(blockchain),
                "ID": hexFix(txID),
                "Version": version
            };
    
            const response = await fetch(NAG_URL + 'Circular_GetPendingTransaction_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Await the JSON parsing before returning
            return await response.json();
            
        } catch (error) {
            console.error('Error fetching pending transaction:', error);
            // Optionally return null or handle the error as needed
            return null;
        }
    }
    


    /*
     *   Searches a Transaction by its ID
     *   The transaction will be searched initially between the pending transactions and then in the blockchain
     *
     *   Blockchain: blockchain where to search the transaction
     *   TxID: transaction ID
     *   Start: Starting block
     *   End: End block
     *
     *   if End = 0 Start indicates the number of blocks starting from the last block minted
     */
    async function getTransactionbyID(blockchain, txID, start, end) {
        try {
            let data = {
                "Blockchain": hexFix(blockchain),
                "ID": hexFix(txID),
                "Start": String(start),
                "End": String(end),
                "Version": version
            };
    
            const response = await fetch(NAG_URL + 'Circular_GetTransactionbyID_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Await the JSON parsing before returning
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching transaction by ID:', error);
            // Optionally return null or handle the error as needed
            return null;
        }
    }
    


    /*
     *  Searches all transactions broadcasted by a specified node
     *
     *  Blockchain: blockchain where to search the transaction
     *  NodeID: ID of the node that has broadcasted the transaction
     *  Start: Starting block
     *  End: End block
     *
     * if End = 0 Start indicates the number of blocks starting from the last block minted
     */
    async function getTransactionbyNode(blockchain, nodeID, start, end) {
        try {
            let data = {
                "Blockchain": hexFix(blockchain),
                "NodeID": hexFix(nodeID),
                "Start": String(start),
                "End": String(end),
                "Version": version
            };
    
            const response = await fetch(NAG_URL + 'Circular_GetTransactionbyNode_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Await the JSON parsing before returning
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching transaction by node:', error);
            // Optionally handle the error using handleError or return null
            return handleError ? handleError(error) : null;
        }
    }
    

    /*
     *  Searches all transactions Involving a specified address
     *
     *  Blockchain: blockchain where to search the transaction
     *  Address: Can be the sender or the recipient of the transaction
     *  Start: Starting block
     *  End: End block
     *
     * if End = 0 Start indicates the number of blocks starting from the last block minted
     */
    async function getTransactionbyAddress(blockchain, address, start, end) {
        try {
            let data = {
                "Blockchain": hexFix(blockchain),
                "Address": hexFix(address),
                "Start": String(start),
                "End": String(end),
                "Version": version
            };
    
            const response = await fetch(NAG_URL + 'Circular_GetTransactionbyAddress_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Await the JSON parsing before returning
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching transactions by address:', error);
            // Optionally return null or call handleError if defined
            return handleError ? handleError(error) : null;
        }
    }
    


    async function getWalletNonce(blockchain, address) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "Address": hexFix(address),
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_GetWalletNonce_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Return the parsed JSON response
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching wallet nonce:', error);
            // Optionally return null or handle the error as needed
            return null;
        }
    }
    
    /*
     *  Searches all transactions Involving a specified address in a specified timeframe
     *
     *  Blockchain: blockchain where to search the transaction
     *  Address: Can be the sender or the recipient of the transaction
     *  StartDate: Starting date
     *  endDate: End date
     *
     */
    async function getTransactionbyDate(blockchain, address, startDate, endDate) {
        try {
            let data = {
                "Blockchain": hexFix(blockchain),
                "Address": hexFix(address),
                "StartDate": startDate,
                "EndDate": endDate,
                "Version": version
            };
    
            const response = await fetch(NAG_URL + 'Circular_GetTransactionbyDate_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Await the JSON parsing before returning
            return await response.json();
    
        } catch (error) {
            console.error('Error fetching transactions by date:', error);
            // Optionally return null or handle the error as needed
            return handleError ? handleError(error) : null;
        }
    }
    

    /*
     *  Submits a transaction to a desired blockchain
     *
     *  ID: Transaction ID
     *  From: Transaction Sender
     *  To: Transaction recipient
     *  Timestamp: Formatted Timestamo YYYY:MM:DD-hh:mm:ss
     *  Type: Transaction Type Refer to Documentation
     *  Payload: Transaction payload
     *  Nonce: Wallet nonce
     *  Signature: transaction Signature
     *  Blockchain: Blockchain where the transaction will be submitted
     */
    async function sendTransaction(
        id,          // Transaction ID (hash)
        from,        // Sender Wallet address
        to,          // Receiver Wallet Address
        timestamp,   // Transaction Timestamp
        type,        // Type of Transaction
        payload,     // Payload of transaction in accordance with the type
        nonce,
        signature,   // Private Key for the Sender Wallet Address
        blockchain   // Blockchain on which the transaction will be stored (it will involve only assets on the same chain)
    ) {
        let data = {
            "ID": hexFix(id),
            "From": hexFix(from),
            "To": hexFix(to),
            "Timestamp": timestamp,
            "Payload": String(hexFix(payload)),
            "Nonce": String(nonce),
            "Signature": hexFix(signature),
            "Blockchain": hexFix(blockchain),
            "Type": type,
            "Version": version
        };
    
        try {
            const response = await fetch(NAG_URL + 'Circular_AddTransaction_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            const text = await response.text(); // The response text from the server
    
            // Try to parse the response as JSON
            try {
                return JSON.parse(text);
            } catch (e) {
                // If parsing fails, return the raw text with the status
                return { status: response.status, message: text };
            }
        } catch (error) {
            console.error('Error sending transaction:', error);
            handleError(error); // Ensure handleError is called if available
            // Return a custom JSON object indicating the error
            return { success: false, message: 'Server unreachable', error: error.toString() };
        }
    }
    

    // Send a transaction to the blockchain
    let intervalSec = 5;
    /*
     *    Recursive transaction finality polling
     *    will search a transaction every  intervalSec seconds with a desired timeout.
     *
     *    Blockchain: blockchain where the transaction was submitted
     *    TxID: Transaction ID
     *    timeoutSec: Waiting timeout
     *
     */
    function getTransactionOutcome(blockchain, txID, timeoutSec, intervalSec) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const interval = intervalSec * 1000;  // Convert seconds to milliseconds
            const timeout = timeoutSec * 1000;    // Convert seconds to milliseconds
    
            const checkTransaction = () => {
                const elapsedTime = Date.now() - startTime;
                console.log('Checking transaction...', { elapsedTime, timeout });
    
                if (elapsedTime > timeout) {
                    console.log('Timeout exceeded');
                    reject(new Error('Timeout exceeded'));
                    return;
                }
    
                // Call getTransactionbyID and check the response
                getTransactionbyID(blockchain, txID, 0, 10)
                    .then(data => {
                        console.log('Data received:', data);
                        if (data.Result === 200 && data.Response !== 'Transaction Not Found' && data.Response.Status !== 'Pending') {
                            resolve(data.Response);  // Resolve if transaction is confirmed
                        } else {
                            console.log('Transaction not yet confirmed or not found, polling again...');
                            setTimeout(checkTransaction, interval);  // Continue polling
                        }
                    })
                    .catch(error => {
                        console.log('Error fetching transaction:', error);
                        reject(error);  // Reject on error
                    });
            };
    
            // Start the first poll after the interval
            setTimeout(checkTransaction, interval);
        });
    }
    

    // Public API
    return {
        checkWallet : checkWallet,
        getWallet : getWallet,
        getLatestTransactions : getLatestTransactions,
        getWalletBalance : getWalletBalance,
        testContract : testContract,
        callContract : callContract,
        setNAGKey : setNAGKey,
        setNAGURL : setNAGURL,
        getNAGURL : getNAGURL,
        getNAGKey : getNAGKey,
        hexFix : hexFix,
        stringToHex : stringToHex,
        hexToString : hexToString,
        registerWallet : registerWallet,
        getDomain : getDomain,
        getAssetList : getAssetList,
        getAsset : getAsset,
        getVoucher : getVoucher,
        getAssetSupply : getAssetSupply,
        signMessage : signMessage,
        getPublicKey : getPublicKey,
        getFormattedTimestamp : getFormattedTimestamp,
        verifySignature : verifySignature,
        getBlock : getBlock,
        getBlockRange : getBlockRange,
        getBlockCount : getBlockCount,
        getAnalytics : getAnalytics,
        getBlockchains : getBlockchains,
        getPendingTransaction : getPendingTransaction,
        getTransactionbyID : getTransactionbyID,
        getTransactionbyNode : getTransactionbyNode,
        getTransactionbyAddress : getTransactionbyAddress,
        getTransactionbyDate : getTransactionbyDate,
        sendTransaction : sendTransaction,
        getTransactionOutcome : getTransactionOutcome,
        getWalletNonce : getWalletNonce,
        hashString : hashString,

    };
})();
export default CircularProtocolAPI;
