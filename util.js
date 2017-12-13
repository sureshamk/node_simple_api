let headers = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type, accept",
    "access-control-max-age": 10,
    "Content-Type": "application/json"
};

exports.prepareResponse = function (req, cb) {
    let data = "";
    req.on('data', function (chunk) {
        data += chunk;
    });
    req.on('end', function () {
        cb(data);
    });
};

exports.respond = function (res, data, status) {
    status = status || 200;
    res.writeHead(status, headers);
    res.end(data);
};

exports.send404 = function (res) {
    exports.respond(res, JSON.stringify({"result": "Not found"}), 404);
};
exports.isValidFile = function (res, files) {
    if (Object.keys(files).length === 0) {
        return {file: "Please upload file"};
    }

    if (typeof  files.image === 'undefined') {
        return {file: "Please upload a image file "};
    }

    if ((files.image.type === 'image/jpeg') || (files.image.type === 'image/png')) {
        return true;
    } else {
        return {file: "Please upload a jpeg or png  image file"};
    }
};

exports.redirector = function (res, loc, status) {
    status = status || 302;
    res.writeHead(status, {Location: loc});
    res.end();
};

exports.validateInput = function (data) {
    let validationFields = {
        'first_name': {
            'required': true,
            'pattern': '',
            'message': '',
            'fieldName': 'First Name'
        },
        'last_name': {
            'required': true,
            'pattern': '',
            'message': '',
            'fieldName': 'Last Name'
        },
        'father_name': {
            'required': true,
            'pattern': '',
            'message': '',
            'fieldName': 'Father Name'
        },
        'pan': {
            'required': true,
            'pattern': /(^([a-zA-Z]{5})([0-9]{4})([a-zA-Z]{1})$)/,
            'message': 'Invalid PAN number',
            'fieldName': 'PAN Number'
        },
        'dob': {
            'required': true,
            'pattern': /^\d{2}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/,
            'message': 'Date of birth format should be yy/mm/dd',
            'fieldName': 'Date of birth'
        },
        'gender': {
            'required': true,
            'pattern': /male$|female$/,
            'message': 'Gender should male or female',
            'fieldName': 'Gender'
        },
        'email': {
            'required': true,
            'pattern': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'message': "Invalid email address",
            'fieldName': 'Email'
        },
        'address': {
            'required': true,
            'pattern': '',
            'message': '',
            'fieldName': 'Address'
        }
    };
    let validateResult = [];

    for (field in validationFields) {
        let validation = validationFields[field];
        let vali = {};

        if (data[field]) {
            let a = data[field];
            data[field] = a.trim();
        }
        if (validation.required) {
            if (data[field]) {
                let a = data[field];
                data[field] = a.trim();
            }
            if (!data.hasOwnProperty(field) && !data[field]) {
                let v2 = vali["" + field + ""] = {};
                v2['required'] = "The " + validationFields[field]["fieldName"] + " required";
            } else {

                if (data[field].length === 0) {
                    let v2 = vali["" + field + ""] = {};
                    v2['required'] = "The " + validationFields[field]["fieldName"] + " required";
                }
            }
        }
        if (validation.pattern) {
            if (data.hasOwnProperty(field)) {
                if (data[field]) {
                    let re = new RegExp(validation.pattern);
                    if (!re.test(data[field])) {
                        let v2 = vali["" + field + ""] = {};
                        v2['pattern'] =  validationFields[field]["message"] ;
                    }
                }
            }
        }
        if (Object.keys(vali).length)
            validateResult.push(vali)
    }
    return validateResult;
};