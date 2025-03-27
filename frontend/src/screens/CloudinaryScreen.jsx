import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, ProgressBar, Alert, Button } from 'react-bootstrap';

const CloudinaryScreen = () => {
  const [files, setFiles] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  // New state to track which file's analysis is displayed
  const [shownAnalysis, setShownAnalysis] = useState({});

  const processBatch = async (batch, batchNumber, totalBatches) => {
    const batchResults = await Promise.allSettled(
      batch.map(async (file) => {
        let retries = 3;
        let attempt = 1;
        
        while (retries > 0) {
          try {
            const analysisRes = await fetch('/api/gemini/url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: file.secure_url })
            });
            if (!analysisRes.ok) throw new Error(`HTTP error! status: ${analysisRes.status}`);
            const { analysis } = await analysisRes.json();
            return { public_id: file.public_id, analysis };
          } catch (error) {
            if (error.message.includes('429')) {
              const delay = Math.pow(2, attempt) * 1000;
              await new Promise(resolve => setTimeout(resolve, delay));
              retries--;
              attempt++;
            } else {
              throw error;
            }
          }
        }
        
        return {
          public_id: file.public_id,
          analysis: 'Analysis failed after 3 attempts'
        };
      })
    );

    // Update progress
    const newProgress = ((batchNumber + 1) / totalBatches) * 100;
    setProgress(newProgress);

    return batchResults.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        acc[result.value.public_id] = result.value.analysis;
      }
      return acc;
    }, {});
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch files from Cloudinary
        const filesRes = await fetch('/api/cloudinary');
        const filesData = await filesRes.json();
        setFiles(filesData);

        // Batch processing parameters
        const batchSize = 10;
        const totalBatches = Math.ceil(filesData.length / batchSize);
        const delayBetweenBatches = 60000; // 60 seconds

        let allAnalyses = {};

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
          const batchStart = batchIndex * batchSize;
          const batchEnd = batchStart + batchSize;
          const currentBatch = filesData.slice(batchStart, batchEnd);

          try {
            const batchAnalyses = await processBatch(currentBatch, batchIndex, totalBatches);
            allAnalyses = { ...allAnalyses, ...batchAnalyses };
            setAnalyses(prev => ({ ...prev, ...batchAnalyses }));
          } catch (batchError) {
            console.error('Batch error:', batchError);
            setErrors(prev => [
              ...prev,
              `Batch ${batchIndex + 1} failed: ${batchError.message}`
            ]);
          }

          // Delay between batches except the last one
          if (batchIndex < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
          }
        }

        setLoading(false);
        setProgress(100);
      } catch (error) {
        console.error('Initialization error:', error);
        setErrors(prev => [...prev, `Initialization failed: ${error.message}`]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle display for a given file's analysis
  const toggleAnalysisDisplay = (publicId) => {
    setShownAnalysis((prev) => ({
      ...prev,
      [publicId]: !prev[publicId]
    }));
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Cloudinary Files</h1>
      
      {errors.length > 0 && (
        <div className="mb-4">
          {errors.map((error, index) => (
            <Alert key={index} variant="danger" className="mb-2">
              {error}
            </Alert>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <ProgressBar now={progress} label={`${Math.round(progress)}%`} />
          <div className="mt-2 text-muted">
            Processing files in batches (10 files per minute)...
          </div>
        </div>
      ) : (
        <Row>
          {files.map((file) => (
            <Col key={file.public_id} md={6} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="text-truncate">
                    {file.public_id}
                  </Card.Title>
                  <Card.Text className="mb-2">
                    <small>
                      Format: {file.format}<br />
                      Size: {(file.bytes / 1024).toFixed(2)} KB
                    </small>
                  </Card.Text>
                  
                  <div className="analysis-section mt-3">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => toggleAnalysisDisplay(file.public_id)}
                      className="mb-2"
                    >
                      {shownAnalysis[file.public_id] ? 'Hide Analysis' : 'Show Analysis'}
                    </Button>
                    
                    {shownAnalysis[file.public_id] && (
                      analyses[file.public_id] ? (
                        analyses[file.public_id].startsWith('Analysis failed') ? (
                          <Alert variant="warning" className="p-2 mb-0">
                            {analyses[file.public_id]}
                          </Alert>
                        ) : (
                          <div className="analysis-text bg-light p-3 rounded">
                            {analyses[file.public_id]}
                          </div>
                        )
                      ) : (
                        <div className="text-center text-muted">
                          <Spinner animation="border" size="sm" />
                          <span className="ms-2">Pending analysis...</span>
                        </div>
                      )
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CloudinaryScreen;