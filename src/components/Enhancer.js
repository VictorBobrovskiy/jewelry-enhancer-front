import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import Dropzone from 'react-dropzone';
import { Container, Row, Col, Button, Form, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Enhancer.css';

function Enhancer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [enhancedImages, setEnhancedImages] = useState([]); // Updated to store multiple images
  const [loading, setLoading] = useState(false);
  const [enhancementType, setEnhancementType] = useState('metal');
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState('');
  const [denoiseLevel, setDenoiseLevel] = useState(0.3);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => {
          if (prevTime >= 240) {
            clearInterval(interval);
            return 240;
          }
          return prevTime + 1;
        });
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileUpload = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    const uploadUrl = "https://18d1-181-29-45-213.ngrok-free.app/image";
    const formData = new FormData();
    formData.append('file', file);

    Axios.post(uploadUrl, formData)
      .then((response) => {
        console.log('File uploaded successfully:', response.data);
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
      });
  };

  
  const handleEnhanceImage = async () => {
    if (!selectedFile) return;

    setLoading(true);

    const enhancementUrl = "https://18d1-181-29-45-213.ngrok-free.app/prompt";
    const data = {
        filename: selectedFile.name,
        enhancementType: enhancementType,
        text: text,
        denoiseLevel: denoiseLevel
    };

    try {
        const response = await Axios.post(enhancementUrl, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (Array.isArray(response.data)) {
            const base64Images = response.data.map((imageData) =>
                `data:image/jpeg;base64,${imageData}`
            );
            setEnhancedImages(base64Images); // Updated to store multiple images
        } else {
            console.error('Unexpected response format:', response.data);
        }
    } catch (error) {
        console.error('Error enhancing image:', error);
    } finally {
        setLoading(false);
    }
};

const handleDownloadImages = () => {
  enhancedImages.forEach((image, index) => {
    const link = document.createElement('a');
    link.href = image;
    link.download = `enhanced_image_${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

return (
  <Container className="wrapper">
    <h1>Jewelry Enhancer Pro</h1>
    <Container className="enhancer">
      <Dropzone onDrop={handleFileUpload} multiple={false}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            {preview ? (
              <Image src={preview} alt="Selected" className="preview" fluid />
            ) : (
              <p>Drag & drop an image here, or click to select one</p>
            )}
          </div>
        )}
      </Dropzone>
      {selectedFile && (
        <Row className="control">
          <Col className="selectedFile">
            <p className="advice">Selected File: {selectedFile.name}</p>
            <Form className="form">
              <Form.Group>
                <Form.Label>Enhancement type:</Form.Label>
                <div className="radio">
                  <Form.Check
                    className="formCheck"
                    type="radio"
                    id="metal"
                    name="enhancementType"
                    value="metal"
                    label="Metal"
                    checked={enhancementType === 'metal'}
                    onChange={(e) => setEnhancementType(e.target.value)}
                  />
                  <Form.Check
                    className="formCheck"
                    type="radio"
                    id="gems"
                    name="enhancementType"
                    value="gems"
                    label="Gems"
                    checked={enhancementType === 'gems'}
                    onChange={(e) => setEnhancementType(e.target.value)}
                  />
                </div>
              </Form.Group>

              <Form.Group>
                <Form.Control
                  className="textArea"
                  type="text"
                  id="text"
                  placeholder="Enter text prompt carefully and only if needed"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Denoise Level</Form.Label>
                <Form.Control
                  className="slider"
                  type="range"
                  min="0.2"
                  max="0.9"
                  step="0.1"
                  value={denoiseLevel}
                  onChange={(e) => setDenoiseLevel(parseFloat(e.target.value))}
                />
                <Form.Text>{denoiseLevel}</Form.Text>
              </Form.Group>
              <p className="advice">For realistic images choose between 0.2 and 0.4 </p>
              <p className="advice">For artistic images choose between 0.5 and 0.7 </p>
              <p className="advice">Denoise above 0.7 use at your own risk</p>
              <Button onClick={handleEnhanceImage} disabled={loading}>Enhance Image</Button>
            </Form>
          </Col>
        </Row>
      )}
      {loading && (
        <div className="loading-block">
          <p>Enhancing image<span className="dots"></span></p>
          <div className="progress">
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${(elapsedTime / 240) * 100}%` }}
              aria-valuenow={(elapsedTime / 240) * 100}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {Math.round((elapsedTime / 240) * 100)}%
            </div>
          </div>
          <p className="advice">Estimated processing time for the first image is about 4-5 minutes. For the latter images it is about 2-3 minutes</p>
          
      </div>
    )}
    </Container>
    {enhancedImages.length > 0 && (
      <div className="ready">
        {enhancedImages.map((image, index) => (
          <div key={index} className="dropzone">
            <Image className="preview" src={image} alt={`Enhanced ${index + 1}`} fluid />
          </div>
        ))}
        <Button onClick={handleDownloadImages}>Download Images</Button>
      </div>
    )}
    <Row className="disclaimer"><p>Disclaimer: The proposed version of the editing is a simplified visualization of the capabilities of jewelry retouching using neural networks for easy testing. The full version includes additional processing options that enable a wider variety of effects.</p></Row>
  </Container>
);
}

export default Enhancer;