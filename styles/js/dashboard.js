
// Function to handle the click event for the "Create Post" button
function handleCreatePost() {
    // Redirect the user to the "Create Post" page
    window.location.href = '/create-post';
  }
  
  // Function to handle the click event for the "Edit Post" button
  function handleEditPost() {
    // Redirect the user to the "Edit Post" page
    window.location.href = '/edit-post';
  }
  
  // Function to handle the click event for the "Logout" button
  function handleLogout() {
    // Make an AJAX request to the server to log out the user
    fetch('/logout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(response => {
      if (response.ok) {
        // Redirect the user to the login page after successful logout
        window.location.href = '/login';
      } else {
        console.log('Logout failed.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  
  // Add event listeners to the buttons
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('createPostBtn').addEventListener('click', handleCreatePost);
    document.getElementById('editPostBtn').addEventListener('click', handleEditPost);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  });
  