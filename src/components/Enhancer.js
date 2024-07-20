import React, { useState } from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import { Buffer } from 'buffer';
import { Container, Row, Col, Button, Form, Spinner, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Enhancer.css';

function Enhancer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enhancementType, setEnhancementType] = useState('metal');
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState('');

  const handleFileUpload = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    const uploadUrl = "https://1e93-200-61-165-45.ngrok-free.app/image";
    const formData = new FormData();
    formData.append('file', file);

    axios.post(uploadUrl, formData)
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

    const enhancementUrl = "https://1e93-200-61-165-45.ngrok-free.app/prompt";
    const data = {
      filename: selectedFile.name,
      enhancementType: enhancementType,
      text: text
    };

    try {
      const response = await axios.post(enhancementUrl, data, {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const base64Image = Buffer.from(response.data, 'binary').toString('base64');
      const enhancedImageUrl = `data:image/jpeg;base64,${base64Image}`;

      setEnhancedImage(enhancedImageUrl);
    } catch (error) {
      console.error('Error enhancing image:', error);
    } finally {
      setLoading(false);
    }
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
            <p>Selected File: {selectedFile.name}</p>
            <Form className="form">
              <Form.Group>
                <Form.Label>Enhancement type</Form.Label>
                <div>
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
                  placeholder="Enter text prompt"
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                />
              </Form.Group>
              <Button onClick={handleEnhanceImage} disabled={loading}>Enhance Image</Button>
            </Form>
          </Col>
        </Row>
      )}
      {loading && <Spinner animation="border" role="status"><span className="sr-only">Enhancing image...</span></Spinner>}
      {enhancedImage && (
        <Row cl>
          <Col>

            <Image
            className="preview"
            src={enhancedImage} 
            alt="Enhanced" fluid />
          </Col>
        </Row>
      )}
      </Container>
    </Container>
  );
}

export default Enhancer;
