<img src="assets/icon128.png" alt="icon" width="128" align="left" />
<h1>HUB Reworked</h1>

A simple tool to calculate the amount of XP you currently have to validate your Epitech Hub module.

## Usage

Add as an extension to your chrome browser.

Go to `chrome://extensions`, on the top right enable "Developer Mode", then on the top left, you can select "Load unpacked". Select this folder, and you should be good!

## Dev

Start in development (with watch) mode:

```bash
yarn start
```

## Build

Build the extension:

```bash
yarn build
```

## TODO

- [ ] Implement a hash map of `{ "codeacti": int }` to store all previous projects/experiences, and prevent spamming the server with requests.
  - [ ] This list needs to be stored and grabbed back from local storage, it should never be lost, and be reset on a new school year. (So if `this.userData.year` changes?)
- [ ] Implement the sending of the hub activities to the client, requesting to the user info about how many xp they got from a specific project. These values need to be stored in the hash map to also never again bother the user with this project.
