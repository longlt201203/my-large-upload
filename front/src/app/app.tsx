// src/App.tsx

import React, { useState } from 'react';
import axios, { AxiosProgressEvent } from 'axios';

const CHUNK_SIZE = 10 * 1024 * 1024; // 5MB per chunk
const MAX_CONCURRENT_UPLOADS = 10; // Number of concurrent uploads

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadPercentage, setUploadPercentage] = useState<number>(0); // Total upload percentage
  const [chunkProgresses, setChunkProgresses] = useState<number[]>([]); // Progress of each chunk
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] =
    useState<string>('/api/upload/multer');
  const [inputKey, setInputKey] = useState<number>(Date.now()); // Key for file input to reset it
  const [uploadTime, setUploadTime] = useState<number | null>(null); // Total upload time in milliseconds

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadPercentage(0);
      setChunkProgresses([]);
      setUploadTime(null);
    }
  };

  // Handle endpoint selection
  const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEndpoint(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const initialProgresses = Array(totalChunks).fill(0); // Initial progress for each chunk
      setChunkProgresses(initialProgresses); // Initialize chunk progresses
      const chunkProgressesTemp = [...initialProgresses]; // Temp variable to update chunk progress

      const startTime = Date.now();

      // Function to upload a single chunk
      const uploadChunk = (chunkNumber: number): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
          const start = chunkNumber * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          const formData = new FormData();
          formData.append('chunk', chunk);
          formData.append('chunkNumber', chunkNumber.toString());
          formData.append('totalChunks', totalChunks.toString());
          formData.append('fileName', file.name);

          axios
            .post(selectedEndpoint, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                if (progressEvent.total) {
                  const percentCompleted =
                    (progressEvent.loaded / progressEvent.total) * 100;
                  chunkProgressesTemp[chunkNumber] = percentCompleted;
                  setChunkProgresses([...chunkProgressesTemp]); // Update individual chunk progress

                  // Update total upload percentage
                  const totalProgress =
                    chunkProgressesTemp.reduce((a, b) => a + b, 0) /
                    totalChunks;
                  setUploadPercentage(Math.round(totalProgress));
                }
              },
            })
            .then(() => {
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        });
      };

      // Array to hold chunk numbers
      const chunkNumbers = Array.from(Array(totalChunks).keys());

      // Upload chunks in batches
      for (let i = 0; i < chunkNumbers.length; i += MAX_CONCURRENT_UPLOADS) {
        const chunkBatch = chunkNumbers.slice(i, i + MAX_CONCURRENT_UPLOADS);
        // Start uploads for the current batch
        const uploadPromises = chunkBatch.map((chunkNumber) =>
          uploadChunk(chunkNumber)
        );
        // Wait for all uploads in the batch to complete
        await Promise.all(uploadPromises);
      }

      const endTime = Date.now();
      setUploadTime(endTime - startTime); // Calculate total upload time

      setUploadPercentage(100);
      setFile(null);

      // Reset the file input by changing the key
      setInputKey(Date.now());

      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to upload file.');
      setUploadPercentage(0);
      setUploadTime(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-center text-gray-700">
          Upload Large File
        </h2>

        {errorMessage && (
          <div className="mb-4 text-red-500">{errorMessage}</div>
        )}

        {/* Endpoint Selection */}
        <div className="mb-4">
          <label htmlFor="endpoint" className="block mb-2 text-gray-700">
            Select Upload Endpoint:
          </label>
          <select
            id="endpoint"
            value={selectedEndpoint}
            onChange={handleEndpointChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="/api/upload/multer">/api/upload/multer</option>
            <option value="/api/upload/busboy">/api/upload/busboy</option>
          </select>
        </div>

        <div className="mb-4">
          <input
            key={inputKey}
            type="file"
            onChange={handleFileChange}
            className="block w-full text-gray-700"
          />
        </div>

        {file && (
          <p className="mb-4 text-gray-700">
            Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}{' '}
            MB)
          </p>
        )}

        {/* Total Progress Bar */}
        {uploadPercentage > 0 && (
          <div className="mb-4">
            <p className="text-gray-700">
              Total Upload Progress: {uploadPercentage}%
            </p>
            <div className="w-full h-4 bg-gray-200 rounded">
              <div
                className="h-4 bg-blue-500 rounded"
                style={{ width: `${uploadPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Per Chunk Progress Bars */}
        {chunkProgresses.length > 0 && (
          <div className="mb-4">
            <h3 className="text-gray-700 mb-2">Chunk Progress:</h3>
            {chunkProgresses.map((progress, index) => (
              <div key={index} className="mb-2">
                <p className="text-gray-600">
                  Chunk {index + 1}: {progress.toFixed(2)}%
                </p>
                <div className="w-full h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-green-500 rounded"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Time */}
        {uploadTime !== null && (
          <div className="mb-4">
            <p className="text-gray-700">
              Total Upload Time: {(uploadTime / 1000).toFixed(2)} seconds
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={uploadPercentage > 0 && uploadPercentage < 100}
          className={`w-full px-4 py-2 font-semibold text-white rounded ${
            uploadPercentage > 0 && uploadPercentage < 100
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {uploadPercentage > 0 && uploadPercentage < 100
            ? `Uploading: ${uploadPercentage}%`
            : 'Upload'}
        </button>
      </form>
    </div>
  );
};

export default App;
