import CryptoJS from 'crypto-js';

const esewaGetSecret = async (req, res) => {
    const { total_amount, transaction_uuid, product_code} = req.body;
    
    
    if( !total_amount || !transaction_uuid || !product_code) {
        res.status(400).json({ sucess: false, message: "invalid parameters for secret key"})
    }
    try {
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        const secretKey = process.env.ESEWA_SECRET_KEY;
        
        // Generate the HMAC SHA256 hash
        const hash = CryptoJS.HmacSHA256(message, secretKey);
        const signature = CryptoJS.enc.Base64.stringify(hash);
        
       return res.status(200).json({ success: true, message: 'sucessfully generated secret key', signature})

    } catch (error) {
       return res.status(500).json({ sucess: false, message: 'couldnot generate secret key', error})
    }
};



const verifyEsewaResponse = async (req, res) => {
    try {
       
        const base64Response = req.body.encodedResponse;

        // Decoding the Base64 response to get the JSON object
        const decodedResponse = atob(base64Response);
        const decodedData = JSON.parse(decodedResponse);
        
        if(decodedData.status === "COMPLETE"){

            
            // Generate the signature string from the signed_field_names order
            
            const message = decodedData.signed_field_names.split(',').map((field) => `${field}=${decodedData[field] || ""}`).join(',');
    
    
            // Compute the signature using HMAC SHA256 and your secret key
            const secretKey = process.env.ESEWA_SECRET_KEY;
            const computedHash = CryptoJS.HmacSHA256(message, secretKey);
            const computedSignature = CryptoJS.enc.Base64.stringify(computedHash);
    
    
            // Compare the received signature with the computed signature
            if (computedSignature === decodedData.signature) {
                console.log('Transaction verified successfully');
                
                // Signature matches, process the successful payment
                return res.status(200).json({ success: true, message: 'Transaction verified successfully', decodedData, });
            } else {
                console.log('Invalid signature');
                
                // Signature does not match, possible tampering
                return res.status(400).json({ success: false, message: 'Invalid signature' });
            }
        }
        else {
            return res.status(400).json({ success: false, message: 'status not complete' })
        }

    } catch (error) {
        console.error('Error verifying eSewa response:', error);
        return res.status(500).json({ success: false, message: 'Server error during signature verification', error });
    }
};

export { esewaGetSecret, verifyEsewaResponse };