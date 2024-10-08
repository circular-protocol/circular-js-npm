const elliptic = require('elliptic');
const sha256 = require('sha256');
const https = require('https');
const { URL } = require('url');


/*******************************************************************************

 CIRCULAR LAYER 1 BLOCKCHAIN PROTOCOL INTERFACE LIBRARY
 License : Open Source for private and commercial use

 CIRCULAR GLOBAL LEDGERS, INC. - USA


 Version : 1.0.9

 Creation: 7/12/2022
 Update  : 06/10/2024

 Originator: Gianluca De Novi, PhD
 Contributors: redorc83, Danny De Novi

 *******************************************************************************/

/*
 *   Circular Class
 */
let CircularProtocolAPI = (function(){


    // Support Node Software Version
    const Version = '1.0.7';

    // Application NAG Key
    let NAG_KEY='';

    // Default NAG Link
    let NAG_URL='https://nag.circularlabs.io/NAG.php?cep=';

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



    /* HELPER FUNCTIONS ***********************************************************/


    /*
     * Function to add a leading zero to numbers less than 10
     * num : number to pad
     *
     */
    function padNumber(num) {
        return num < 10 ? '0' + num : num;
    }

    function makeRequest(path, data) {

        const dim = Buffer.byteLength(JSON.stringify(data));

        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'nag.circularlabs.io',
                path: `/NAG.php?cep=${path}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': dim
                },
                timeout: 30000
            };

            const req = https.request(options, (res) => {
                let responseData = '';
    
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
    
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(responseData);
                        resolve(parsedData);
                    } catch (err) {
                        reject(new Error(`Error parsing response data: ${err.message}`));
                    }
                });
            });
    
            req.on('error', (e) => {
                reject(new Error(`Request error: ${e.message}`));
            });
    
            req.on('timeout', () => {
                req.abort();
                reject(new Error('Request timed out'));
            });
    
            req.write(JSON.stringify(data));
            req.end();
        });
    }
    
    // 




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
    function SignMessage( message, privateKey) {
        const EC = elliptic.ec;
        const ec = new EC('secp256k1');
        const key = ec.keyFromPrivate(HexFix(privateKey), 'hex');
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
        hex = HexFix(hex);
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
    function HexFix(word)
    {
        if (typeof word === 'string') {
            let Word = word;
            if (word.startsWith('0x')) { Word = Word.slice(2); }
            return Word;
        }
        return '';
    }








    /* NAG FUNCTIONS **************************************************************/


    /*
     *  Sets the Application NAG Key
     */
    function SetNAGKey(NAGKey)
    {
        NAG_KEY = NAGKey;
    }



    /*
     *  Sets the Network Access Gateway (NAG) URL
     *  If not used, the default URL is selected
     */
    function SetNAGURL(NURL)
    {
        NAG_URL = NURL;
    }




    /* Smart Contracts ************************************************************/

    /*
     *   Test the execution of a smart contract project
     *
     *   Blockchain: Blockchain where the smart contract will be tested
     *   From: Developer's wallet address
     *   Project: Hyper Code Lighe Smart Contract Project
     */
    async function TestContract(Blockchain, From, Project) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "From": HexFix(From),
                "Timestamp": getFormattedTimestamp(),
                "Project": stringToHex(Project),
                "Version": Version
            };
    
            const response = await makeRequest('Circular_TestContract_', data);
    
            if (!response || response.error) {
                throw new Error(response ? response.error : 'Unknown error occurred during contract test.');
            }
    
            return response;
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
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
    async function CallContract(Blockchain, From, Address, Request) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "From": HexFix(From),
                "Address": HexFix(Address),
                "Request": stringToHex(Request),
                "Timestamp": getFormattedTimestamp(),
                "Version": Version
            };
    
            const response = await makeRequest('Circular_CallContract_', data);
    
            if (!response || response.error) {
                throw new Error(response ? response.error : 'Unknown error occurred during contract call.');
            }
    
            return response;
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
        }
    }
    



    /* WALLET FUNCTIONS  **********************************************************/

    /*
     *  Checks if a Wallet is registered on the chain
     *
     *  Blockchain: Blockchain where the wallet is registered
     *  Address: Wallet Address
     */
    async function CheckWallet(Blockchain, Address) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "Address": HexFix(Address),
                "Version": Version
            };
    
            const response = await makeRequest('Circular_CheckWallet_', data);
    
            if (!response || response.error) {
                throw new Error(response ? response.error : 'Unknown error occurred while checking wallet.');
            }
    
            return response;
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
        }
    }
    


    /*
     *  Retrieves a Wallet
     *
     *  Blockchain: Blockchain where the wallet is registered
     *  Address: Wallet Address
     */
    async function GetWallet(Blockchain, Address) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "Address": HexFix(Address),
                "Version": Version
            };
    
            const response = await makeRequest('Circular_GetWallet_', data);
    
            if (!response || response.error) {
                throw new Error(response ? response.error : 'Unknown error occurred while retrieving wallet.');
            }
    
            return response;
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
        }
    }
    


    /*
     *  Retrieves a Wallet
     *
     *  Blockchain: Blockchain where the wallet is registered
     *  Address: Wallet Address
     */
    async function GetLatestTransactions(Blockchain, Address) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "Address": HexFix(Address),
                "Version": Version
            };
    
            const response = await makeRequest('Circular_GetLatestTransactions_', data);
    
            if (!response || response.error) {
                throw new Error(response ? response.error : 'Unknown error occurred while retrieving latest transactions.');
            }
    
            return response;
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
        }
    }
    



    /*
     *   Retrieves the balance of a specified asset in a Wallet
     *   Blockchain: Blockchain where the wallet is registered
     *   Address: Wallet address
     *   Asset: Asset Name (example 'CIRX')
     */
    async function GetWalletBalance(Blockchain, Address, Asset) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "Address": HexFix(Address),
                "Asset": Asset,
                "Version": Version
            };
    
            const response = await makeRequest('Circular_GetWalletBalance_', data);
    
            if (!response || response.error) {
                throw new Error(response ? response.error : 'Unknown error occurred while retrieving wallet balance.');
            }
    
            return response;
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
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
    async function RegisterWallet(Blockchain, PublicKey) {
        try {
            Blockchain = HexFix(Blockchain);
            PublicKey = HexFix(PublicKey);
            const From = sha256(PublicKey);
            const To = From;
            const Nonce = '0';
            const Type = 'C_TYPE_REGISTERWALLET';
    
            const PayloadObj = {
                "Action": "CP_REGISTERWALLET",
                "PublicKey": PublicKey
            };
    
            const jsonstr = JSON.stringify(PayloadObj);
            const Payload = stringToHex(jsonstr);
            const Timestamp = getFormattedTimestamp();
            const ID = sha256(Blockchain + From + To + Payload + Nonce + Timestamp);
            const Signature = "";
    
            return await SendTransaction(ID, From, To, Timestamp, Type, Payload, Nonce, Signature, Blockchain);
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
        }
    }
    


    /* DOMAINS MANAGEMENT *********************************************************/


    /*
     *  Resolves the domain name returning the wallet address associated to the domain name
     *  A single wallet can have multiple domains associations
     *  Blockchain : Blockchain where the domain and wallet are registered
     *  Name: Domain Name
     */
    async function GetDomain(Blockchain, Name) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "Domain": Name,
                "Version": Version
            };
    
            return await makeRequest('Circular_ResolveDomain_', data);
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
        }
    }
    



/// PARAMETRIC ASSETS MANAGEMENT ///////////////////////////////////////////////////////////////////////////////////////


    /*
     *  Retrieves the list of all assets minted on a specific blockchain
     *  Blockchain: Blockchin where to request the list
     */
    async function GetAssetList(Blockchain) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "Version": Version
            };
    
            return await makeRequest('Circular_GetAssetList_', data);
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
        }
    }
    



    /*
     *  Retrieves an Asset Descriptor
     *  Blockchain: Blockchain where the asset is minted
     *  Name: Asset Name (example 'CIRX')
     */
    async function GetAsset(Blockchain, Name) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "AssetName": Name,
                "Version": Version
            };
    
            return await makeRequest('Circular_GetAsset_', data);
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
        }
    }
    



    /*
     *  Retrieve The total, circulating and residual supply of a specified asset
     *  Blockchain: Blockchain where the asset is minted
     *  Name: Asset Name (example 'CIRX')
     */
    async function GetAssetSupply(Blockchain, Name) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "AssetName": Name,
                "Version": Version
            };
    
            return await makeRequest('Circular_GetAssetSupply_', data);
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
        }
    }
    



// VOUCHERS MANAGEMENT//////////////////////////////////////////////////////////

    /*
     *  Retrieves an existing Voucher
     *  Blockchain: blockchain where the voucher was minted
     *  Code: voucher code
     */
    async function GetVoucher(Blockchain, Code) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "Code": String(Code),
                "Version": Version
            };
    
            return await makeRequest('Circular_GetVoucher_', data);
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
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
    async function GetBlockRange(Blockchain, Start, End) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "Start": String(Start),
                "End": String(End),
                "Version": Version
            };
    
            return await makeRequest('Circular_GetBlockRange_', data);
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
        }
    }
    

    /*
     *  Retrieve a desired block
     *  Blockchain: blockchain where to search the block
     *  Num: Block number
     */
    async function GetBlock(Blockchain, Num) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "BlockNumber": String(Num),
                "Version": Version
            };
    
            return await makeRequest('Circular_GetBlock_', data);
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
        }
    }
    


    /*
     *   Retrieves the blockchain block height
     *
     *   Blockchain: blockchain where to count the blocks
     */
    async function GetBlockCount(Blockchain) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "Version": Version
            };
    
            return await makeRequest('Circular_GetBlockHeight_', data);
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
        }
    }
    



// ANALYTICS ////////////////////////////////////////////////////////////////////////////////////////////////

    /*
     *   Retrieves the Blockchain  Amalytics
     *
     *   Blockchain: selected blockchain
     */
    async function GetAnalytics(Blockchain) {
        try {
            const data = {
                "Blockchain": HexFix(Blockchain),
                "Version": Version
            };
    
            return await makeRequest('Circular_GetAnalytics_', data);
        } catch (error) {
            handleError(error);
            return { success: false, error: error.message };
        }
    }
    


    /*
     *   Get The list of blockchains available in the network
     *
     */
    async function GetBlockchains() {
        try {
            let data = {};
    
            return await makeRequest('Circular_GetBlockchains_', data);
        } catch (error) {
            return handleError(error);
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
    async function GetPendingTransaction(Blockchain, TxID) {
        try {
            let data = {
                "Blockchain": HexFix(Blockchain),
                "ID": HexFix(TxID),
                "Version": Version
            };
    
            return await makeRequest('Circular_GetPendingTransaction_', data);
        } catch (error) {
            return handleError(error);
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
    async function GetTransactionbyID(Blockchain, TxID, Start, End) {
        try {
            let data = {
                "Blockchain": HexFix(Blockchain),
                "ID": HexFix(TxID),
                "Start": String(Start),
                "End": String(End),
                "Version": Version
            };
    
            return await makeRequest('Circular_GetTransactionbyID_', data);
        } catch (error) {
            return handleError(error);
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
    async function GetTransactionbyNode(Blockchain, NodeID, Start, End) {
        try {
            let data = {
                "Blockchain": HexFix(Blockchain),
                "NodeID": HexFix(NodeID),
                "Start": String(Start),
                "End": String(End),
                "Version": Version
            };
    
            return await makeRequest('Circular_GetTransactionbyNode_', data);
        } catch (error) {
            return handleError(error);
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
    async function GetTransactionbyAddress(Blockchain, Address, Start, End) {
        try {
            let data = {
                "Blockchain": HexFix(Blockchain),
                "Address": HexFix(Address),
                "Start": String(Start),
                "End": String(End),
                "Version": Version
            };
    
            return await makeRequest('Circular_GetTransactionbyAddress_', data);
        } catch (error) {
            return handleError(error);
        }
    }
    


    async function GetWalletNonce(Blockchain, Address) {
        try {
            let data = {
                "Blockchain": HexFix(Blockchain),
                "Address": HexFix(Address),
                "Version": Version
            };
    
            return await makeRequest('Circular_GetWalletNonce_', data);
        } catch (error) {
            return handleError(error);
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
    async function GetTransactionbyDate(Blockchain, Address, StartDate, endDate) {
        try {
            let data = {
                "Blockchain": HexFix(Blockchain),
                "Address": HexFix(Address),
                "StartDate": StartDate,
                "EndDate": endDate,
                "Version": Version
            };
    
            return await makeRequest('Circular_GetTransactionbyDate_', data);
        } catch (error) {
            return handleError(error);
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
    async function SendTransaction(
        ID, 
        From, 
        To, 
        Timestamp, 
        Type, 
        Payload, 
        Nonce, 
        Signature, 
        Blockchain
    ) {
        try {
            let data = {
                "ID": HexFix(ID),
                "From": HexFix(From),
                "To": HexFix(To),
                "Timestamp": Timestamp,
                "Payload": String(HexFix(Payload)),
                "Nonce": String(Nonce),
                "Signature": HexFix(Signature),
                "Blockchain": HexFix(Blockchain),
                "Type": Type,
                "Version": Version
            };
    
            return await makeRequest('Circular_AddTransaction_', data);
        } catch (error) {
            return handleError(error);
        }
    }
    

    /* Easier way to send a transaction
     *
     *  From: Transaction Sender
     *  SenderPK: Sender's private key
     *  To: Transaction recipient
     *  Type: Transaction Type Refer to Documentation
     *  Payload: Transaction payload
     *  Blockchain: Blockchain where the transaction will be submitted
    */
    async function sendTransactionWithPK(From, SenderPK, To, Type, Payload, Blockchain) {
        try {
            From = HexFix(From);
            To = HexFix(To);
            SenderPK = HexFix(SenderPK);
            Payload = HexFix(stringToHex(JSON.stringify(Payload)));
    
            let nonceData = await GetWalletNonce(Blockchain, From);
            if (!nonceData || !nonceData.Response || typeof nonceData.Response.Nonce === 'undefined') {
                throw new Error('Nonce not found');
            }
    
            let Nonce = nonceData.Response.Nonce + 1;
    
            let Timestamp = getFormattedTimestamp();
            let ID = sha256(Blockchain + From + To + Payload + String(Nonce) + Timestamp);
    
            let Signature = SignMessage(ID, SenderPK);
    
            return await SendTransaction(ID, From, To, Timestamp, Type, Payload, Nonce, Signature, Blockchain);
        } catch (error) {
            return handleError(error);
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
    function GetTransactionOutcome(Blockchain, TxID, timeoutSec) {
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

                GetTransactionbyID(Blockchain, TxID, 0, 10).then(data => {
                    console.log('Data received:', data);
                    if (data.Result === 200 && data.Response !== 'Transaction Not Found' && data.Response.Status!=='Pending') {
                        resolve(data.Response);  // Resolve if transaction is found and not 'Transaction Not Found'
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

            setTimeout(checkTransaction, interval);  // Start polling
        });
    }


    // Public API
    return {
        CheckWallet : CheckWallet,
        GetWallet : GetWallet,
        GetLatestTransactions : GetLatestTransactions,
        GetWalletBalance : GetWalletBalance,
        TestContract : TestContract,
        CallContract : CallContract,
        SetNAGKey : SetNAGKey,
        SetNAGURL : SetNAGURL,
        HexFix : HexFix,
        stringToHex : stringToHex,
        hexToString : hexToString,
        RegisterWallet : RegisterWallet,
        GetDomain : GetDomain,
        GetAssetList : GetAssetList,
        GetAsset : GetAsset,
        GetVoucher : GetVoucher,
        GetAssetSupply : GetAssetSupply,
        SignMessage : SignMessage,
        getPublicKey : getPublicKey,
        getFormattedTimestamp : getFormattedTimestamp,
        verifySignature : verifySignature,
        GetBlock : GetBlock,
        GetBlockRange : GetBlockRange,
        GetBlockCount : GetBlockCount,
        GetAnalytics : GetAnalytics,
        GetBlockchains : GetBlockchains,
        GetPendingTransaction : GetPendingTransaction,
        GetTransactionbyID : GetTransactionbyID,
        GetTransactionbyNode : GetTransactionbyNode,
        GetTransactionbyAddress : GetTransactionbyAddress,
        GetTransactionbyDate : GetTransactionbyDate,
        SendTransaction : SendTransaction,
        sendTransactionWithPK : sendTransactionWithPK,
        GetTransactionOutcome : GetTransactionOutcome

    };
})();
module.exports = CircularProtocolAPI;
