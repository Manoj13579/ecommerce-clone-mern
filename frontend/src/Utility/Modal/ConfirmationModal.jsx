import {useEffect} from 'react';
import './Modal.css';
import ReactDOM from 'react-dom';
// creating this is good coz we don't need to write same css for delete modal everywhere we use it
/* It accepts four props (isOpen, message, onConfirm, onCancel) via object destructuring.
These props will be passed down from the parent component that renders ConfirmationModal */
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  // to hide scroll when modal is open
  useEffect(() => {
  // Set body overflow-y to hidden of rendering component that uses this modal when modal is open
    if (isOpen) {
  // we can directly change style like this by javascript manipulating DOM
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = 'scroll';
    }

  }, [isOpen]);


  /* This line checks if the isOpen prop is false or undefined. 
  If isOpen is false, the function returns null, effectively rendering nothing (the modal is hidden). */
  if (!isOpen) return null;
/*ReactDOM.createPortal allows you to render a component's output into a different part of the DOM. It takes two arguments:
The JSX you want to render.
The DOM node where you want to render the JSX. 
we can render jsx in different DOM node which is main use of ReactDOM.createPortal
*/
  return ReactDOM.createPortal (
    <div className="modal">
      <div className="modal-content">
        <p>{message}</p>
        {/* user clicks yes proceeds with onConfirm if not cancels */}
        <button onClick={onConfirm}>Yes</button>
        <button onClick={onCancel}>No</button>
      </div>
    </div>,
    document.getElementById("confirmationmodal")
  );
};

export default ConfirmationModal;