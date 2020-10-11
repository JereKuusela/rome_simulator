This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Installation

Node.js required: https://nodejs.org/en/download/
VSCode recommended: https://code.visualstudio.com/download

Open the project with VSCode and run following in terminal to install libraries:

### `npm install`


## Running

In the project directory, you can run:

### `npm run start_ir`

or

### `npm run start_eu4`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

## Testing

### `npm test`

Launches the test runner in the interactive watch mode.<br>

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Data conversion

This project has scripts to generate data from game data files. These should be used when the game updates and data changes.

The first step is to copy game data to conversion folder.

For IR:

- Contents of game/common to conversion/ir (most folders are needed so easy to just copy all)
- Contents of game/localization/english to conversion/ir/localization/english

For EU4:

- Contents of game/common to conversion/eu4 (at least policies, tech and units)
- Contents of game/localization/policies_l_english.yml to conversion/eu4/localization/english

Then run 

### `npm run convert_ir`

or

### `npm run convert_eu4`
