# CircularProtocolAPI

`CircularProtocolAPI` is a Node.js library to interact with the Circular Layer 1 Blockchain protocol, supporting both CommonJS (CJS) and ES Modules (ESM).

## Installation

Install via npm:

```bash
npm install circular-protocol-api
```
## Usage 

### CommonJS
```js
const CircularProtocolAPI = require('circularprotocolapi');

CircularProtocolAPI.CheckWallet('BlockchainHex', 'WalletAddressHex')
    .then(response => console.log(response))
    .catch(error => console.error('Error:', error));
```
### ES Modules
```js
import CircularProtocolAPI from 'circularprotocolapi';

CircularProtocolAPI.GetWallet('BlockchainHex', 'WalletAddressHex')
    .then(wallet => console.log(wallet))
    .catch(error => console.error('Error:', error));
```


