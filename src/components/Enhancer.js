import React, { useState } from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import './Enhancer.css';
import { Buffer } from 'buffer';

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

    // Upload file to the specified URL
    const uploadUrl = "https://bb57-200-61-165-45.ngrok-free.app/image";
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

    const enhancementUrl = "https://bb57-200-61-165-45.ngrok-free.app/prompt";
    const data = {
      filename: selectedFile.name,
      enhancementType: enhancementType,
      text: text // Include the text in the request data
    };

    try {
      const response = await axios.post(enhancementUrl, data, {
        responseType: 'arraybuffer', // Specify the response type as arraybuffer
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Assuming the server sends back an arraybuffer, convert it to base64 or process as needed
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
    <div className="Enhancer">
      <h1>Image Enhancer</h1>
      <Dropzone onDrop={handleFileUpload} multiple={false}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            {preview ? (
              <img src={preview} alt="Selected" className="preview" />
            ) : (
              <p>Drag & drop an image here, or click to select one</p>
            )}
            
          </div>
        )}
      </Dropzone>
      {selectedFile && (
        <div className="control">
          <p>Selected File: {selectedFile.name}</p>
          <div className="radio-buttons">
            <input
              type="radio"
              id="metal"
              name="enhancementType"
              value="metal"
              checked={enhancementType === 'metal'}
              onChange={(e) => setEnhancementType(e.target.value)}
            />
            <label htmlFor="metal">Metal</label>
            <input
              type="radio"
              id="gems"
              name="enhancementType"
              value="gems"
              checked={enhancementType === 'gems'}
              onChange={(e) => setEnhancementType(e.target.value)}
            />
            <label htmlFor="gems">Gems</label>
          </div>
          <div className="text-input">
            <label htmlFor="text">Enter text prompt:</label>
            <input
              type="text"
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <button onClick={handleEnhanceImage}>Enhance Image</button>
        </div>
      )}
      {loading && <p>Enhancing image...</p>}
      {enhancedImage && (
        <div>
          <h2>Enhanced Image:</h2>
          <img src={enhancedImage} alt="Enhanced" />
        </div>
      )}
    </div>
  );
}

export default Enhancer;
