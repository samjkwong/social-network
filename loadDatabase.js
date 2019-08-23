"use strict";

/* jshint node: true */
/* global Promise */

/*
 * first have an instance of the MongoDB running on the localhost: mongod
 * run with the command: node loadDatabase.js
 */

var projectModels = require('./modelData/photoApp.js').projectModels;
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/socialnetwork');

// Load the Mongoose schema for Use and Photo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var versionString = '1.0';

// We start by removing anything that existing in the collections.
var removePromises = [User.remove({}), Photo.remove({}), SchemaInfo.remove({})];

Promise.all(removePromises).then(function () {

    var userModels = projectModels.userListModel();
    var mapFakeId2RealId = {}; // Map from fake id to real Mongo _id
    var userPromises = userModels.map(function (user) {
        return User.create({
            first_name: user.first_name,
            last_name: user.last_name,
            location: user.location,
            description: user.description,
            occupation: user.occupation,
            login_name: user.last_name.toLowerCase(),
            password: 'weak'
        }).then(function (userObj) {
            // Set the unique ID of the object. We use the MongoDB generated _id for now
            // but we keep it distinct from the MongoDB ID so we can go to something
            // prettier in the future since these show up in URLs, etc.
            userObj.save();
            mapFakeId2RealId[user._id] = userObj._id;
            user.objectID = userObj._id;
            console.log('Adding user:', user.first_name + ' ' + user.last_name, ' with ID ',
                user.objectID);
        }).catch(function (err){
            console.error('Error create user', err);
        });
    });


    var allPromises = Promise.all(userPromises).then(function () {
        // Once we've loaded all the users into the User collection we add all the photos. Note
        // that the user_id of the photo is the MongoDB assigned id in the User object.
        var photoModels = [];
        var userIDs = Object.keys(mapFakeId2RealId);
        for (var i = 0; i < userIDs.length; i++) {
            photoModels = photoModels.concat(projectModels.photoOfUserModel(userIDs[i]));
        }
        var photoPromises = photoModels.map(function (photo) {
            return Photo.create({
                file_name: photo.file_name,
                date_time: photo.date_time,
                user_id: mapFakeId2RealId[photo.user_id]
            }).then(function (photoObj) {
                photo.objectID = photoObj._id;
                if (photo.comments) {
                    photo.comments.forEach(function (comment) {
                        photoObj.comments = photoObj.comments.concat([{
                            comment: comment.comment,
                            date_time: comment.date_time,
                            user_id: comment.user.objectID
                        }]);
                        console.log("Adding comment of length %d by user %s to photo %s",
                            comment.comment.length,
                            comment.user.objectID,
                            photo.file_name);
                    });
                }
                photoObj.save();
                console.log('Adding photo:', photo.file_name, ' of user ID ', photoObj.user_id);
            }).catch(function (err){
                console.error('Error create user', err);
            });
        });
        return Promise.all(photoPromises).then(function () {
            // Create the SchemaInfo object
            return SchemaInfo.create({
                version: versionString
            }).then(function (schemaInfo) {
                console.log('SchemaInfo object created with version ', versionString);
                console.log(schemaInfo);
            }).catch(function (err){
                console.error('Error create schemaInfo', err);
            });
        });
    });

    allPromises.then(function () {
        mongoose.disconnect();
    });

}).catch(function(err){
    console.error('Error create schemaInfo', err);
});
