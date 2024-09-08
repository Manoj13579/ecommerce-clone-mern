import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Layout.css';



const ImageCategory = () => {

    const navigate = useNavigate();
    
  return (
    <section >
      <h5 style={{marginLeft: '1rem'}}>Category</h5>
            <div className='image-category-container'>
              <div className='image-category-container-image'>
              <img src={`/women's-clothing.jpg`} onClick={() => {navigate(`categorypage/women's clothing`);
                // scroll to up in CategoryPage.jsx
                window.scrollTo(0, 0);
              }}/>
              <span>women's clothing</span>
              </div>
              <div className='image-category-container-image'>
              <img src={`/men's-clothing.jpg`} onClick={() =>{ navigate(`categorypage/men's clothing`);
                // scroll to up in CategoryPage.jsx
                window.scrollTo(0, 0);
              }}/>
              <span>men's clothing</span>
             
              </div>
              <div className='image-category-container-image'>
              <img src={`/jewellery.jpg`} onClick={() =>{navigate(`categorypage/jewellery`);
                // scroll to up in CategoryPage.jsx
                window.scrollTo(0, 0);
              }}/>
              <span>jewellery</span>
             
              </div>
              <div className='image-category-container-image'>
              <img src={`/bags.jpg`} onClick={() => {navigate(`categorypage/bags`);
                // scroll to up in CategoryPage.jsx
                window.scrollTo(0, 0);
              }}/>
              <span>bags</span>
              </div>
              <div className='image-category-container-image'>
              <img src={`/electronics.jpg`} onClick={() => {navigate(`categorypage/electronics`);
                // scroll to up in CategoryPage.jsx
                window.scrollTo(0, 0);
              }}/>
              <span>electronics</span>
              </div>
            </div>
</section>
  )
}

export default ImageCategory;