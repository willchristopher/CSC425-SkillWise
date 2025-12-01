import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const MODAL_BG_CLASS = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50';
const MODAL_BOX_CLASS = 'bg-white rounded-lg shadow-lg p-6 w-full max-w-md';
const BTN_PRIMARY = 'btn btn-primary';
const BTN_SECONDARY = 'btn btn-secondary';
const BTN_DISABLED = 'opacity-50 cursor-not-allowed';

export default function AiChallengeGenerator({
  apiUrl = '/api/ai/generateChallenge',
  defaultTopic = '',
  defaultDifficulty = '',
  onSaveDraft = () => {},
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [topic, setTopic] = useState(defaultTopic);
  const [difficulty, setDifficulty] = useState(defaultDifficulty);

  const openModal = async () => {
    setModalOpen(true);
    setChallenge(null);
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(apiUrl, {
        topic: topic || undefined,
        difficulty: difficulty || undefined,
      });
      setChallenge(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to generate challenge. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setChallenge(null);
    setError('');
    setLoading(false);
  };

  const handleSaveDraft = () => {
    if (challenge) onSaveDraft(challenge);
  };

  return (
    <>
      <button
        className={`${BTN_PRIMARY} ${loading ? BTN_DISABLED : ''}`}
        onClick={openModal}
        disabled={loading}
        data-testid="generate-btn"
      >
        {loading ? 'Generating...' : 'Generate challenge'}
      </button>
      {modalOpen && (
        <div className={MODAL_BG_CLASS} data-testid="modal-bg">
          <div className={MODAL_BOX_CLASS} role="dialog" aria-modal="true">
            <h2 className="text-xl font-bold mb-2">AI Generated Challenge</h2>
            {loading && <div className="mb-4">Generating challenge...</div>}
            {error && (
              <div className="mb-4 text-red-600" data-testid="error-msg">{error}</div>
            )}
            {challenge && !loading && !error && (
              <div className="mb-4" data-testid="challenge-content">
                <div className="font-semibold">Title:</div>
                <div className="mb-2">{challenge.title}</div>
                <div className="font-semibold">Description:</div>
                <div className="mb-2">{challenge.description}</div>
                <div className="font-semibold">Difficulty:</div>
                <div className="mb-2 capitalize">{challenge.difficulty}</div>
                {challenge.hints && challenge.hints.length > 0 && (
                  <div className="font-semibold">Hints:
                    <ul className="list-disc ml-5">
                      {challenge.hints.map((hint, i) => (
                        <li key={i}>{hint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button className={BTN_SECONDARY} onClick={closeModal} data-testid="close-btn">Close</button>
              <button
                className={BTN_PRIMARY}
                onClick={handleSaveDraft}
                disabled={!challenge || loading}
                data-testid="save-draft-btn"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

AiChallengeGenerator.propTypes = {
  apiUrl: PropTypes.string,
  defaultTopic: PropTypes.string,
  defaultDifficulty: PropTypes.string,
  onSaveDraft: PropTypes.func,
};
