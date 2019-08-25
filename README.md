# Social Network

A simple photo-sharing social network app. Both front end and back end developed using Mongo, Express, React and Node.

## Functionality

### User Account Registration

Start by creating an account! User account information is stored in your local mongo database. You can only see others once you log in.

![Registration](./demo/registration.gif)

### Uploading Photos

Post your favorite photos. Your profile keeps track of your most recent upload and your most popular upload.

![Upload](./demo/upload.gif)

### Commenting On Photos

Leave comments on your friends photos. Most recent activity is found on the activity feed.

![Commenting](./demo/commenting.gif)

### Deleting Comments

If you uploaded the photo, you can delete anyone's comments. If it is your friend's photo, you can only delete your comments.

![Delete Comment](./demo/delete_comment.gif)

### Deleting Your User Account

Delete your account, along with everything you ever uploaded or commented.

![Delete Account](./demo/delete_account.gif)

## Try It Out

### Dependencies on Mac

Homebrew installation:

    /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

Node, MongoDB and Express installation:

    brew install node
    npm install
    brew install mongodb
    sudo mkdir -p /data/db
    sudo chown -R `id -un` /data/db
    npm install --save express-session

Additional dependencies:

    npm install --save body-parser
    npm install --save multer

### Dependencies on Windows

Install Node from https://nodejs.org/en/download.

Install Mongo from https://www.mongodb.org/downloads#production.

Make sure the directory `C:\data\db` exists and is writable, in order to use Mongo.

### Run

Run each of these on a new tab in the same directory. Note that `node loadDatabase.js` will completely clear the database each time it is run, because I have initialized no fake starting accounts, so be careful when running this.

    mongod
    node webServer.js & npm run build:w
    node loadDatabase.js

Finally, to view the web app, go to the URL: http://localhost:3000/photo-share.html.

This loads `photoShare.jsx` from `photo-share.html`.

### Troubleshooting

If you encounter any problems after quitting your terminal without having stopped Mongo or Node properly, try running either of these commands (`pgrep mongo` gives you the process number of the Mongo session still running in the background):

    pgrep mongo
    kill <process number>
    killall -9 node
