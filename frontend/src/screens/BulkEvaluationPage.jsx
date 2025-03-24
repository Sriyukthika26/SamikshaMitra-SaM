import React, { useState } from 'react';
import { Container, Form, Button, Table, Collapse } from 'react-bootstrap';
import axios from 'axios';

const BulkEvaluationPage = () => {
  const [problemStatement, setProblemStatement] = useState('');
  const [files, setFiles] = useState([]);
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBulkEvaluate = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('problemStatement', problemStatement);

      const response = await axios.post('/api/gemini/bulk-evaluate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const sortedResults = response.data.results.sort((a, b) => b.score - a.score);
      setEvaluationResults(sortedResults);
    } catch (err) {
      setError('Evaluation failed. Please check your files and try again.');
      console.error('Evaluation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const CollapsibleAnalysis = ({ analysis }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <Button
          variant="link"
          onClick={() => setIsOpen(!isOpen)}
          className="p-0 text-decoration-none"
          size="sm"
        >
          {isOpen ? '▼ Hide Analysis' : '▶ Show Analysis'}
        </Button>
        <Collapse in={isOpen}>
          <div className="p-2 border rounded mt-2 text-start bg-light">
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {analysis}
            </pre>
          </div>
        </Collapse>
      </div>
    );
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Automated Submission Evaluator</h1>
      
      {/* Problem Statement Input */}
      <Form.Group className="mb-4">
        <Form.Label><h5>Problem Statement</h5></Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
          placeholder="Enter the problem statement or evaluation criteria..."
          className="shadow-sm"
        />
      </Form.Group>

      {/* File Upload Section */}
      <div className="mb-4">
        <h5 className="mb-3">Upload Submissions</h5>
        <Form.Control 
          type="file"
          multiple
          onChange={(e) => setFiles([...e.target.files])}
          className="shadow-sm"
          accept=".pdf,.doc,.docx,.txt,.jpg,.png"
        />
        {files.length > 0 && (
          <div className="mt-2 text-muted">
            {files.length} files selected
          </div>
        )}
      </div>

      {/* Evaluation Button */}
      <div className="d-grid gap-2 mb-4">
        <Button 
          onClick={handleBulkEvaluate}
          disabled={!problemStatement || files.length === 0 || isLoading}
          variant="primary"
          size="lg"
        >
          {isLoading ? 'Evaluating...' : 'Start Evaluation'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      {/* Results Table */}
      {evaluationResults.length > 0 && (
        <div className="shadow-sm rounded-3">
          <Table striped bordered hover className="mb-0">
            <thead className="table-dark">
              <tr>
                <th style={{ width: '80px' }}>Rank</th>
                <th>File Name</th>
                <th style={{ width: '120px' }}>Score</th>
                <th style={{ width: '200px' }}>Analysis</th>
              </tr>
            </thead>
            <tbody>
              {evaluationResults.map((result, index) => (
                <tr key={result.fileName}>
                  <td className="text-center">#{index + 1}</td>
                  <td>{result.fileName}</td>
                  <td className={`text-center fw-bold ${
                    result.score >= 8 ? 'text-success' : 
                    result.score >= 5 ? 'text-warning' : 'text-danger'
                  }`}>
                    {result.score}/10
                  </td>
                  <td>
                    <CollapsibleAnalysis analysis={result.analysis} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default BulkEvaluationPage;