//* ------------------------------------------------------------------------ *//
//* Mock for chrome.storage.local
const storageMock = (() => {
  let storage = {};

  return {
    get: jest.fn((key, callback) => {
      callback(key ? { [key]: storage[key] } : storage);
    }),
    set: jest.fn((items, callback) => {
      storage = { ...storage, ...items };
      if (callback) callback();
    }),
    clear: jest.fn(() => {
      storage = {};
    }),
    remove: jest.fn((key, callback) => {
      delete storage[key];
      if (callback) callback();
    }),
  };
})();

//* ------------------------------------------------------------------------ *//
//* Mock for chrome.runtime.Port
let connectedPair;

class MockPort {
  constructor(counterpart = null) {
    this.counterpart = counterpart;
    this.onMessage = {
      addListener: jest.fn((listener) => {
        this.messageListener = listener;
      }),
      removeListener: jest.fn(() => {
        this.messageListener = null;
      }),
    };
    this.postMessage = jest.fn((message) => {
      setTimeout(() => {
        this.counterpart?.messageListener?.(message);
      }, 0);
    });
  }
}
// const mockPorts = [];
// class MockPort {
//   constructor() {
//     this.onMessage = {
//       addListener: jest.fn((listener) => {
//         this.messageListener = listener;
//       }),
//       removeListener: jest.fn((listener) => {
//         if (this.messageListener === listener) {
//           this.messageListener = null;
//         }
//       }),
//     };
//     this.postMessage = jest.fn((message) => {
//       this.messageListener?.(message);
//     });
//   }
// }

//* ------------------------------------------------------------------------ *//
//* Mock for chrome.cookies.Cookie
require("dotenv").config();
const cookiesMock = {
  get: jest.fn((details, callback) => {
    const cookieName = details.name;
    const cookieValue = process.env["USER_COOKIE"];
    if (cookieValue) {
      callback({ name: cookieName, value: cookieValue });
    } else {
      callback(null);
    }
  }),
};

//* ------------------------------------------------------------------------ *//
//* Mock for chrome.runtime
const runtimeMock = {
  onConnect: {
    addListener: jest.fn((listener) => {
      if (connectedPair) {
        listener(connectedPair.serverPort);
      } else {
        connectedPair = {
          clientPort: new MockPort(),
          serverPort: new MockPort(),
        };
        connectedPair.clientPort.counterpart = connectedPair.serverPort;
        connectedPair.serverPort.counterpart = connectedPair.clientPort;
      }
    }),
  },
  connect: jest.fn(() => {
    if (connectedPair) {
      return connectedPair.clientPort;
    } else {
      connectedPair = {
        clientPort: new MockPort(),
        serverPort: new MockPort(),
      };
      connectedPair.clientPort.counterpart = connectedPair.serverPort;
      connectedPair.serverPort.counterpart = connectedPair.clientPort;
      return connectedPair.clientPort;
    }
  }),
};
// const runtimeMock = {
//   onConnect: {
//     addListener: jest.fn((listener) => {
//       const mockPort = new MockPort();
//       mockPorts.push(mockPort);
//       listener(mockPort);
//     }),
//   },
//   connect: jest.fn(() => {
//     const mockPort = new MockPort();
//     mockPorts.push(mockPort);
//     return mockPort;
//   }),
// };

//* ------------------------------------------------------------------------ *//
//* Mock for chrome
global.chrome = {
  storage: {
    local: storageMock,
  },
  runtime: runtimeMock,
  cookies: cookiesMock,
};
