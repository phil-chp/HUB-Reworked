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

module.exports = runtimeMock;
