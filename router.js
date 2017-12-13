const url = require('url');
const utils = require('./util');
const mongo = require('mongodb');
const formidable = require('formidable');
const fs = require('fs');
const MongoClient = mongo.MongoClient;
const config = require('./config.json');
const MongoUrl = "mongodb://" + config.mongo.host + ":" + config.mongo.port;
const crypto = require('crypto');

let actions = {
    'GET': function (request, response) {

        // if your router needs to pattern-match endpoints
        let parsedUrl = url.parse(request.url);
        let endPoint = parsedUrl.pathname;


        if (endPoint === '/api/customers') {
            let queryData = url.parse(request.url, true).query;
            if (queryData.token) {
                MongoClient.connect(MongoUrl, function (err, db) {
                    if (err) {
                        return utils.respond(response, JSON.stringify({"result": "Something Went wrong in db connection"}), "422");
                    }
                    let collection = db.db(config.mongo.db).collection(config.mongo.collection);
                    collection.findOne(queryData, function (err, result) {
                        if (err) {
                            return utils.respond(response, JSON.stringify({"result": "Something wrong in db collection"}), "404");
                        }
                        if (!result) {
                            return utils.respond(response, JSON.stringify({"result": "Invalid token"}), "404");
                        }
                        db.close();
                        return utils.respond(response, JSON.stringify(result), "200");

                    });
                });
            } else {
                return utils.send404(response)
            }
        } else {
            return utils.send404(response)
        }
    },

    'POST': function (req, res) {
        let parsedUrl = url.parse(req.url);
        let endPoint = parsedUrl.pathname;

        if (endPoint === '/api/customers') {
            let form = new formidable.IncomingForm();
            form.parse(req, function (err, fields, files) {

                let validation = utils.validateInput(fields);
                if (validation.length !== 0) {
                    utils.respond(res, new Buffer.from(JSON.stringify(validation)), "422");
                } else {
                    // validate file
                    let validationFile = utils.isValidFile(res, files);

                    if (validationFile !== true) {
                        return utils.respond(res, new Buffer.from(JSON.stringify(validationFile)), "422");
                    }

                    let oldpath = files.image.path;
                    let newpath = config.uploads.dir +"/" + files.image.name;
                    fs.rename(oldpath, newpath, function (err) {
                        if (err) throw err;
                        let tokenString = fields.first_name + fields.dob + new Date().getTime();
                        let md5 = crypto.createHash('md5').update(tokenString).digest("hex");
                        fields.token = md5;
                        MongoClient.connect(MongoUrl, function (err, db) {
                            if (err) throw err;
                            fields.path = newpath;
                            let collection = db.db(config.mongo.db).collection(config.mongo.collection);
                            collection.insertOne(fields, function (err, result) {
                                if (err) throw err;
                                // let insertedRecord = result.ops[0];
                                utils.respond(res, JSON.stringify({token: md5}), "200");
                                db.close();
                            });
                        });
                    });
                }
            });
        } else {
            return utils.send404(res)
        }
    }
};

exports.handleRequest = function (req, res) {
    let action = actions[req.method];
    action ? action(req, res) : utils.send404(res);
};
