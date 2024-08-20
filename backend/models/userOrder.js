import mongoose from 'mongoose';

// Define the cartOrderSchema
/* defining cartOrderSchema for cartOrder will have it's own _id in database. needed to delete only one product in
this array even it has two products. here id is of product which we pass for Order in frontend. it helps in recognizing particular product*/
const cartOrderSchema = new mongoose.Schema({
  /*Purpose of ref:
The id field in your cartOrderSchema is defined with the type mongoose.Schema.Types.ObjectId, which means it will store ObjectId values (which are used as unique identifiers for documents in MongoDB).
By setting ref: 'Product', you’re specifying that the id field will hold the ObjectId of a document in the Product collection. This creates a link between the cartOrderSchema and the Product model.
Benefits:
Data Normalization: Instead of duplicating product details in the cartOrderSchema, you store only the reference (ObjectId) to the product. This helps in reducing data redundancy and maintaining a single source of truth for product information. */
  productid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  orderedQuantity: {
    type: Number,
    required: true
  }
});

// Define the userOrderSchema
const userOrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  payment: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'delivered'],
    default: 'processing'
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  /* frontend is passing cartOrder as object inside array so this is handling it correctly */
  cartOrder: [cartOrderSchema]
}, {
  timestamps: true
});

// Define and export the UserOrder model
const UserOrder = mongoose.model('UserOrder', userOrderSchema);
export default UserOrder;