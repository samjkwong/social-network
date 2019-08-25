"use strict";

/* jshint node: true */

/*
 * To start the webserver run the command:
 *    node webServer.js
 */


var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var Activity = require('./schema/activity.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

mongoose.connect('mongodb://localhost/socialnetwork', { useMongoClient: true });

var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
var fs = require("fs");
var assert = require('assert');

app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

app.get('/activityFeed', (request, response) => {
    console.log('/activityFeed backend reached!');
    if (!request.session.login_name) {
        response.status(401).send('User not logged in');
        return;
    }

    Activity.find({}).sort('-date_time').limit(5).exec((error, activities) => {
        if (error) {
            console.log('Error with finding feed');
            response.status(500).send();
            return;
        }
        response.status(200).send(activities);
    });
});

app.get('/lastUpload/:user_id', (request, response) => {
    console.log('/lastUpload backend reached!');
    if (!request.session.login_name) {
        response.status(401).send('User not logged in');
        return;
    }

    Photo.find({user_id: request.params.user_id}).sort('-date_time').limit(1).exec((error, photos) => {
        if (error) {
            console.log('Error finding photos in /lastUpload');
            response.status(500).send();
            return;
        }
        response.status(200).send(photos[0]);
    });
});

app.get('/popularUpload/:user_id', (request, response) => {
    console.log('/popularUpload backend reached!');
    if (!request.session.login_name) {
        response.status(401).send('User not logged in');
        return;
    }

    Photo.find({user_id: request.params.user_id}, (error, photos) => {
        if (error) {
            console.log('Error finding photos in /popularUpload');
            response.status(500).send();
            return;
        }
        var mostPopularPhoto = photos[0];
        for (var photo of photos.slice(1,)) {
            if (photo.comments.length > mostPopularPhoto.comments.length) {
                mostPopularPhoto = photo;
            }
        }
        response.status(200).send(mostPopularPhoto);
    });
});

app.post('/removeComment/:photo_id', (request, response) => {
    console.log('/removeComment backend reached!');
    if (!request.session.login_name) {
        response.status(401).send('User not logged in');
        return;
    }

    var time;
    // overwrite the comments array of that photo to omit that comment
    Photo.findOne({_id: request.params.photo_id}, (error, photo) => {
        if (error) {
            console.log('Error finding photo in /removeComment');
            response.status(500).send();
            return;
        }
        var newCommentsArr = [];
        for (var comment of photo.comments) {
            if (comment._id != request.body.comment_id) {
                newCommentsArr = newCommentsArr.concat([comment]);

            } else {
                if (comment.user_id != request.session.user_id) {
                    response.status(400).send('Cannot delete another user\'s comment');
                    return;
                }
                time = comment.date_time;
            }
        }
        photo.comments = newCommentsArr;
        photo.save();
        console.log(newCommentsArr);
        Activity.deleteOne({date_time: time}, (error) => {
            console.log(time);
            assert(!error);
            User.findOne({_id: request.session.user_id}, (error, user) => {
                if (error) {
                    console.log('Error finding user in /removeComment');
                    response.status(500).send();
                    return; 
                }
                user.activity = {};
                user.save();
            });
            console.log('Successfully removed comment activity');
        });
        response.status(200).send();
    });
});

app.post('/removePhoto/:photo_id', (request, response) => {
    console.log('/removePhoto backend reached!');
    if (!request.session.login_name) {
        response.status(401).send('User not logged in');
        return;
    }

    Photo.findOne({_id: request.params.photo_id}, (error, photo) => {
        if (error) {
            console.log('Error finding photo in /removePhoto');
            response.status(500).send();
            return;
        }
        
        Activity.deleteMany({file_name: photo.file_name}, (error) => {
            assert(!error);
            console.log('Deleting activity associated with photo');
            User.findOne({_id: request.session.user_id}, (error, user) => {
                if (error) {
                    console.log('Error finding user in /removePhoto');
                    response.status(500).send();
                    return; 
                }
                user.activity = {};
                user.save();
            });
        });

        Photo.deleteOne({_id: request.params.photo_id}, (error) => {
            assert(!error);
            console.log('Deleting photo');
        });
    });
    response.status(200).send();
});

app.post('/removeUser/', (request, response) => {
    console.log('/removeUser backend reached!');
    if (!request.session.login_name) {
        response.status(401).send('User not logged in');
        return;
    }

    User.findOne({_id: request.body.user._id}, (error, user) => {
        if (error) {
            console.log('Error finding user in removeUser');
            response.status(500).send();
        }

        // delete all activity related to user
        Activity.deleteMany({login_name: user.login_name}, (error) => {
            assert(!error);
            console.log('Deleting all activity associated with user');
            
            // delete all user's photos
            Photo.deleteMany({user_id: request.body.user._id}, (error) => {
                assert(!error);
                console.log('Deleting all user\'s photos');
            });

            // delete all user's comments on others' photos
            Photo.find({}, (error, photos) => {
                for (var photo of photos) {
                    var newCommentsArr = [];
                    for (var comment of photo.comments) {
                        if (comment.user_id != request.body.user._id) {
                            newCommentsArr = newCommentsArr.concat([comment]);
                        }
                    }
                    photo.comments = newCommentsArr;
                    photo.save();
                }
            });

            // delete user
            User.deleteOne({_id: request.session.user_id}, (error) => {
                assert(!error);
                console.log('Deleting user');
            });

            // log out user and destroy session
            delete request.session.login_name;
            delete request.session.user_id;
            request.session.destroy((error) => {
                if (error) {
                    console.log(error);
                    response.status(500).send();
                    return;
                }
            });
            response.status(200).send();
        });
    });
});


app.post('/admin/login', (request, response) => {
    console.log('/admin/login backend reached!');

    User.findOne({login_name: request.body.login_name}, (error, user) => {
        if (error) {
            console.log('Doing /admin/login error, ' + error);
            response.status(500).send(JSON.stringify(error));
            return;
        }
        // check if login name exists
        if (!user) {
            console.log('User ' + request.body.login_name + ' not found');
            response.status(400).send('Username not found. Please try again.');
            return;
        }
        // check if password matches
        if (request.body.password !== user.password) {
            console.log('Password incorrect');
            response.status(400).send('Password is incorrect. Please try again.');
            return;
        }

        // update activity feed
        Activity.create({
            type: 'login',
            date_time: Date.now(),
            login_name: request.body.login_name
        }, (error, newActivity) => {
            assert(!error);
            newActivity.save();
            console.log('Successfully saved activity of login by user ' + request.body.login_name);
            user.activity = newActivity;
            user.save();
            // create session fields and send response back
            console.log('User ' + request.body.login_name + ' found!');
            request.session.login_name = request.body.login_name; // adds login_name to session
            request.session.user_id = user._id;
            response.status(200).send(user);
        });
    });
});

app.post('/admin/logout', (request, response) => {
    console.log('/admin/logout backend reached!');  
    // check if user is logged in
    if (!request.session.login_name) {
        response.status(400).send();
        return;
    }

    var login_name = request.session.login_name;

    delete request.session.login_name;
    delete request.session.user_id;
    request.session.destroy((error) => {
        if (error) {
            console.log(error);
        } else {
            // update activity feed
            Activity.create({
                type: 'logout',
                date_time: Date.now(),
                login_name: login_name
            }, (error, newActivity) => {
                assert(!error);
                newActivity.save();
                console.log('Successfully saved activity of logout by user ' + login_name);
                User.findOne({login_name: login_name}, (error, user) => {
                    if (error) {
                        console.log('Error in finding user in /admin/logout');
                        response.status(500).send()
                        return;
                    }
                    user.activity = newActivity;
                    user.save();
                });
            });
            response.status(200).send();
        }
    });
});

app.post('/commentsOfPhoto/:photo_id', (request, response) => {
    console.log('/commentsOfPhoto/:photo_id backend reached!');
    // check if comment is empty
    if (!request.body.comment) {
        response.status(400).send('Comment is empty');
        return;
    }
    Photo.findOne({_id: request.params.photo_id}, (error, photo) => {
        if (error) {
            console.log('Doing /commentsOfPhoto/:photo_id error, ' + error);
            response.status(500).send(JSON.stringify(error));
            return;
        }
        if (!photo) {
            console.log('Photo not found');
            response.status(400).send('Photo not found');
            return;
        }
        // update photo object with new comment
        var c_obj = {comment: request.body.comment, date_time: Date.now(), user_id: request.session.user_id};
        photo.comments = photo.comments.concat([c_obj]);
        photo.save();

        // update activity feed
        Activity.create({
            type: 'comment',
            date_time: c_obj.date_time,
            login_name: request.session.login_name,
            file_name: photo.file_name,
            photo_owner_id: photo.user_id,
            comment: request.body.comment
        }, (error, newActivity) => {
            assert(!error);
            newActivity.save();
            console.log('Successfully saved activity of commenting by user ' + request.session.login_name);
            User.findOne({_id: request.session.user_id}, (error, user) => {
                if (error) {
                    console.log('Error in finding user in new comment');
                    response.status(500).send();
                    return;
                }
                user.activity = newActivity;
                user.save();
            });
        });

        response.status(200).send(c_obj);
    });

});

app.post('/photos/new', (request, response) => {
    console.log('/photos/new backend reached!');

    processFormBody(request, response, function (error) {
        if (error || !request.file) {
            // XXX -  Insert error handling code here.
            response.status(400).send('No file in POST request');
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes

        // XXX - Do some validation here.
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + request.file.originalname;

        fs.writeFile("./images/" + filename, request.file.buffer, function (error) {
            // XXX - Once you have the file written into your images directory under the name
            // filename you can create the Photo object in the database
            if (error) {
                console.log('Doing fs.writeFile error, ' + error);
                response.status(500).send(JSON.stringify(error));
                return; 
            }
            Photo.create({
                file_name: filename,
                date_time: Date.now(),
                user_id: request.session.user_id,
                comments: []
            }, (error, newPhoto) => {
                assert (!error);
                newPhoto.save();
                console.log('New photo uploaded with file_name: ' + newPhoto.file_name);
                // update activity feed
                Activity.create({
                    type: 'photo',
                    date_time: newPhoto.date_time,
                    login_name: request.session.login_name,
                    file_name: filename,
                    photo_owner_id: request.session.user_id
                }, (error, newActivity) => {
                    assert(!error);
                    newActivity.save();
                    console.log('Successfully saved activity of photo uploading by user ' + request.session.login_name);
                    User.findOne({_id: request.session.user_id}, (error, user) => {
                        if (error) {
                            console.log('Error in finding user in photo upload');
                            response.status(500).send();
                            return;
                        }
                        user.activity = newActivity;
                        user.save();
                    });
                });
                response.status(200).send(newPhoto);
            });
        });
    });
});

app.post('/user', (request, response) => {
    console.log('/user backend reached!')

    // error checking
    User.findOne({login_name: request.body.login_name}, (error, user) => {
        if (error) {
            console.log('Doing /user User.findOne error, ' + error);
            response.status(500).send(JSON.stringify(error));
            return; 
        }
        if (user) {
            // requested username already exists
            console.log('Username ' + request.body.login_name + ' already exists');
            response.status(400).send('Username ' + request.body.login_name + ' already exists');
            return;
        }
    });
    if (!request.body.login_name) {
        response.status(400).send('Username must be > 0 characters long');
        return;
    }
    if (!request.body.password) {
        response.status(400).send('Password must be > 0 characters long');
        return;
    }
    if (!request.body.first_name) {
        response.status(400).send('Please provide a first name');
        return;
    }
    if (!request.body.last_name) {
        response.status(400).send('Please provide a last name');
        return;
    }

    // can successfully create user
    User.create({
        login_name: request.body.login_name,
        password: request.body.password,
        first_name: request.body.first_name,
        last_name: request.body.last_name,
        location: request.body.location,
        description: request.body.description,
        occupation: request.body.occupation
    }, (error, newUser) => {
        assert (!error);
        newUser.save();
        console.log('New user created with login_name: ' + request.body.login_name);
        // update activity feed
        Activity.create({
            type: 'registration',
            date_time: Date.now(),
            login_name: request.body.login_name
        }, (error, newActivity) => {
            assert(!error);
            newActivity.save();
            console.log('Successfully saved activity of registration by user ' + request.body.login_name);
            newUser.activity = newActivity;
            newUser.save();
        });
        response.status(200).send('Registration successful!');
        return;
    });
})

/* ----------------------------------------------------------------------------------------- */

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.send(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.send(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    // check if user is logged in
    console.log('in /user/list');
    if (!request.session.login_name) {
        response.status(401).send();
        return;
    }

    var query = User.find({});
    query.select("_id first_name last_name activity").exec((error, info) => {
        if (error) {
            console.log("User list unsuccessful");
            response.status(400).send(JSON.stringify(error));
            return;
        }
        console.log("User list successful");
        response.status(200).send(info);
    });

});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    // check if user is logged in
    if (!request.session.login_name) {
        response.status(401).send();
        return;
    }

    var id = request.params.id;
    var query = User.findOne({_id: id});
    query.select("_id first_name last_name location description occupation").exec((error, info) => {
        if (error) {
            console.log("User detail unsuccessful");
            response.status(400).send(JSON.stringify(error));
            return;
        }
        console.log("User detail successful");
        response.status(200).send(JSON.parse(JSON.stringify(info)));
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    // check if user is logged in
    if (!request.session.login_name) {
        response.status(401).send();
        return;
    }

    var id = request.params.id;
    var query_photos = Photo.find({user_id: id});
    query_photos.select("_id user_id comments file_name date_time").exec((err, info_photo) => {
        if (err) {
            response.status(400).send(err);
            return;
        }

        var photos_copy = JSON.parse(JSON.stringify(info_photo));

        async.each(photos_copy, (photo, callbackPhoto) => {
            var comments_copy = photo.comments;

            async.each(comments_copy, (comment, callbackComment) => {
                var query_user = User.findOne({_id: comment.user_id});
                query_user.select("_id first_name last_name").exec((err_user, info_user) => {
                    comment.user = info_user;
                    delete comment.user_id;
                    if (err_user) {
                        callbackComment(err_user);
                        return;
                    } else {
                        callbackComment();
                        return;
                    }
                });
            }, (err) => {
                if (err) {
                    console.log("Error: " + err);
                    response.status(400).send(err);
                    return;
                } else {
                    callbackPhoto();
                    return;
                }
            });

        }, (err) => {
            if (err) {
                console("Error: " + err);
                response.status(400).send(JSON.stringify(err));
                return;
            }
            response.status(200).send(JSON.stringify(photos_copy));
            return;
        });

    }, (error) => { // main callback
      if (error) {
        console.log("Error: " + error);
        response.status(400).send(error);
        return;
      }
    })
});


var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});

