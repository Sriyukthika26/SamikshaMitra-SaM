
// import React, { useState } from 'react';
// import { Container, Form, Button, Card, Spinner } from 'react-bootstrap';
// import axios from 'axios';

// const EvaluationScreen = () => {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [response, setResponse] = useState(null);

//   // Capture the selected file
//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   // Upload the file and request ML model evaluation from the backend
//   const handleUpload = async () => {
//     if (!file) {
//       alert('Please select a file');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       setLoading(true);

//       // Use the backend evaluation endpoint
//       const { data } = await axios.post('http://localhost:5000/api/evaluate', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       setResponse(data);
//     } catch (error) {
//       console.error('Error:', error);
//       setResponse({ error: 'Unable to process the file' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container className='d-flex flex-column align-items-center mt-5'>
//       <Card className='p-4 w-50'>
//         <h2 className='text-center mb-3'>File Evaluation</h2>
//         <Form.Group controlId='formFile' className='mb-3'>
//           <Form.Label>Upload a File</Form.Label>
//           <Form.Control type='file' onChange={handleFileChange} />
//         </Form.Group>
//         <Button onClick={handleUpload} variant='primary' disabled={loading}>
//           {loading ? <Spinner animation='border' size='sm' /> : 'Evaluate File'}
//         </Button>
//       </Card>

//       {response && (
//         <Card className='p-3 mt-3 w-50'>
//           <h4>Evaluation Response:</h4>
//           <div
//             style={{
//               whiteSpace: 'pre-wrap',
//               fontFamily: 'inherit',
//               lineHeight: '1.6',
//               textAlign: 'left',
//             }}
//           >
//             {response.analysis
//               ? response.analysis
//               : JSON.stringify(response, null, 2)}
//           </div>
//         </Card>
//       )}
//     </Container>
//   );
// };

// export default EvaluationScreen;

















// import React, { useState } from 'react';
// import { Container, Form, Button, Card, Spinner } from 'react-bootstrap';
// import axios from 'axios';

// const GeminiScreen = () => {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [response, setResponse] = useState(null);

//   // Capture the selected file
//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   // Upload the file and request Gemini evaluation
//   const handleUpload = async () => {
//     if (!file) {
//       alert('Please select a file');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       setLoading(true);

//       // If you're using a Vite proxy, you can just do '/api/gemini/image'
//       // Otherwise, use the full URL: 'http://localhost:5000/api/gemini/image'
//       const { data } = await axios.post('/api/gemini/image', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       // The backend might return something like:
//       // {
//       //   message: 'Gemini image evaluation success',
//       //   data: { ...someResponse }
//       // }
//       setResponse(data);
//     } catch (error) {
//       console.error('Error:', error);
//       setResponse({ error: 'Unable to process the image' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container className='d-flex flex-column align-items-center mt-5'>
//       <Card className='p-4 w-50'>
//         <h2 className='text-center mb-3'>Gemini Evaluation</h2>
//         <Form.Group controlId='formFile' className='mb-3'>
//           <Form.Label>Upload a FILE</Form.Label>
//           <Form.Control type='file' onChange={handleFileChange} />
//         </Form.Group>
//         <Button onClick={handleUpload} variant='primary' disabled={loading}>
//           {loading ? <Spinner animation='border' size='sm' /> : 'Evaluate Image'}
//         </Button>
//       </Card>

//       {response && (
//   <Card className='p-3 mt-3 w-50'>
//     <h4>Gemini Response:</h4>
//     <div style={{ 
//       whiteSpace: 'pre-wrap',
//       fontFamily: 'inherit',
//       lineHeight: '1.6',
//       textAlign: 'left'
//     }}>
//       {response.analysis
//         // Remove markdown artifacts
//         .replace(/\*\*/g, '')
//         // Convert bullet points to clean lines
//         .replace(/\*/g, '•')
//         // Split into paragraphs
//         .split('\n')
//         .map((paragraph, index) => (
//           <p key={index} style={{ marginBottom: '1rem' }}>
//             {paragraph}
//           </p>
//         ))}
//     </div>
//   </Card>
// )}
//     </Container>
//   );
// };

// export default GeminiScreen;
import React, { useState, useEffect } from 'react';
import { 
  Container, Form, Button, Card, Spinner, Table, 
  Accordion, Badge, ProgressBar, Alert, Row, Col,
  ListGroup
} from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EvaluationScreen = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [problemStatement, setProblemStatement] = useState('');
  const [weightageRows, setWeightageRows] = useState([{ parameter: '', weightage: '' }]);
  const [assessmentRows, setAssessmentRows] = useState([{ parameter: '', low: '', mid: '', high: '' }]);
  const [loading, setLoading] = useState(false);
  const [taskIds, setTaskIds] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [expandedAnalysis, setExpandedAnalysis] = useState(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const updatedFiles = [...files, ...newFiles].slice(0, 10); // Keep only first 10 files
    setFiles(updatedFiles);
    e.target.value = null; // Reset input to allow selecting same files again
  };

  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    const rubricObject = {
      weightageRows: weightageRows.filter(row => row.parameter && row.weightage),
      assessmentRows: assessmentRows.filter(row => row.parameter && row.low && row.mid && row.high),
    };

    const formData = new FormData();
    files.forEach(file => formData.append('files[]', file));
    formData.append('problem_statement', problemStatement);
    formData.append('rubric', JSON.stringify(rubricObject));

    try {
      setError(null);
      setLoading(true);
      const { data } = await axios.post('http://localhost:5000/api/evaluate', formData);
      setTaskIds(data.task_ids);
      setProgress({ completed: 0, total: data.total_files });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start evaluation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskIds.length === 0) return;

    const interval = setInterval(async () => {
      try {
        // Check progress status
        const statusRes = await axios.get('http://localhost:5000/api/status');
        setProgress({
          completed: statusRes.data.completed,
          total: statusRes.data.total_files
        });

        // Update leaderboard
        const leaderboardRes = await axios.get('http://localhost:5000/api/leaderboard');
        setLeaderboard(leaderboardRes.data);

        // Clear interval if all done
        if (statusRes.data.completed === statusRes.data.total_files) {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error fetching status:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskIds]);

  const toggleAnalysis = (taskId) => {
    setExpandedAnalysis(expandedAnalysis === taskId ? null : taskId);
  };

  const handleWeightageChange = (index, field, value) => {
    const newRows = [...weightageRows];
    newRows[index][field] = value;
    setWeightageRows(newRows);
  };

  const addWeightageRow = () => {
    setWeightageRows([...weightageRows, { parameter: '', weightage: '' }]);
  };

  const deleteWeightageRow = (index) => {
    const newRows = [...weightageRows];
    newRows.splice(index, 1);
    setWeightageRows(newRows);
  };

  const handleAssessmentChange = (index, field, value) => {
    const newRows = [...assessmentRows];
    newRows[index][field] = value;
    setAssessmentRows(newRows);
  };

  const addAssessmentRow = () => {
    setAssessmentRows([...assessmentRows, { parameter: '', low: '', mid: '', high: '' }]);
  };

  const deleteAssessmentRow = (index) => {
    const newRows = [...assessmentRows];
    newRows.splice(index, 1);
    setAssessmentRows(newRows);
  };

  return (
    <Container className="mt-5">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Card className="p-4 mb-4">
        <h2 className="text-center mb-3">Multi-File Evaluation</h2>
        <Form>
          <Form.Group controlId="formFiles" className="mb-3">
            <Form.Label>Upload Files (Max 10)</Form.Label>
            <Form.Control 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              disabled={loading || files.length >= 10}
            />
            <Form.Text className="d-block mt-2">
              {files.length} file{files.length !== 1 ? 's' : ''} selected (max 10)
            </Form.Text>
            
            {files.length > 0 && (
              <ListGroup className="mt-2">
                {files.map((file, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <span className="text-truncate" style={{ maxWidth: '70%' }}>{file.name}</span>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>

          <Form.Group controlId="problemStatement" className="mb-3">
            <Form.Label>Problem Statement</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
        </Form>
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="text-center mb-3">Weightage of Each Parameter</h3>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Weightage (0.0-1.0)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {weightageRows.map((row, index) => (
              <tr key={index}>
                <td>
                  <Form.Control
                    type="text"
                    placeholder="Parameter"
                    value={row.parameter}
                    onChange={(e) => handleWeightageChange(index, 'parameter', e.target.value)}
                    disabled={loading}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    placeholder="0.0-1.0"
                    value={row.weightage}
                    onChange={(e) => handleWeightageChange(index, 'weightage', e.target.value)}
                    disabled={loading}
                  />
                </td>
                <td>
                  <Button 
                    variant="danger" 
                    onClick={() => deleteWeightageRow(index)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button variant="secondary" onClick={addWeightageRow} disabled={loading}>
          Add Row
        </Button>
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="text-center mb-3">Parameter-wise Assessment</h3>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Low (0.5pt)</th>
              <th>Mid (1pt)</th>
              <th>High (2pt)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {assessmentRows.map((row, index) => (
              <tr key={index}>
                <td>
                  <Form.Control
                    type="text"
                    placeholder="Parameter"
                    value={row.parameter}
                    onChange={(e) => handleAssessmentChange(index, 'parameter', e.target.value)}
                    disabled={loading}
                  />
                </td>
                <td>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Low description"
                    value={row.low}
                    onChange={(e) => handleAssessmentChange(index, 'low', e.target.value)}
                    disabled={loading}
                  />
                </td>
                <td>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Mid description"
                    value={row.mid}
                    onChange={(e) => handleAssessmentChange(index, 'mid', e.target.value)}
                    disabled={loading}
                  />
                </td>
                <td>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="High description"
                    value={row.high}
                    onChange={(e) => handleAssessmentChange(index, 'high', e.target.value)}
                    disabled={loading}
                  />
                </td>
                <td>
                  <Button 
                    variant="danger" 
                    onClick={() => deleteAssessmentRow(index)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button variant="secondary" onClick={addAssessmentRow} disabled={loading}>
          Add Row
        </Button>
      </Card>

      <Card className="p-4 mb-4">
        <Row className="align-items-center">
          <Col>
            <Button 
              onClick={handleUpload} 
              variant="primary" 
              disabled={loading || files.length === 0}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Processing...
                </>
              ) : 'Evaluate Files'}
            </Button>
          </Col>
          {progress.total > 0 && (
            <Col>
              <ProgressBar
                now={(progress.completed / progress.total) * 100}
                label={`${progress.completed}/${progress.total} completed`}
              />
            </Col>
          )}
        </Row>
      </Card>

      {leaderboard.length > 0 && (
        <Card className="p-4 mb-4">
          <h3 className="text-center mb-3">Evaluation Results</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Rank</th>
                <th>File Name</th>
                <th>Score</th>
                <th>Analysis</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <React.Fragment key={entry.task_id}>
                  <tr>
                    <td>
                      <Badge bg={
                        entry.rank === 1 ? 'warning' : 
                        entry.rank === 2 ? 'secondary' : 
                        entry.rank === 3 ? 'danger' : 'primary'
                      }>
                        {entry.rank}
                      </Badge>
                    </td>
                    <td>{entry.file_name}</td>
                    <td>{entry.overall_score?.toFixed(1) || 'N/A'}/10</td>
                    <td>
                      <Button 
                        variant="link" 
                        size="sm"
                        onClick={() => toggleAnalysis(entry.task_id)}
                      >
                        {expandedAnalysis === entry.task_id ? 'Hide' : 'Show'} Details
                      </Button>
                    </td>
                  </tr>
                  {expandedAnalysis === entry.task_id && (
                    <tr>
                      <td colSpan={4}>
                        <Card className="border-0">
                          <Card.Body>
                            <h5>Summary</h5>
                            <p>{entry.summary || 'No summary available'}</p>
                            
                            <h5 className="mt-3">Parameter Analysis</h5>
                            {entry.parameters ? (
                              <Table bordered>
                                <thead>
                                  <tr>
                                    <th>Parameter</th>
                                    <th>Score</th>
                                    <th>Explanation</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(entry.parameters).map(([param, details]) => (
                                    <tr key={param}>
                                      <td>{param}</td>
                                      <td>
                                        <Badge bg={
                                          details.annotation === 'high' ? 'success' :
                                          details.annotation === 'mid' ? 'warning' : 'danger'
                                        }>
                                          {details.annotation}
                                        </Badge>
                                      </td>
                                      <td>{details.explanation}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            ) : (
                              <p>No parameter analysis available</p>
                            )}

                            <Row className="mt-3">
                              <Col md={6}>
                                <h5>Key Highlights</h5>
                                {entry.key_highlights?.length > 0 ? (
                                  <ul>
                                    {entry.key_highlights.map((item, i) => (
                                      <li key={i}>{item}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p>No highlights available</p>
                                )}
                              </Col>
                              <Col md={6}>
                                <h5>Areas for Improvement</h5>
                                {entry.areas_of_improvement?.length > 0 ? (
                                  <ul>
                                    {entry.areas_of_improvement.map((item, i) => (
                                      <li key={i}>{item}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p>No improvement suggestions</p>
                                )}
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </Container>
  );
};

export default EvaluationScreen;