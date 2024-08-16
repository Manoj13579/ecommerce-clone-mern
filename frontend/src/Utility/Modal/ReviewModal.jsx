import React, {useEffect} from 'react';
import './Modal.css';

const ReviewModal = ({ isOpen, onClose, handleReviewOnSubmit }) => {


  useEffect(() => {
      if (isOpen) {
        document.body.style.overflowY = 'hidden';
      } else {
        document.body.style.overflowY = 'scroll';
      }
  
    }, [isOpen]);  

  if (!isOpen) return null;
/*It prevents the default form submission behavior, extracts form data (review and rating) using FormData, calls an handleReviewOnSubmit function to process the form data, and finally calls onClose to close the modal, providing a seamless user experience for submitting reviews */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    /* here FormData  is a built-in JavaScript object that allows easy manipulation of form data.
    it refers to <form> in jsx. e.target refers to the form element itself, which was the target of the form submission event (onSubmit).*/
    const formData = new FormData(e.target);
    /*Retrieves the value of the input field named 'review' from the formData object. In your JSX, this corresponds to the <textarea id="review" name="review" required></textarea> element. */
    const review = formData.get('review');
    const rating = Number(formData.get('rating')); // Convert to number
    /*Typically, this prop function is responsible for handling the submission of the form data to an external API or performing any necessary actions with the form data (review and rating).passed as object equivalent to { review: review, rating: rating }.when onSubmit in jsx is clicked we have to pass data to another place coz we are using this component as a framework we need to give any component that uses this power to submit formdata in desired place.so
    handleReviewOnSubmit is initialized inside handleReviewSubmit.when we click submit in modal we click of this component
    and it takes review, rating from handleReviewOnSubmit that is passed as prop from component using this modal.*/
    handleReviewOnSubmit({ review, rating });
    /*Calls the onClose prop function passed to the ReviewModal component. This function is responsible for closing or hiding the modal after the form has been successfully submitted.*/
    onClose();
  };

  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <button className="review-close-button" onClick={onClose}>X</button>
        <h2>Write a Review</h2>
        <form onSubmit={handleFormSubmit}>
          <div>
            <label htmlFor="review">Review:</label>
            <textarea id="review" name="review" required></textarea>
          </div>
          <div>
            <label htmlFor="rating">Rating:</label>
            <select id="rating" name="rating" required>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;