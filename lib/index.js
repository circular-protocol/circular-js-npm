import elliptic from 'elliptic';
import sha256 from 'sha256';
import fetch from 'node-fetch';

/*******************************************************************************

 CIRCULAR LAYER 1 BLOCKCHAIN PROTOCOL INTERFACE LIBRARY
 License : Open Source for private and commercial use

 CIRCULAR GLOBAL LEDGERS, INC. - USA


 Version : 1.0.10

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
    const version = '1.0.7';

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




    /* Smart Contracts ************************************************************/

    /*
     *   Test the execution of a smart contract project
     *
     *   Blockchain: Blockchain where the smart contract will be tested
     *   From: Developer's wallet address
     *   Project: Hyper Code Lighe Smart Contract Project
     */
    function testContract(blockchain, from, project) {
        let data = {
            "Blockchain" : hexFix(blockchain),
            "From" : hexFix(from),
            "Timestamp" : getFormattedTimestamp(),
            "Project" : stringToHex(project),
            "Version" : version
        }

        return fetch(NAG_URL + 'Circular_TestContract_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }



    /*
     *  Local Smart Contract Call
     *
     *  Blockchain: Blockchain where the Smart Contract is deployed
     *  From: Caller wallet Address
     *  Address: Smart Contract Address
     *  Request: Smart Contract Local endpoint
     */
    function callContract(blockchain, from, address, request){

        let data = {
            "Blockchain" : hexFix(blockchain),
            "From" : hexFix(from),
            "Address" : hexFix(address),
            "Request" : stringToHex(request),
            "Timestamp" : getFormattedTimestamp(),
            "Version" : version
        }

        return fetch(NAG_URL + 'Circular_CallContract_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }



    /* WALLET FUNCTIONS  **********************************************************/

    /*
     *  Checks if a Wallet is registered on the chain
     *
     *  Blockchain: Blockchain where the wallet is registered
     *  Address: Wallet Address
     */
    function checkWallet(blockchain, address) {
        try {
            let data = {
                "Blockchain" : hexFix(blockchain),
                "Address" : hexFix(address),
                "Version" : version
            }

            return fetch(NAG_URL + 'Circular_CheckWallet_', {
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify(data)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                }).catch((error) => {
                    throw error;
                });
        } catch (error) {
            return handleError(error);
        }

    }


    /*
     *  Retrieves a Wallet
     *
     *  Blockchain: Blockchain where the wallet is registered
     *  Address: Wallet Address
     */
    function getWallet(blockchain, address) {

        let data = {
            "Blockchain" : hexFix(blockchain),
            "Address" : hexFix(address),
            "Version" : version
        }

        return fetch(NAG_URL + 'Circular_GetWallet_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch((error) => {
                throw error;
            });
    }


    /*
     *  Retrieves a Wallet
     *
     *  Blockchain: Blockchain where the wallet is registered
     *  Address: Wallet Address
     */
    function getLatestTransactions(blockchain, address) {

        let data = {
            "Blockchain" : hexFix(blockchain),
            "Address" : hexFix(address),
            "Version" : version
        }

        return fetch(NAG_URL + 'Circular_GetLatestTransactions_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch((error) => {
                throw error;
            });
    }



    /*
     *   Retrieves the balance of a specified asset in a Wallet
     *   Blockchain: Blockchain where the wallet is registered
     *   Address: Wallet address
     *   Asset: Asset Name (example 'CIRX')
     */
    function getWalletBalance(blockchain, address, asset) {

        let data = {
            "Blockchain" : hexFix(blockchain),
            "Address" : hexFix(address),
            "Asset" : asset,
            "Version" : version
        }

        return fetch(NAG_URL + 'Circular_GetWalletBalance_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            }).catch((error) => {
                throw error;
            });
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

        blockchain     = hexFix(blockchain);
        publicKey      = hexFix(publicKey);
        let From       = sha256(publicKey);
        let To         = From ;
        let Nonce      = '0';
        let Type       = 'C_TYPE_REGISTERWALLET';

        let PayloadObj = {"Action" : "CP_REGISTERWALLET",
            "PublicKey": publicKey};

        let jsonstr    = JSON.stringify(PayloadObj);
        let Payload    = stringToHex(jsonstr);

        let Timestamp  = getFormattedTimestamp();
        
        let ID         = sha256(blockchain + From + To + Payload + Nonce + Timestamp);
        let Signature  = "";

        sendTransaction(  ID, From, To, Timestamp, Type, Payload, Nonce, Signature, blockchain);

        return ID;
    }


    /* DOMAINS MANAGEMENT *********************************************************/


    /*
     *  Resolves the domain name returning the wallet address associated to the domain name
     *  A single wallet can have multiple domains associations
     *  Blockchain : Blockchain where the domain and wallet are registered
     *  Name: Domain Name
     */
    function getDomain(blockchain, name) {

        let data = {
            "Blockchain" : hexFix(blockchain),
            "Domain" : name,
            "Version" : version
        }

        return fetch(NAG_URL + 'Circular_ResolveDomain_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch((error) => {
                throw error;
            });
    }



/// PARAMETRIC ASSETS MANAGEMENT ///////////////////////////////////////////////////////////////////////////////////////


    /*
     *  Retrieves the list of all assets minted on a specific blockchain
     *  Blockchain: Blockchin where to request the list
     */
    async function getAssetList(blockchain) {

        let data = {
            "Blockchain" : hexFix(blockchain),
            "Version" : version
        }

        return fetch(NAG_URL + 'Circular_GetAssetList_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch((error) => {
                throw error;
            });
    }



    /*
     *  Retrieves an Asset Descriptor
     *  Blockchain: Blockchain where the asset is minted
     *  Name: Asset Name (example 'CIRX')
     */
    async function getAsset(blockchain, name) {

        let data = {
            "Blockchain" : hexFix(blockchain),
            "AssetName" : name,
            "Version" : version
        }

        return fetch(NAG_URL + 'Circular_GetAsset_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch((error) => {
                throw error;
            });
    }



    /*
     *  Retrieve The total, circulating and residual supply of a specified asset
     *  Blockchain: Blockchain where the asset is minted
     *  Name: Asset Name (example 'CIRX')
     */
    async function getAssetSupply(blockchain, name) {

        let data = {
            "Blockchain" : hexFix(blockchain),
            "AssetName"  : name,
            "Version" : version
        }

        return fetch(NAG_URL + 'Circular_GetAssetSupply_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch((error) => {
                throw error;
            });
    }



// VOUCHERS MANAGEMENT//////////////////////////////////////////////////////////

    /*
     *  Retrieves an existing Voucher
     *  Blockchain: blockchain where the voucher was minted
     *  Code: voucher code
     */
    async function getVoucher(blockchain, code) {
        let data = {
            "Blockchain" : hexFix(blockchain),
            "Code" : String(code),
            "Version" : version
        }

        return fetch(NAG_URL + 'Circular_GetVoucher_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch((error) => {
                throw error;
            });
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

        //console.log(Blockchain + ' S: ' + Start + ' E: ' + End);

        let data = {
            "Blockchain" : hexFix(blockchain),
            "Start" : String(start),
            "End" : String(end),
            "Version" : version
        }

        return fetch(NAG_URL + 'Circular_GetBlockRange_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })

            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log(JSON.stringify(response));
                return response.json();
            })
            .catch((error) => {
                throw error;
            });
    }


    /*
     *  Retrieve a desired block
     *  Blockchain: blockchain where to search the block
     *  Num: Block number
     */
    async function getBlock(blockchain, num) {

        let data = {
            "Blockchain" : hexFix(blockchain),
            "BlockNumber": String(num),
            "Version" : version
        }

        return fetch(NAG_URL + 'Circular_GetBlock_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch((error) => {
                throw error;
            });
    }


    /*
     *   Retrieves the blockchain block height
     *
     *   Blockchain: blockchain where to count the blocks
     */
    async function getBlockCount(blockchain) {

        let data = {
            "Blockchain" : hexFix(blockchain),
            "Version" : version
        }

        return fetch(NAG_URL + 'Circular_GetBlockHeight_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch((error) => {
                throw error;
            });
    }



// ANALYTICS ////////////////////////////////////////////////////////////////////////////////////////////////

    /*
     *   Retrieves the Blockchain  Amalytics
     *
     *   Blockchain: selected blockchain
     */
    async function getAnalytics(blockchain) {

        let data = {
            "Blockchain" : hexFix(blockchain),
            "Version" : version
        }

        return fetch(NAG_URL + 'Circular_GetAnalytics_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch((error) => {
                throw error;
            });
    }


    /*
     *   Get The list of blockchains available in the network
     *
     */
    async function getBlockchains() {

        let data = {}

        return fetch(NAG_URL + 'Circular_GetBlockchains_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch((error) => {
                throw error;
            });
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
                "Blockchain" : hexFix(blockchain),
                "ID" : hexFix(txID),
                "Version" : version
            };

            const response = await fetch(NAG_URL + 'Circular_GetPendingTransaction_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return response.json();
        } catch (error) {
            throw error;
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
                "Blockchain" : hexFix(blockchain),
                "ID" : hexFix(txID),
                "Start" : String(start),
                "End" : String(end),
                "Version" : version
            };

            const response = await fetch(NAG_URL + 'Circular_GetTransactionbyID_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return response.json();
        } catch (error) {
            handleError(error);
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
                "Blockchain" : hexFix(blockchain),
                "NodeID" : hexFix(nodeID),
                "Start" : String(start),
                "End" : String(end),
                "Version" : version
            };

            const response = await fetch(NAG_URL + 'Circular_GetTransactionbyNode_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return response.json();
        } catch (error) {
            handleError(error);
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
                "Blockchain" : hexFix(blockchain),
                "Address" : hexFix(address),
                "Start" : String(start),
                "End" : String(end),
                "Version" : version
            };

            const response = await fetch(NAG_URL + 'Circular_GetTransactionbyAddress_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return response.json();
        } catch (error) {
            handleError(error);
        }
    }


    async function getWalletNonce(blockchain, address) {
        let data = {
            "Blockchain": hexFix(blockchain),
            "Address": hexFix(address),
            "Version": version
        };
    
        return fetch(NAG_URL + 'Circular_GetWalletNonce_', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error:', error);
        });
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
                "Version" : version
            };

            const response = await fetch(NAG_URL + 'Circular_GetTransactionbyDate_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return response.json();
        } catch (error) {
            handleError(error);
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
    async function sendTransaction( id, // Transaction ID (hash)
                                    from, // Sender Wallet address
                                    to, // Receiver Wallet Address
                                    timestamp, // Transaction Timestamp
                                    type, // Type of Transaction
                                    payload, // Payload of transaction in accordance with the type
                                    nonce,
                                    signature, // Private Key for the Sender Wallet Address
                                    blockchain  // Blockchain on which the transaction will be stored (it will involve only assetts on the same chain)
    )
    {
        let data = {
            "ID" : hexFix(id),
            "From" : hexFix(from),
            "To" : hexFix(to),
            "Timestamp" : timestamp,
            "Payload" : String(hexFix(payload)),
            "Nonce" : String(nonce),
            "Signature" : hexFix(signature),
            "Blockchain" : hexFix(blockchain),
            "Type" : type,
            "Version" : version
        }

        try {
            const response = await fetch(NAG_URL + 'Circular_AddTransaction_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(data)});

            const text = await response.text(); // The response text from the server

            // Check if the response is in JSON format
            try {
                return JSON.parse(text);
            } catch(e) {
                // If the response is not in JSON format, return it as-is with status
                return { status: response.status, message: text };
            }
        } catch (error) {
            handleError(error);
            // Return a custom JSON object indicating the error
            return { success: false, message: 'Server unreachable', error: error.toString() };
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
    async function sendTransactionWithPK(from, senderPK, to, type, payload, blockchain) {
        try {
            // Correggi i valori di input
            from      = hexFix(from);
            to        = hexFix(to);
            senderPK  = hexFix(senderPK);
            payload   = hexFix(stringToHex(JSON.stringify(payload)));
    
            // Attendi il risultato della promessa GetWalletNonce
            let nonceData = await getWalletNonce(blockchain, from);
            if (!nonceData || !nonceData.Response || typeof nonceData.Response.Nonce === 'undefined') {
                throw new Error('Nonce non trovato');
            }
    
            let Nonce = nonceData.Response.Nonce + 1; // Accedi alla proprietà Nonce
    
            // Ottieni il timestamp e crea l'ID
            let Timestamp = getFormattedTimestamp();
            let ID = sha256(blockchain + from + to + payload + String(Nonce) + Timestamp);
    
            // Firma il messaggio
            let Signature = signMessage(ID, senderPK); // Usa SenderPK per la firma
    
            // Invia la transazione
            return await sendTransaction(ID, from, to, Timestamp, type, payload, Nonce, Signature, blockchain);
        } catch (error) {
            console.error("Errore durante l'invio della transazione:", error);
            throw error;
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
    function getTransactionOutcome(blockchain, txID, timeoutSec) {
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

                getTransactionbyID(blockchain, txID, 0, 10).then(data => {
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
        checkWallet : checkWallet,
        getWallet : getWallet,
        getLatestTransactions : getLatestTransactions,
        getWalletBalance : getWalletBalance,
        testContract : testContract,
        callContract : callContract,
        setNAGKey : setNAGKey,
        setNAGURL : setNAGURL,
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
        sendTransactionWithPK : sendTransactionWithPK,
        getTransactionOutcome : getTransactionOutcome

    };
})();
export default CircularProtocolAPI;
