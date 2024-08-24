import Review from "../models/review.js";


const review = async(req, res) => {

    try {
        const data = await Review.create(req.body.allData)
        res.status(200).json({ success: true, message: 'review successfully created', data})
    } 
    catch (error) {
       res.status(500).json({ success: false, message: 'error in creating review', error}) 
    };
};

const getReviewByProductId = async(req, res) => {
  
    const productId = req.query.productId;  
    
    
    if(!productId){
      return res.status(400).json({ success: false, message: 'Product not found'})
    }
    try {
      /* .find returns all items of given parameter here productid whereas findOne returns only one item of given parameter */
      const data = await Review.find({productId: productId});
      
      
      return res.status(200).json({ success: true, message: "successfully fetched user review", data})
    }
     catch (error) {
      return res.status(500).json({ success: false, message: 'error fetching user review'})
    }
  };

export {review, getReviewByProductId};