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
    })
  };
})();



//* ------------------------------------------------------------------------ *//
//* Mock for chrome.runtime.Port
class MockPort {
  constructor() {
    this.onMessage = {
      addListener: jest.fn((listener) => {
        this.messageListener = listener;
      }),
      removeListener: jest.fn((listener) => {
        if (this.messageListener === listener) {
          this.messageListener = null;
        }
      }),
    };
    this.postMessage = jest.fn((message) => {
      this.messageListener?.(message);
    });
  }
}

const mockPorts = [];
const runtimeMock = {
  onConnect: {
    addListener: jest.fn((listener) => {
      const mockPort = new MockPort();
      mockPorts.push(mockPort);
      listener(mockPort);
    }),
  },
  connect: jest.fn(() => {
    const mockPort = new MockPort();
    mockPorts.push(mockPort);
    return mockPort;
  }),
  // Mock any other necessary chrome.runtime properties or methods here
};

//* ------------------------------------------------------------------------ *//
//* Mock for chrome.cookies.Cookie
require('dotenv').config();
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
//* Mock for chrome
global.chrome = {
  storage: {
    local: storageMock,
  },
  runtime: runtimeMock,
  cookies: cookiesMock,
};
