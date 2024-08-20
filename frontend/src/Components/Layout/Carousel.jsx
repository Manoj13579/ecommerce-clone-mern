import image1 from '../../assets/angela.jpg';
import image2 from '../../assets/sally-molly.jpg';
import image3 from '../../assets/sarah.jpg';
import './Layout.css';



const Carousel = () => {
  
  
  return (
    <section className= "main-carousel-container">
    <div className='carousel-container'>
    <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel">
  <div className="carousel-indicators">
    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
    <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
  </div>
  <div className="carousel-inner">
    <div className="carousel-item active" data-bs-interval="2000">
      <img src={image1} className="d-block w-100" alt="..."/>
      <div className="carousel-caption">
        <h2 className='text-color'>Best Price Guaranteed</h2>
      </div>
    </div>
    <div className="carousel-item" data-bs-interval="2000">
      <img src={image2} className="d-block w-100" alt="..."/>
      <div className="carousel-caption">
        <h2 className='text-color'>Every Day Low Price</h2>
      </div>
    </div>
    <div className="carousel-item" data-bs-interval="2000">
      <img src={image3} className="d-block w-100" alt="..."/>
      <div className="carousel-caption">
        <h2 className='text-color'>Free Delivery</h2>
      </div>
    </div>
  </div>
  <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
    <span className="visually-hidden">Previous</span>
  </button>
  <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
    <span className="carousel-control-next-icon" aria-hidden="true"></span>
    <span className="visually-hidden">Next</span>
  </button>
</div>
</div>
</section>
  )
}

export default Carousel;