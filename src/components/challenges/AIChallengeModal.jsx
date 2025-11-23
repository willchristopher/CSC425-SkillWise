import React from 'react';

const AIChallengeModal = ({ isOpen, onClose, challenge }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{position:'fixed',top:0,left:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.4)'}}>
      <div className="modal-window" style={{width:'90%',maxWidth:800,background:'#fff',borderRadius:8,padding:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{margin:0}}>{challenge?.title || 'Generated Challenge'}</h3>
          <button onClick={onClose} aria-label="close">×</button>
        </div>
        <div style={{marginTop:12}}>
          <pre style={{whiteSpace: 'pre-wrap'}}>{challenge?.description || 'No challenge generated.'}</pre>
          {challenge?.difficulty && (
            <p><strong>Difficulty:</strong> {challenge.difficulty}</p>
          )}
        </div>
        <div style={{marginTop:12,textAlign:'right'}}>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AIChallengeModal;
