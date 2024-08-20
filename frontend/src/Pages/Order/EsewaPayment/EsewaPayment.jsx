import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const EsewaPaymentOrder = () => {

  const cartOrder = JSON.parse(localStorage.getItem("cart"));
  const totalPrice = cartOrder?.reduce((total, currentItem) => {
    return total + currentItem.new_price * currentItem.cartquantity;
  }, 0);
  const transactionUuid = uuidv4();
  const [formData, setFormData] = useState({
    amount: totalPrice,
    tax_amount: '0',
    total_amount: totalPrice,
    transaction_uuid: transactionUuid,
    product_code: 'EPAYTEST',
    product_service_charge: '0',
    product_delivery_charge: '0',
    success_url: 'http://localhost:5173/verify-esewa-response',
    failure_url: 'http://localhost:5173/',
    signature: 'total_amount,transaction_uuid,product_code'
  });

  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/esewa-getsecret`, {
          total_amount: formData.total_amount,
          transaction_uuid: formData.transaction_uuid,
          product_code: formData.product_code
        }, { withCredentials: true });


        if (response.data.success) {
          setFormData(prevState => ({
            ...prevState,
            signature: response.data.signature
          }));
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchSignature();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit the form
      e.target.submit();
    };
  

   
  return (
    <>
    <h3 style={{marginLeft: '3rem', marginTop: '1rem', color: '#f85606'}}>click pay with esewa to continue</h3>
    <form action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST" onSubmit={handleSubmit}>
      <input type="hidden" id="amount" name="amount" value={formData.amount} />
      <input type="hidden" id="tax_amount" name="tax_amount" value={formData.tax_amount} />
      <input type="hidden" id="total_amount" name="total_amount" value={formData.total_amount} />
      <input type="hidden" id="transaction_uuid" name="transaction_uuid" value={formData.transaction_uuid} />
      <input type="hidden" id="product_code" name="product_code" value={formData.product_code} />
      <input type="hidden" id="product_service_charge" name="product_service_charge" value={formData.product_service_charge} />
      <input type="hidden" id="product_delivery_charge" name="product_delivery_charge" value={formData.product_delivery_charge} />
      <input type="hidden" id="success_url" name="success_url" value={formData.success_url} />
      <input type="hidden" id="failure_url" name="failure_url" value={formData.failure_url} />
      <input type="hidden" id="signed_field_names" name="signed_field_names" value="total_amount,transaction_uuid,product_code" />
      <input type="hidden" id="signature" name="signature" value={formData.signature} />
      <button type="submit" style={{ width: '30%', marginTop: '3rem', marginLeft: '4rem', border: 'none', backgroundColor: "#454545cd", height: '9vh', color: "white", borderRadius: '0.5rem'}}>Pay With <img src={`/esewa_logo.png`} style={{height: '3vh'}}/></button>
    </form>
    </>
  );
};

export default EsewaPaymentOrder;