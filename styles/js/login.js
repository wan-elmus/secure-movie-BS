
// login.js

// Get references to form elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Function to display error message
function displayErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.body.insertBefore(errorDiv, loginForm);
}

// Function to handle form submission with AJAX
function handleFormSubmission(event) {
  event.preventDefault(); // Prevent default form submission

  const username = usernameInput.value;
  const password = passwordInput.value;

  // Perform form validation (e.g., check for non-empty fields)
  if (!username || !password) {
    displayErrorMessage('Please fill in all fields.');
    return;
  }

  // Perform AJAX login request
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/login', true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        // Successful login, redirect to dashboard or other page
        window.location.href = '/dashboard'; // Change the URL as needed
      } else if (xhr.status === 401) {
        // Unauthorized, display error message
        displayErrorMessage('Incorrect username or password.');
      } else {
        // Other errors, display error message
        displayErrorMessage('An error occurred. Please try again later.');
      }
    }
  };

  const data = {
    username: username,
    password: password
  };

  xhr.send(JSON.stringify(data));
}

// Add event listener for form submission
loginForm.addEventListener('submit', handleFormSubmission);
