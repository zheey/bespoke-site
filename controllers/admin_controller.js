var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var async = require('async');
var mongoose = require('mongoose'),
Products = mongoose.model('Product'),
CustomOrders = mongoose.model('CustomOrder'),
CartOrders = mongoose.model('Order'),
Admin = mongoose.model('Admin'),
Customer = mongoose.model('Customer'),
Review = mongoose.model('Review');

function hashPW(pwd) {
    return crypto.createHash('sha256').update(pwd).
        digest('base64').toString();
}

exports.addAdmin = function (req, res) {
  var admin = new Admin({username:req.body.username, email: req.body.email,
     password: hashPW(req.body.password)
  });
  admin.save(function (err) {
    if(err){
      res.redirect('/newadmin', function () {
          res.send(err);
      });
    }else {
      req.session.adminemail = admin.email;
      req.session.adminname = admin.username;
      req.session.adminid = admin._id;
      req.session.msg1 = 'Logged in as, ' + admin.username;
      res.redirect('/admin');
    }
  });
};

exports.login = function (req, res) {
  Admin.findOne({username:req.body.username}).exec(function (err, admin) {
    if(!admin){
      err = 'Admin does not exist';
    }else if (admin.password === hashPW(req.body.password.toString())){
          req.session.regenerate(function () {
              req.session.adminemail = admin.email;
              req.session.adminname = admin.username;
              req.session.adminid = admin._id;
              req.session.msg1 = 'Logged in as, ' + admin.username;
              res.redirect('/admin');
          });
    }else {
      err = 'Email or Password incorrect. ';
    }
      if (err){
          req.session.regenerate(function () {
              req.session.msg1 = err;
              res.redirect('/admin/login');
          });
      }

  });
};

exports.getProducts = function (req, res) {
  Products.find().exec(function (err, products) {
    if(!products){
      res.json(404, {msg:'Unable to get products.'})
    }else {
      res.json(products);
    }
  });
};
exports.getAdmin = function (req, res) {
    Admin.findOne({_id:req.session.adminid}).exec(function (err, admin) {
        if(!admin){
            res.json(404, {err:'Error fetching out admin\'s records. '});
        }else{
            res.json(admin);
        }
    });
};
exports.getReviews = function (req, res) {
    Review.find().exec(function (err, reviews) {
        if(!reviews){
            res.json(404, {msg:'Unable to get Reviews.'})
        }else {
            res.json(reviews);
        }
    });
};

exports.getProduct = function (req, res) {
  Products.findOne({_id:req.query.productId})
  .exec(function (err, product) {
    if(!product){
      res.json(404, {msg:'Sorry, product not found.'});
    } else {
      res.json(product);
    }
  });
};

exports.categoryProducts = function (req, res) {
  Category.find({_id:req.query.categoryId})
  .exec(function (err, categoryProducts) {
    if(!categoryProducts){
      res.json(404, {msg:'Category products not found.'});
    } else {
      res.json(categoryProducts);
    }
  });
};

exports.addProduct = function (req, res) {
    // upload product image to file
    console.log("req", req.files);
    var filesArray = req.files;
    async.each(filesArray, function(file, eachcallback){
        if(file){
            var product = new Products({name:req.body.name, imagefile:file.filename,
                description:req.body.description, price:req.body.price,category:req.body.category});
            product.save(function (err) {
                if(err){
                    req.session.msg1 = "Failed to save Product."+err;
                    res.render('addproduct',{msg:req.session.msg1});
                } else {
                    req.session.msg1 = "Picture successfully uploaded";
                    res.render('addproduct',{msg:req.session.msg1});
                }
            });
        }

    }, function (err) {
        if(err){
            console.log("error occured in each", err);
        } else {
            res.json(200, "Picture successfully uploaded");
        }
    });

};

exports.deleteProduct = function (req, res) {
  Products.findOne({_id:req.query.productId}).exec(function (err, product) {
    if(product){
      product.remove(function (err) {
        if(err){
          res.session.message = 'error deleting product.';
        }
      });
    }else {
      res.json(404,{msg:'Product not found.'});
    }
  });
};

exports.getCustomers = function (req, res) {
  Customers.find().exec(function (err, customers) {
    if(!customers){
      res.json(404, {msg: 'Error fetching customers data.'});
    } else {
      res.json(customers);
    }
  });
};

exports.getCartOrders = function (req, res) {
  CartOrders.find().exec(function (err, cartorders) {
    if(!cartorders){
      res.json(404, {msg: 'Error fetching cart orders.'});
    } else {
      res.json(cartorders);
    }
  });
};

exports.getCustomOrders = function (req, res) {
  CartOrders.find().exec(function (err, customorders) {
    if(!customorders){
      res.json(404, {msg: 'Error fetching custom orders.'});
    } else {
      res.json(customorders);
    }
  });
};

exports.updateCartOrder = function (req, res) {
  CartOrders.find({_id:req.query.orderid}).exec(function (err, order) {
    order.set('status', req.body.status);
    order.set('status', req.body.reply);
    order.save(function (err) {
      if(err){
        req.session.error = 'Unable to update order.';
      }else{
        req.session.msg = 'Order has been updated.';
        res.redirect('/adminorders');
      }
    });
  });
};

exports.updateCustomOrder = function (req, res) {
  CustomOrders.find({_id:req.query.orderid}).exec(function (err, order) {
    order.set('status', req.body.status);
    order.set('status', req.body.reply);
    order.save(function (err) {
      if(err){
        req.session.error = 'Unable to update order.';
      }else{
        req.session.msg = 'Order has been updated.';
        res.redirect('/customorders');
      }
    });
  });
};
