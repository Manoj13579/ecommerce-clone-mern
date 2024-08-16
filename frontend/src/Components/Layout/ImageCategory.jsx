import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Layout.css';



const ImageCategory = () => {

    const navigate = useNavigate();
    
  return (
    <section >
      <h5>Category</h5>
            <div className='image-category-container'>
              <div className='image-category-container-image'>
              <img src={`/women's-clothing.jpg`} onClick={() => navigate(`sidemenupage/women's clothing`)}/>
              <span>women's clothing</span>
              </div>
              <div className='image-category-container-image'>
              <img src={`/men's-clothing.jpg`} onClick={() => navigate(`sidemenupage/men's clothing`)}/>
              <span>men's clothing</span>
             
              </div>
              <div className='image-category-container-image'>
              <img src={`/jewellery.jpg`} onClick={() => navigate(`sidemenupage/jewellery`)}/>
              <span>jewellery</span>
             
              </div>
              <div className='image-category-container-image'>
              <img src={`/bags.jpg`} onClick={() => navigate(`sidemenupage/bags`)}/>
              <span>bags</span>
              </div>
              <div className='image-category-container-image'>
              <img src={`/electronics.jpg`} onClick={() => navigate(`sidemenupage/electronics`)}/>
              <span>electronics</span>
              </div>
            </div>
</section>
  )
}

export default ImageCategory;