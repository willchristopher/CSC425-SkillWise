import React, { useState, useRef } from 'react';
import axios from 'axios';

const LANGUAGES = [
  '', 'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Ruby', 'Other',
];

export default function AiFeedbackForm({ onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAiSummary(null);

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (language) formData.append('language', language);
    if (file) formData.append('file', file);

    setLoading(true);
    try {
      const res = await axios.post('/api/ai/submitForFeedback', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          // Optionally, set progress state here
        },
      });
      setSuccess('Submission received!');
      if (res.data?.aiSummary) setAiSummary(res.data.aiSummary);
      if (onSuccess) onSuccess(res.data);
      setTitle('');
      setDescription('');
      setLanguage('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to submit. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ai-feedback-form max-w-lg mx-auto p-4 bg-white rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Submit for AI Feedback</h2>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}
      <div className="mb-3">
        <label className="block font-semibold mb-1">Title<span className="text-red-500">*</span></label>
        <input
          type="text"
          className="form-input w-full"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={loading}
          required
        />
      </div>
      <div className="mb-3">
        <label className="block font-semibold mb-1">Description<span className="text-red-500">*</span></label>
        <textarea
          className="form-textarea w-full"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          disabled={loading}
          required
        />
      </div>
      <div className="mb-3">
        <label className="block font-semibold mb-1">Language</label>
        <select
          className="form-select w-full"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          disabled={loading}
        >
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>{lang || 'Select language (optional)'}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="block font-semibold mb-1">File (optional)</label>
        <input
          type="file"
          className="form-input w-full"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={loading}
          accept=".js,.py,.java,.cpp,.c,.txt,.md,.zip,.tar,.gz,.json,.csv,.ts,.tsx,.jsx,.rb,.go,.cs"
        />
      </div>
      <button
        type="submit"
        className={`btn btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit for Feedback'}
      </button>
      {aiSummary && (
        <div className="mt-4 p-3 bg-gray-50 border rounded">
          <div className="font-semibold mb-1">AI Evaluation Summary:</div>
          <div>{aiSummary}</div>
        </div>
      )}
    </form>
  );
}
