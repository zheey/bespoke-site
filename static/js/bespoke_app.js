var app = angular.module('bespokeApp',['infinite-scroll']);
app.controller('bespokeController', ['$scope','$http','$window',
function ($scope, $http, $window) {
    $scope.isLoggedIn = false;
    $scope.isAdded = false;
    $scope.Menus = ['Wedding Cakes','Birthday Cakes', 'Custom Cakes', 'Traditional cakes', 'CupCakes', 'Snacks'];
    $scope.months = [1,2,3,4,5,6,7,8,9,10,11,12];
    $scope.years = [2014,2015,2016,2017,2018,2019,2020];
    $scope.content = '/static/items.html';
    $http.get('/shopping/get')
        .success(function (data, status, headers,config) {
            $scope.ProductData = data;
            $scope.product = data[0];
            $scope.Products = $scope.ProductData.slice(0, 6);
            $scope.getMoreData = function () {
                $scope.Products = $scope.ProductData.slice(0, $scope.Products.length + 6);
            }
        })
        .error(function (data, status, headers, config) {
            $scope.Products = [];
        });
    $scope.setCategory = function (categoryname) {
        $http.get('/shopping/category', {params:{categoryname: categoryname}})
            .success(function (data, status, headers, config) {
                $scope.Products = data;
                $scope.product = data[0];
                $scope.content = '/static/category.html';
            })
            .error(function (data, status, headers, config) {
                $scope.Products = {};
            });
    };
    $scope.reloadPage = function () {
        window.location.reload();
    };

    $http.get('/reviews')
        .success(function (data, status, headers,config) {
            $scope.reviews = data;
            $scope.review = data[0];
        })
        .error(function (data, status, headers, config) {
            $scope.reviews = [];
        });

    $http.get('/customer/profile').
    success(function (data, status, headers, config) {
        $scope.user = data;
        $scope.isLoggedIn = true;
        if($scope.user===''){
            $scope.isLoggedIn = false;
        }
        $scope.error = "";
    }).
    error(function (data, status, header, config) {
        $scope.user = {};
        $scope.error = data;
    });
    $scope.addCart = function (productId) {
        var found= false;
        for(var i=0; i<$scope.user.cart.length; i++){
            var item = $scope.user.cart[i];
            if(item.product[0]._id === productId){
                item.quantity += 1;
                found = true;
            }
        }
        if(!found){
            $scope.user.cart.push({quantity: 1,
                product: [this.product], isadded: true});
        }
        $http.post('/customer/update/cart',
            {updatedCart: $scope.user.cart })
            .success(function (data, status, headers, config) {
                //$scope.content = '/static/cart.html';
            })
            .error(function (data, status, headers, config) {
                $window.alert(data);
            });
    };
    $scope.deleteFromCart = function (productId) {
        for(var i=0; i<$scope.user.cart.length; i++){
            var item = $scope.user.cart[i];
            if(item.product[0]._id === productId){
                $scope.user.cart.splice(i, 1);
                break;
            }
        }
        $http.post('/customer/update/cart',
            { updatedCart: $scope.user.cart })
            .success(function (data, status, headers, config) {
                //$scope.content = '/static/cart.html';
            })
            .error(function (data, status, headers, config) {
                $window.alert(data);
            });
    };
    $scope.itemTotal = function (price,quantity) {
        var total = 0;
        total = price * quantity;
        return total;
    };
    $scope.cartTotal = function () {
        var carttotal = 0;
        for(var i=0; i<$scope.user.cart.length; i++){
            var item = $scope.user.cart[i];
            carttotal += item.quantity * item.product[0].price;
        }
        return carttotal;
    };
    $scope.checkout = function () {
        $http.post('/customer/update/cart',
            {updatedCart: $scope.user.cart})
            .success(function (data, status, headers, config) {
            })
            .error(function (data, status, headers, config) {
                $window.alert(data);
            });
    };
    $scope.setShipping = function (radioShipping) {
        if (radioShipping === false) {
            $http.post('/customer/update/shipping',
                {updatedShipping: $scope.user.shipping[0]})
                .success(function (data, status, headers, config) {
                })
                .error(function (data, status, headers, config) {
                    $window.alert(data);
                });
        }else {
            $scope.user.shipping[0].firstname = $scope.user.firstname;
            $scope.user.shipping[0].lastname = $scope.user.lastname;
            $scope.user.shipping[0].address = $scope.user.address[0].address;
            $scope.user.shipping[0].city = $scope.user.address[0].city;
            $scope.user.shipping[0].state = $scope.user.address[0].state;
            $http.post('/customer/update/shipping',
                {updatedShipping: $scope.user.shipping[0]})
                .success(function (data, status, headers, config) {
                })
                .error(function (data, status, headers, config) {
                    $window.alert(data);
                });
        }
    };
    $scope.verifyBilling = function (ccv) {
        $scope.ccv = ccv;
        $http.post('/customer/update/billing',
            {updatedBilling: $scope.user.billing[0],ccv:ccv, totalPay:$scope.cartTotal()})
            .success(function (data, status, headers, config) {
            })
            .error(function (data, status, headers, config) {
                $window.alert(data);
            });
    };

    $http.get('/admin/profile').
    success(function (data, status, headers, config) {
        $scope.admin = data;
        $scope.error = "";
    }).
    error(function (data, status, header, config) {
        $scope.admin = {};
        $scope.error = data;
    });

    $scope.setContent = function (filename) {
        $scope.content = '/static/' + filename;
    };


}]);