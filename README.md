# Social Network

## Functionality

### User Account Registration

![Registration](./demo/registration.gif)

### Uploading Photos

![Upload](./demo/upload.gif)

### Commenting On Photos

![Commenting](./demo/commenting.gif)

### Deleting Your Comments or Comments On Your Photos

![Delete Comment](./demo/delete_comment.gif)

### Deleting Your User Account

![Delete Account](./demo/delete_account.gif)

## Try It Out

### Dependencies on Mac

Homebrew installation:

    /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

Node, MongoDB and Express installation:

    brew install node
    brew install mongodb
    sudo mkdir -p /data/db
    sudo chown -R `id -un` /data/db
    npm install --save express-session

Additional dependencies:

    npm install --save body-parser
    npm install --save multer

### Run

Run each of these on a new tab in the same directory. Note that `node loadDatabase.js` will completely clear the database each time it is run, because I have initialized no fake starting accounts, so be careful when running this.

    mongod
    node webServer.js & npm run build:w
    node loadDatabase.js

If you encounter any problems after quitting your terminal without having stopped Mongo or Node properly, try running either of these commands (`pgrep mongo` gives you the process number of the Mongo session still running in the background):

    pgrep mongo
    kill <process number>
    killall -9 node
