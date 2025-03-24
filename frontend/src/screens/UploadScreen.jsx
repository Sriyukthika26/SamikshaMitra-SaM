import React, { useState } from 'react';

const UploadScreen = () => {
  // State for storing the selected file
  const [file, setFile] = useState(null);
  // State for storing the response from the server/Cloudinary
  const [uploadResult, setUploadResult] = useState(null);
  // State for showing a loading spinner or message
  const [isLoading, setIsLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    console.log('File selected:', e.target.files[0]);
  };

  // Handle form submission (upload file)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file first.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      // The key 'file' must match what your backend expects in upload.single('file')
      formData.append('file', file);

      console.log('Uploading file to backend...');
      
      // Send the POST request to your backend
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Response from backend:', data);
      
      if (response.ok) {
        // Log success message and Cloudinary details
        console.log('File uploaded successfully to Cloudinary!');
        console.log('Cloudinary URL:', data.url);
        console.log('Public ID:', data.public_id);
        
        // Set the upload result in state to display to the user
        setUploadResult(data);
      } else {
        console.error('Error uploading file:', data.error);
        alert(`Error uploading file: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during upload:', error);
      alert('An unexpected error occurred while uploading the file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Upload a File to Cloudinary</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {/* Show upload result if available */}
      {uploadResult && (
        <div style={styles.result}>
          <h3>File uploaded successfully!</h3>
          <p>
            {/* <strong>URL:</strong>{' '}
            <a href={uploadResult.url} target="_blank" rel="noreferrer">
              {uploadResult.url}
            </a> */}
          </p>
          {/* <p>
            <strong>Public ID:</strong> {uploadResult.public_id}
          </p> */}
        </div>
      )}
    </div>
  );
};

// Simple inline styling (adjust or remove as needed)
const styles = {
  container: {
    padding: '1rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  form: {
    margin: '1rem 0',
  },
  result: {
    backgroundColor: '#f8f8f8',
    padding: '1rem',
    borderRadius: '5px',
    marginTop: '1rem',
  },
};

export default UploadScreen;
