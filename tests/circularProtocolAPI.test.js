// /tests/circularProtocolAPI.test.js
const CircularProtocolAPI = require('../lib/index.cjs');
const nock = require('nock');

describe('CircularProtocolAPI - GetBlockchains', () => {
  
  // Mocking the response from the server
  beforeEach(() => {
    nock('https://nag.circularlabs.io') // Mock the server
      .post('/NAG.php?cep=Circular_GetBlockchains_') // Simulate the correct endpoint
      .reply(200, {
        Result: 200,
        Response: {
          Blockchains: [
            { Address: "714d2ac07a826b66ac56752eebd7c77b58d2ee842e523d913fd0ef06e6bdfcae", Name: "Circular Main Public" },
            { Address: "acb8a9b79f3c663aa01be852cd42725f9e0e497fd849b436df51c5e074ebeb28", Name: "Circular Secondary Public" },
            { Address: "e087257c48a949710b48bc725b8d90066871fa08f7bbe75d6b140d50119c481f", Name: "Circular Documark Public" },
            { Address: "8a20baa40c45dc5055aeb26197c203e576ef389d9acb171bd62da11dc5ad72b2", Name: "Circular SandBox" }
          ]
        },
        Node: "fc8fe5ee103dafe353c98ce90a1cb2956fd51a109512e074bd3d26a06d268e81"
      });
  });

  // Cleanup after each test
  afterEach(() => {
    nock.cleanAll();
  });

  test('should return the list of blockchains with their addresses and names', async () => {
    const response = await CircularProtocolAPI.getBlockchains();

    expect(response.Result).toBe(200);
    expect(response.Response.Blockchains).toEqual([
      { Address: "714d2ac07a826b66ac56752eebd7c77b58d2ee842e523d913fd0ef06e6bdfcae", Name: "Circular Main Public" },
      { Address: "acb8a9b79f3c663aa01be852cd42725f9e0e497fd849b436df51c5e074ebeb28", Name: "Circular Secondary Public" },
      { Address: "e087257c48a949710b48bc725b8d90066871fa08f7bbe75d6b140d50119c481f", Name: "Circular Documark Public" },
      { Address: "8a20baa40c45dc5055aeb26197c203e576ef389d9acb171bd62da11dc5ad72b2", Name: "Circular SandBox" }
    ]);
  });
});

