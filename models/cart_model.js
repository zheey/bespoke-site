/**
 * Created by Zainab on 30.7.17.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
var AddressSchema = new Schema({
  address: String,
  city: String,
  state: String
}, { _id: false});
mongoose.model('Address', AddressSchema);

var ReviewSchema = new Schema({
    userid: String,
    firstname: String,
    lastname: String,
    review: String,
    timestamp: {type: Date, default: Date.now }
});
mongoose.model('Review', ReviewSchema);

var ShippingAddressSchema = new Schema({
  firstname: String,
  lastname: String,
  address: String,
  city: String,
  state: String
}, { _id: false});
mongoose.model('ShippingAddress', ShippingAddressSchema);

var BillingSchema = new Schema({
  cardtype: String,
  firstname: String,
  lastname: String,
  cardnumber: String,
  expiremonth: String,
  expireyear: String,
    address: String,
    city: String,
    state: String,
    email: String,
    phone: Number}, { _id: false});
mongoose.model('Billing', BillingSchema);

var ProductSchema = new Schema({
  name: String,
  imagefile: String,
  description: String,
  price: Number,
  category: String,
  timestamp: {type: Date, default: Date.now }
});
mongoose.model('Product', ProductSchema);

var ProductQuantitySchema = new Schema({
  quantity: Number,
  product: [ProductSchema],
  isadded: Boolean
}, { _id: false });
mongoose.model('ProductQuantity', ProductQuantitySchema);

var CategorySchema = new Schema({
  name: String,
  product: [ProductSchema]
});
mongoose.model('Category', CategorySchema);

var OrderSchema = new Schema({
  userid: String,
  cartitems: [ProductQuantitySchema],
  cartshipping: [ShippingAddressSchema],
  cartbilling: [BillingSchema],
  status: {type: String, default: "Pending"},
  deliverydate: Date,
  deliverytime: Date,
  responsetype: {type:String, default: "Call"},
  timestamp: {type: Date, default: Date.now },
  ordertype: {type:String, default: "Cart Order"},
  reply: {type: String, default:"Thank you for the order. You will receive a response shortly."}
});
mongoose.model('Order', OrderSchema);

var CustomOrderSchema = new Schema({
  userid: String,
  productname: String,
  size: String,
  productimage: String,
    price: Number,
  description: String,
  items: [ProductQuantitySchema],
  customshipping: [ShippingAddressSchema],
  custombilling: [BillingSchema],
  status: {type: String, default: "Pending"},
  deliverydate: Date,
  deliverytime: Date,
  responsetype: {type:String, default: "Call"},
  timestamp: {type: Date, default: Date.now },
  ordertype: {type:String, default: "Cart Order"},
  reply: {type: String, default:"Thank you for the order. You will receive a response shortly."}
});
mongoose.model('CustomOrder', CustomOrderSchema);

var CustomerSchema = new Schema({
  firstname: String,
  lastname: String,
  email: {type: String, unique: true, required: true },
  phonenumber: Number,
  password: String,
  address: [AddressSchema],
  shipping: [ShippingAddressSchema],
  billing: [BillingSchema],
  cart: [ProductQuantitySchema],
  cartorders: [OrderSchema],
  customorders: [CustomOrderSchema]
});
mongoose.model('Customer', CustomerSchema);

var AdminSchema = new Schema({
  username: {type: String, unique: true},
  email: String,
  password: String
});
mongoose.model('Admin', AdminSchema);
