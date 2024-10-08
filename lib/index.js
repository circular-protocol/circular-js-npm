import elliptic from 'elliptic';
import sha256 from 'sha256';
import fetch from 'node-fetch';

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


    // Application NAG Key
    let NAG_KEY='';

    // Default NAG Link
    let NAG_URL='https://nag.circularlabs.io/NAG.php?cep=';


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
    function TestContract(Blockchain, From, Project) {
        let data = {
            "Blockchain" : HexFix(Blockchain),
            "From" : HexFix(From),
            "Timestamp" : getFormattedTimestamp(),
            "Project" : stringToHex(Project),
            "Version" : Version
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
    function CallContract(Blockchain, From, Address, Request){

        let data = {
            "Blockchain" : HexFix(Blockchain),
            "From" : HexFix(From),
            "Address" : HexFix(Address),
            "Request" : stringToHex(Request),
            "Timestamp" : getFormattedTimestamp(),
            "Version" : Version
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
    function CheckWallet(Blockchain, Address) {
        try {
            let data = {
                "Blockchain" : HexFix(Blockchain),
                "Address" : HexFix(Address),
                "Version" : Version
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
    function GetWallet(Blockchain, Address) {

        let data = {
            "Blockchain" : HexFix(Blockchain),
            "Address" : HexFix(Address),
            "Version" : Version
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
    function GetLatestTransactions(Blockchain, Address) {

        let data = {
            "Blockchain" : HexFix(Blockchain),
            "Address" : HexFix(Address),
            "Version" : Version
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
    function GetWalletBalance(Blockchain, Address, Asset) {

        let data = {
            "Blockchain" : HexFix(Blockchain),
            "Address" : HexFix(Address),
            "Asset" : Asset,
            "Version" : Version
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
    async function RegisterWallet(Blockchain,PublicKey) {

        Blockchain     = HexFix(Blockchain);
        PublicKey      = HexFix(PublicKey);
        let From       = sha256(PublicKey);
        let To         = From ;
        let Nonce      = '0';
        let Type       = 'C_TYPE_REGISTERWALLET';

        let PayloadObj = {"Action" : "CP_REGISTERWALLET",
            "PublicKey": PublicKey};

        let jsonstr    = JSON.stringify(PayloadObj);
        let Payload    = stringToHex(jsonstr);

        let Timestamp  = getFormattedTimestamp();
        
        let ID         = sha256(Blockchain + From + To + Payload + Nonce + Timestamp);
        let Signature  = "";

        SendTransaction(  ID, From, To, Timestamp, Type, Payload, Nonce, Signature, Blockchain);

        return ID;
    }


    /* DOMAINS MANAGEMENT *********************************************************/


    /*
     *  Resolves the domain name returning the wallet address associated to the domain name
     *  A single wallet can have multiple domains associations
     *  Blockchain : Blockchain where the domain and wallet are registered
     *  Name: Domain Name
     */
    function GetDomain(Blockchain, Name) {

        let data = {
            "Blockchain" : HexFix(Blockchain),
            "Domain" : Name,
            "Version" : Version
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
    async function GetAssetList(Blockchain) {

        let data = {
            "Blockchain" : HexFix(Blockchain),
            "Version" : Version
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
    async function GetAsset(Blockchain, Name) {

        let data = {
            "Blockchain" : HexFix(Blockchain),
            "AssetName" : Name,
            "Version" : Version
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
    async function GetAssetSupply(Blockchain, Name) {

        let data = {
            "Blockchain" : HexFix(Blockchain),
            "AssetName"  : Name,
            "Version" : Version
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
    async function GetVoucher(Blockchain, Code) {
        let data = {
            "Blockchain" : HexFix(Blockchain),
            "Code" : String(Code),
            "Version" : Version
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
    async function GetBlockRange(Blockchain, Start, End) {

        //console.log(Blockchain + ' S: ' + Start + ' E: ' + End);

        let data = {
            "Blockchain" : HexFix(Blockchain),
            "Start" : String(Start),
            "End" : String(End),
            "Version" : Version
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
    async function GetBlock(Blockchain, Num) {

        let data = {
            "Blockchain" : HexFix(Blockchain),
            "BlockNumber": String(Num),
            "Version" : Version
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
    async function GetBlockCount(Blockchain) {

        let data = {
            "Blockchain" : HexFix(Blockchain),
            "Version" : Version
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
    async function GetAnalytics(Blockchain) {

        let data = {
            "Blockchain" : HexFix(Blockchain),
            "Version" : Version
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
    async function GetBlockchains() {

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
    async function GetPendingTransaction(Blockchain, TxID) {
        try {

            let data = {
                "Blockchain" : HexFix(Blockchain),
                "ID" : HexFix(TxID),
                "Version" : Version
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
    async function GetTransactionbyID(Blockchain, TxID, Start, End) {
        try {

            let data = {
                "Blockchain" : HexFix(Blockchain),
                "ID" : HexFix(TxID),
                "Start" : String(Start),
                "End" : String(End),
                "Version" : Version
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
    async function GetTransactionbyNode(Blockchain, NodeID, Start, End) {
        try {

            let data = {
                "Blockchain" : HexFix(Blockchain),
                "NodeID" : HexFix(NodeID),
                "Start" : String(Start),
                "End" : String(End),
                "Version" : Version
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
    async function GetTransactionbyAddress(Blockchain, Address, Start, End) {
        try {

            let data = {
                "Blockchain" : HexFix(Blockchain),
                "Address" : HexFix(Address),
                "Start" : String(Start),
                "End" : String(End),
                "Version" : Version
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


    async function GetWalletNonce(Blockchain, Address) {
        let data = {
            "Blockchain": HexFix(Blockchain),
            "Address": HexFix(Address),
            "Version": Version
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
    async function GetTransactionbyDate(Blockchain, Address, StartDate, endDate) {
        try {
            let data = {
                "Blockchain": HexFix(Blockchain),
                "Address": HexFix(Address),
                "StartDate": StartDate,
                "EndDate": endDate,
                "Version" : Version
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
    async function SendTransaction( ID, // Transaction ID (hash)
                                    From, // Sender Wallet address
                                    To, // Receiver Wallet Address
                                    Timestamp, // Transaction Timestamp
                                    Type, // Type of Transaction
                                    Payload, // Payload of transaction in accordance with the type
                                    Nonce,
                                    Signature, // Private Key for the Sender Wallet Address
                                    Blockchain  // Blockchain on which the transaction will be stored (it will involve only assetts on the same chain)
    )
    {
        let data = {
            "ID" : HexFix(ID),
            "From" : HexFix(From),
            "To" : HexFix(To),
            "Timestamp" : Timestamp,
            "Payload" : String(HexFix(Payload)),
            "Nonce" : String(Nonce),
            "Signature" : HexFix(Signature),
            "Blockchain" : HexFix(Blockchain),
            "Type" : Type,
            "Version" : Version
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
    async function sendTransactionWithPK(From, SenderPK, To, Type, Payload, Blockchain) {
        try {
            // Correggi i valori di input
            From      = HexFix(From);
            To        = HexFix(To);
            SenderPK  = HexFix(SenderPK);
            Payload   = HexFix(stringToHex(JSON.stringify(Payload)));
    
            // Attendi il risultato della promessa GetWalletNonce
            let nonceData = await GetWalletNonce(Blockchain, From);
            if (!nonceData || !nonceData.Response || typeof nonceData.Response.Nonce === 'undefined') {
                throw new Error('Nonce non trovato');
            }
    
            let Nonce = nonceData.Response.Nonce + 1; // Accedi alla proprietà Nonce
    
            // Ottieni il timestamp e crea l'ID
            let Timestamp = getFormattedTimestamp();
            let ID = sha256(Blockchain + From + To + Payload + String(Nonce) + Timestamp);
    
            // Firma il messaggio
            let Signature = SignMessage(ID, SenderPK); // Usa SenderPK per la firma
    
            // Invia la transazione
            return await SendTransaction(ID, From, To, Timestamp, Type, Payload, Nonce, Signature, Blockchain);
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
export default CircularProtocolAPI;
