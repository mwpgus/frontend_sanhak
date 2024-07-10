import React, { useState } from 'react';
import axios from 'axios';

export default function Upload() {
    const [file, setFile] = useState(null);
    const [jsonResponse, setJsonResponse] = useState(null);
    const [message, setMessage] = useState('');

    function printJsonResponse(jsonResponse) {
        return JSON.stringify(jsonResponse, null, 2);
    }

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = () => {
        const formData = new FormData();
        formData.append('file', file);

        axios.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            setMessage('File uploaded successfully!');
            setJsonResponse(response.data);
        })
        .catch(error => {
            setMessage('Failed to upload file.');
            console.error('There was an error uploading the file!', error);
        });
    };

    return (
        <div>
            <h1>Upload File</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            <p>{message}</p>
            {jsonResponse && 
                <div>
                    <h2>JSON Response:</h2>
                    <pre>{printJsonResponse(jsonResponse)}</pre>
                </div>
            }
        </div>
    );
}