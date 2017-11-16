var crypto = require('crypto');
var mongoose = require('mongoose'),
Customers = mongoose.model('Customer'),
Address = mongoose.model('Address'),
Billing = mongoose.model('Billing'),
ShippingAddress = mongoose.model('ShippingAddress'),
    Review = mongoose.model('Review');
var querystring = require('querystring');
var config = require('config');
var http = require('http');
// this is the getKey function that generates an encryption Key for you by passing your Secret Key as a parameter.
function getKey(seckey){
    var md5 = require('md5');
    var keymd5 = md5(seckey);
    var keymd5last12 = keymd5.substr(-12);

    var seckeyadjusted = seckey.replace('FLWSECK-', '');
    var seckeyadjustedfirst12 = seckeyadjusted.substr(0, 12);

    return seckeyadjustedfirst12 + keymd5last12;
}

// This is the encryption function that encrypts your payload by passing the stringified format and your encryption Key.
function encrypt(key, text)
{
    var CryptoJS = require('crypto-js');
    var forge    = require('node-forge');
    var utf8     = require('utf8');
    var cipher   = forge.cipher.createCipher('3DES-ECB', forge.util.createBuffer(key));
    cipher.start({iv:''});
    cipher.update(forge.util.createBuffer(text, 'utf-8'));
    cipher.finish();
    var encrypted = cipher.output;
    return ( forge.util.encode64(encrypted.getBytes()) );
}

function raveDirectCharge() {
    var options = {
        host: 'flw-pms-dev.eu-west-1.elasticbeanstalk.com',
        path: 'flwv3-pug/getpaidx/api/charge',
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        }
    };
}

function hashPW(pwd) {
    return crypto.createHash('sha256').update(pwd).
        digest('base64').toString();
}
exports.signup = function (req, res) {
  var address = new Address({address:req.body.address, city:req.body.city, state:req.body.state});
  var customer = new Customers({firstname:req.body.cusname,
     lastname:req.body.cuslastname, email: req.body.cusemail,
     phonenumber:req.body.cusnumber, password: hashPW(req.body.cuspassword),
      address:[address.toObject()]
  });
  customer.save(function (err) {
    if(err){
      res.render('signup', function () {
          res.send(err);
      });
    }else {
      req.session.userid = customer.id;
      req.session.firstname = customer.firstname;
      req.session.lastname = customer.lastname;
      req.session.email = customer.email;
      req.session.phonenumber = customer.phonenumber;
      req.session.address = customer.address;
      req.session.msg = 'Welcome to bespoke cakes, ' + customer.firstname;
      res.redirect('/');
    }
  });
};
exports.login = function (req, res) {
  Customers.findOne({email:req.body.loginemail}).exec(function (err, customer) {
    if(!customer){
      err = 'Customer does not exist';
    }else if (customer.password === hashPW(req.body.loginpassword.toString())){
          req.session.regenerate(function () {
            req.session.userid = customer.id;
            req.session.firstname = customer.firstname;
            req.session.lastname = customer.lastname;
            req.session.email = customer.email;
            req.session.phonenumber = customer.phonenumber;
            req.session.address = customer.address;
            req.session.msg = 'Welcome to bespoke cakes, ' + customer.firstname;
            res.redirect('/');
          });
    }else {
      err = 'Email or Password incorrect. ';
    }
      if (err){
          req.session.regenerate(function () {
              req.session.msg = err;
              res.redirect('/login');
          });
      }
  });
};
exports.getCustomer = function (req, res) {
  Customers.findOne({_id:req.session.userid}).exec(function (err, customer) {
    if(!customer){
      res.json(404, {err:'Error fetching out user\'s records. '});
    }else{
      res.json(customer);
    }
  });
};
exports.updateCustomer = function (req, res) {
  Customers.findOne({_id: req.session.userid}).exec(function (err, customer) {
    var address = new Address({address:req.body.address, city:req.body.city, state:req.body.state});
    customer.set('firstname', req.body.firstname);
    customer.set('lastname', req.body.lastname);
    customer.set('email', req.body.email);
    customer.set('phonenumber', req.body.phonenumber);
    customer.set('address', [address.toObject()]);
    customer.save(function (err) {
      if(err){
        res.session.error(err);
      }else {
        req.session.msg = 'User Updated.';
        req.session.regenerate(function () {
          req.session.firstname = customer.firstname;
          req.session.lastname = customer.lastname;
          req.session.email = customer.email;
          req.session.phonenumber = customer.phonenumber;
          req.session.address = customer.address;
          req.session.msg = 'Your data has been updated ' + customer.firstname;
          res.redirect('/profile');
        });
      }
    });
  });
};
exports.addReview = function (req, res) {
    var review = new Review({userid: req.session.userid, firstname:req.session.firstname,
        lastname: req.session.lastname,review: req.body.review
    });
    review.save(function (err, results) {
        if(err){
            res.json(500, "Failed to save Order.");
        } else {
            res.json(200, {msg:'Thank you for the review'});
        }
    });
};
exports.deleteCustomer = function (req, res) {
  Customers.findOne({_id:req.session.userid}).exec(function (err, customer) {
    if(customer){
      customer.remove(function (err) {
          if (err) {
              req.session.msg = err;
          }
          req.session.destroy(function () {
              res.redirect('/');
          });
        });
    }else {
        req.session.msg = "Customer Not Found!";
        req.session.destroy(function () {
            res.redirect('/');
        });
    }
  });
};
exports.updateShipping = function (req, res) {
  var newShipping = new ShippingAddress(req.body.updatedShipping);
  Customers.update({ _id: req.session.userid},
      {$set: {shipping:[newShipping.toObject()]}})
      .exec(function (err, results) {
          if(err || results < 1){
              res.json(404, {msg: "Failed to update Shipping."});
          }else {
              res.json({msg: "Customer shipping Updated."});
          }
      });
};
exports.updateBilling = function (requ, resp) {
    //verifying the customer's billing details ad halt check out if invalid
    var ccv = requ.body.ccv;
    var amount = requ.body.totalPay;
    var firstname = requ.body.updatedBilling.firstname;
    var lastname = requ.body.updatedBilling.lastname;
    var cardno = requ.body.updatedBilling.cardnumber;
    var email = requ.body.updatedBilling.email;
    var expirymonth = requ.body.updatedBilling.expiremonth;
    var expiryyear = requ.body.updatedBilling.expireyear;
    var phonenumber = requ.body.updatedBilling.phone;

    console.log('---- receivedData ---');
    console.log(firstname,lastname,ccv,cardno,amount,email,phonenumber,expiryyear,expirymonth);

    var data = querystring.stringify({
        firstname: firstname,
        lastname: lastname,
        phonenumber: phonenumber,
        email: email,
        cardno: cardno,
        cvv: ccv,
        expirymonth: expirymonth,
        expiryyear: expiryyear,
        currency: 'NGN',
        country: 'NG',
        amount: 10,
        pin: '',
        suggested_auth: '',
        IP: '',
        txRef: '',
        device_fingerprint: '',
        charge_type: '',
        fee: config.transactionFee,
        redirecturl: 'http://requestb.in/1bfwhor1',
        medium: 'web'

    });

    var encryptedData = encrypt(getKey('FLWSECK-6f3bff66da8859b90831deb87cf12d23-X'), data);

    console.log('---- encryptedData ---');
    console.log(encryptedData);

    var postData = querystring.stringify({
        'PBFPubKey': "FLWPUBK-729f1caf5320ab05672fdb8aa6c6f76c-X",
        'alg': '3DES-24',
        'client': ''
    });
    var options = {
        host: 'flw-pms-dev.eu-west-1.elasticbeanstalk.com',
        path: 'flwv3-pug/getpaidx/api/charge',
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        }
    };

    var req = http.request(options, function (res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            response = JSON.parse(chunk);
            console.log('--- response ---');
            console.log(response);
            if (response.status === 'error' && response.code === 'UNAUTHORIZED_ACCESS') {
                console.log("Error Message: " + response.message);
                flutterWaveAuth(service);

            }
        });
    });

    req.write(postData);
    req.end();


    var newBilling = new Billing(requ.body.updatedBilling);
    Customers.update({ _id: requ.session.userid},
        {$set:{billing:[newBilling.toObject()]}})
        .exec(function (err, results) {
            if(err || results < 1){
                resp.json(404, {msg: "Failed to update Billing."});
            }else {
                resp.json({msg: "Customer Billing Updated."});
            }
        });

};
exports.updateCart = function (req, res) {
    Customers.update({ _id: req.session.userid },
        {$set:{cart: req.body.updatedCart}})
        .exec(function (err, results) {
            if(err || results < 1){
                res.json(404, {msg: "Failed to update Cart."});
            }else {
                res.json({msg: "Customer Cart Updated."});
            }
        });
};
