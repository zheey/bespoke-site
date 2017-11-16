var express = require('express');
var multer = require('multer');
var multerupload = multer({dest:'images/'});
module.exports = function (app) {
  var products = require('./controllers/products_controller');
  var customers = require('./controllers/customers_controller');
  var admin = require('./controllers/admin_controller');
  var orders = require('./controllers/orders_controller');
  app.use('/static', express.static( './static')).
      use('/images', express.static('images')).
      use('/lib', express.static('lib')
  );
  app.get('/', function (req, res) {
      if(req.session.userid){
          res.render('shop',{msg:req.session.msg});
      }else {
          res.render('shop');
      }
  });
  app.get('/shop', function (req, res) {
        if(req.session.userid) {
            res.render('shopping', {msg:req.session.msg});
        } else {
            res.render('shopping');
        }
    });
    app.get('/wedding', function (req, res) {
        if(req.session.userid) {
            res.render('wedding', {msg:req.session.msg});
        } else {
            res.render('wedding');
        }
    });
    app.get('/careers', function (req, res) {
        if(req.session.userid) {
            res.render('careers', {msg:req.session.msg});
        } else {
            res.render('careers');
        }
    });
    app.get('/blog', function (req, res) {
        if(req.session.userid) {
            res.render('blog', {msg:req.session.msg});
        } else {
            res.render('blog');
        }
    });
    app.get('/signup', function (req, res) {
        if (req.session.userid){
            res.redirect('/');
        }else {
            res.render('signup', {msg: req.session.msg});
        }
    });
    app.get('/login', function (req, res) {
        if(req.session.userid){
            res.redirect('/shopping');
        }else {
            res.render('login',{msg:req.session.msg});
        }
    });
    app.get('/shopping', function (req, res) {
        if(req.session.userid){
            res.render('shopping',{msg:req.session.msg});
        }else {
            res.render('shopping');
        }
    });
    app.get('/customer', function (req, res) {
        if(req.session.userid){
            res.render('profile');
        }else {
            res.redirect('/login');
        }
    });
    app.get('/shopping/checkout', function (req, res) {
        if(req.session.userid){
            res.render('shipping');
        }else {
            res.redirect('/login');
        }
    });
    app.get('/shopping/billing', function (req, res) {
        if(req.session.userid){
            res.render('billing', {errmsg:req.session.msg});
        }else {
            res.redirect('/login');
        }
    });
    app.get('/shopping/cart', function (req, res) {
        if(req.session.userid){
            res.render('cart');
        }else {
            res.redirect('/login');
        }
    });
    app.get('/customer/orders', function (req, res) {
        if(req.session.userid){
            res.render('orders', {msg:req.session.msg});
        }else {
            res.redirect('/login');
        }
    });
    app.get('/logout', function (req, res) {
        req.session.destroy(function () {
            res.redirect('/');
        });
    });
    app.get('/admin', function (req, res) {
        if(req.session.adminid) {
            res.render('admin', {msg:req.session.msg1});
        } else {
            res.redirect('/admin/login');
        }
    });
    app.get('/admin/login', function (req, res) {
        if(req.session.adminid){
            res.redirect('/admin');
        }else {
            res.render('adminlogin',{msg:req.session.msg1});
        }
    });

  app.get('/admin/orders', function (req, res) {
    if(req.session.adminid) {
      res.render('adminorders',{msg:req.session.msg1});
    } else {
      res.redirect('/adminlogin');
    }
  });
  app.get('/admin/customorders', function (req, res) {
    if(req.session.adminid) {
      res.render('customorders',{msg:req.session.msg1});
    } else {
      res.redirect('/admin/login');
    }
  });
  app.get('/admin/newadmin', function (req, res) {
      //if (req.session.adminid){
          res.render('newadmin', {msg:req.session.msg1});
      //}else {
        //  res.redirect('/admin/login');
     // }
  });
    app.get('/admin/products/add', function (req, res) {
        if (req.session.adminid){
            res.render('addproduct', {msg:req.session.msg1});
        } else {
            res.redirect('/admin/login');
        }
    });
  app.get('/admin/logout', function (req, res) {
      req.session.destroy(function () {
          res.redirect('/admin/login');
      });
  });

  app.get('/shopping/get', products.getProducts);
  app.get('/shopping/category', products.categoryProducts);
  app.get('/customer/orders/get/cartorder', orders.getCartOrders);
  app.get('/customer/orders/get/customorder', orders.getCustomOrders);
  app.post('/customer/orders/add/cartorder', orders.addCartOrder);
  app.post('/customer/orders/add/customorder', multerupload.any(), orders.addCustomOrder);
  app.post('/customer/review', customers.addReview);
  app.post('/signup', customers.signup);
  app.post('/login', customers.login);
  app.get('/customer/profile', customers.getCustomer);
  app.post('/customer/update', customers.updateCustomer);
  app.post('/customer/delete', customers.deleteCustomer);
  app.post('/customer/update/shipping', customers.updateShipping);
  app.post('/customer/update/billing', customers.updateBilling);
  app.post('/customer/update/cart', customers.updateCart);
  app.get('/admin/products', admin.getProducts);
  app.post('/admin/products/add', multerupload.any(), admin.addProduct);
  app.post('/admin/products/delete', admin.deleteProduct);
  app.get('/admin/customer', admin.getCustomers);
  app.get('/admin/orders/cartorder', admin.getCartOrders);
  app.get('/admin/orders/customorder', admin.getCustomOrders);
  app.get('/admin/update/cartorder', admin.updateCartOrder);
  app.get('/admin/update/customorder', admin.updateCustomOrder);
  app.get('/admin/category', admin.categoryProducts);
  app.get('/reviews', admin.getReviews);
  app.post('/admin/login', admin.login);
  app.post('/admin/newadmin', admin.addAdmin);
    app.get('/admin/profile', admin.getAdmin);

};
