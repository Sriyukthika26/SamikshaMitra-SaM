import React, { useState } from 'react';
import { Container, Form, Button, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';

const GeminiScreen = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // Capture the selected file
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload the file and request Gemini evaluation
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);

      // If you're using a Vite proxy, you can just do '/api/gemini/image'
      // Otherwise, use the full URL: 'http://localhost:5000/api/gemini/image'
      const { data } = await axios.post('/api/gemini/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // The backend might return something like:
      // {
      //   message: 'Gemini image evaluation success',
      //   data: { ...someResponse }
      // }
      setResponse(data);
    } catch (error) {
      console.error('Error:', error);
      setResponse({ error: 'Unable to process the image' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className='d-flex flex-column align-items-center mt-5'>
      <Card className='p-4 w-50'>
        <h2 className='text-center mb-3'>Gemini Evaluation</h2>
        <Form.Group controlId='formFile' className='mb-3'>
          <Form.Label>Upload a file</Form.Label>
          <Form.Control type='file' onChange={handleFileChange} />
        </Form.Group>
        <Button onClick={handleUpload} variant='primary' disabled={loading}>
          {loading ? <Spinner animation='border' size='sm' /> : 'Evaluate File'}
        </Button>
      </Card>

      {response && (
  <Card className='p-3 mt-3 w-50'>
    <h4>Gemini Response:</h4>
    <div style={{ 
      whiteSpace: 'pre-wrap',
      fontFamily: 'inherit',
      lineHeight: '1.6',
      textAlign: 'left'
    }}>
      {response.analysis
        // Remove markdown artifacts
        .replace(/\*\*/g, '')
        // Convert bullet points to clean lines
        .replace(/\*/g, '•')
        // Split into paragraphs
        .split('\n')
        .map((paragraph, index) => (
          <p key={index} style={{ marginBottom: '1rem' }}>
            {paragraph}
          </p>
        ))}
    </div>
  </Card>
)}
    </Container>
  );
};

export default GeminiScreen;
