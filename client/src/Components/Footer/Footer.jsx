import './Footer.css';
import { FaFacebook, FaTwitter, FaYoutube, FaGlobe } from "react-icons/fa";


const Footer = () => {
  return (
    <footer className='footer-container'>
        <div className='footer-main'>
        <div className='footer-first'>
        <h1 className='footer-title'>Customer Care</h1>
        <ul>
        <li className='footer-li'><a href='#'>Help Center</a></li>
        <li className='footer-li'><a href='#'>How To Buy</a></li>
        <li className='footer-li'><a href='#'>Returns & Refunds</a></li>
        <li className='footer-li'><a href='#'>Contact Us</a></li>
        <li className='footer-li'><a href='#'>Payment Methods</a></li>
        <li className='footer-li'><a href='#'><img src={`/esewa_logo.png`} style={{maxHeight: '3vh', backgroundColor: "#454545cd"}}/></a></li>
        <li className='footer-li'><a href='#'><p style={{color: "green"}}>cash on delivery</p></a></li>
        <li className='footer-li'><a href='#'><img src={`/paypal_logo.png`} style={{maxHeight: '4vh', maxWidth: "30%", backgroundColor: "#454545cd",}}/></a></li>
        </ul>
        <h1 className='footer-title'>Earn With Daraz</h1>
        <ul>
        <li className='footer-li'><a href='#'>Daraz University</a></li>
        <li className='footer-li'><a href='#'>Sell on Daraz</a></li>
        <li className='footer-li'><a href='#'>Code of Conduct</a></li>
        </ul>
        </div>
        <div className='footer-first'>
        <h1 className='footer-title footer-title-first'>Daraz</h1>
        <ul>
        <li className='footer-li'><a href='#'>About Daraz</a></li>
        <li className='footer-li'><a href='#'>Careers</a></li>
        <li className='footer-li'><a href='#'>Daraz Blog</a></li>
        <li className='footer-li'><a href='#'>Terms & Conditions</a></li>
        <li className='footer-li'><a href='#'>Privacy Policy</a></li>
        <li className='footer-li'><a href='#'>Digital Payments</a></li>
        <li className='footer-li'><a href='#'>Daraz Customer University</a></li>
        <li className='footer-li'><a href='#'>Meet the Winners</a></li>
        <li className='footer-li'><a href='#'>Review & Win</a></li>
        <li className='footer-li'><a href='#'>Contact Us</a></li>
        </ul>
        </div>
        <div className='footer-first'>
        <h1 className='footer-title'>Daraz International</h1>
        <ul>
        <li className='footer-li'><a href='#'>Nepal</a></li>
        <li className='footer-li'><a href='#'>Sri Lanka</a></li>
        <li className='footer-li'><a href='#'>Myanmar</a></li>
        <li className='footer-li'><a href='#'>Bangladesh</a></li>
        <li className='footer-li'><a href='#'>Pakistan</a></li>
        </ul>
        </div>
        <div className='footer-first'>
        <h1 className='footer-title'>Follow Us</h1>
        <div className="follow-us-container">
        <a href='#'>
            <FaFacebook className="h3"/>
        </a>
        <a href='#'>
        <FaTwitter className="h3"/>
        </a>
        <a href='#'>
            <FaYoutube className="h3"/>
        </a>
        <a href='#'>
            <FaGlobe className="h3"/>
        </a>
        </div>
        </div>
        </div>
    </footer>
  )
}

export default Footer;