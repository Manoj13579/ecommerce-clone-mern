import React from 'react';
import ReactDOM from 'react-dom';
import './Loader.css';

const Loader = () => {


return ReactDOM.createPortal (     
      <div className="loader-container">
      <div className="loader"></div>
    </div>,
    document.getElementById('loader') 
     );
};

export default Loader;