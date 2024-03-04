//* ------------------------------------------------------------------------ *//
//* Mock for chrome.storage.local
const storageMock = (() => {
  let storage = {};

  return {
    get: jest.fn((keys, callback) => {
      const result = {};
      if (Array.isArray(keys)) {
        keys.forEach((key) => {
          result[key] = storage[key];
        });
      } else {
        for (const key in keys) {
          result[key] = storage[key] || keys[key];
        }
      }
      if (callback) callback(result);
      return result;
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
class MockPort {
  constructor() {
    this.onMessage = {
      listeners: [],
      addListener: function (callback) {
        this.listeners.push(callback);
      },
      removeListener: function (callback) {
        const index = this.listeners.indexOf(callback);
        if (index !== -1) {
          this.listeners.splice(index, 1);
        }
      },
      dispatch: function (message) {
        this.listeners.forEach((listener) => listener(message));
      },
    };
    this.postMessage = jest.fn((message) => {
      // Simulate sending message back to the client
      this.onMessage.dispatch(message);
    });
  }
}

const mockPort = new MockPort();

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
  connect: jest.fn().mockImplementation(() => {
    setTimeout(() => global.chrome.runtime.onConnect.dispatch(mockPort), 0);
    return mockPort;
  }),
  onConnect: {
    listeners: [],
    addListener: function (callback) {
      this.listeners.push(callback);
    },
    dispatch: function (port) {
      this.listeners.forEach((listener) => listener(port));
    },
  },
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
