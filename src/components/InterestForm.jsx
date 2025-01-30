import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// import { UserContext } from '../context/UserContext';

export const InterestForm = () => {
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interests }),
      });
      
      const data = await response.json();
      setUser(data);
      navigate('/chat');
    } catch (error) {
      console.error('Error saving interests:', error);
    }
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Tell us your interests</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter an interest"
          />
          <button
            type="button"
            onClick={addInterest}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Add Interest
          </button>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold mb-2">Your Interests:</h3>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 rounded"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full py-2 bg-green-500 text-white rounded"
        >
          Start Chatting
        </button>
      </form>
    </div>
  );
};