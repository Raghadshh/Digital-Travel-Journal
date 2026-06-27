// src/components/Checklist.jsx
import React, { useState } from 'react';
import '../styles/Checklist.css';

export default function Checklist() {
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setItems([...items, { id: Date.now(), text: inputValue, completed: false }]);
    setInputValue('');
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleToggleComplete = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditValue(text);
  };

  const handleSaveEdit = (id) => {
    if (!editValue.trim()) return;
    setItems(items.map(item => item.id === id ? { ...item, text: editValue } : item));
    setEditingId(null);
  };

  return (
    <div className="checklist-container">
      {/* Title with the signature heart icon theme */}
      <h2 className="checklist-title">
        Checklist
      </h2>
      
      {/* Input Form */}
      <form onSubmit={handleAddItem} className="checklist-form">
        <input 
          type="text" 
          className="checklist-input"
          placeholder="e.g. Bring passport and local currency" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="btn-add">Add Item</button>
      </form>

      {/* Table Section */}
      <div className="checklist-table-wrapper">
        <table className="checklist-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Done</th>
              <th>Task Item</th>
              <th style={{ width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: '#a0b0ad', padding: '2rem' }}>
                  Your checklist is empty. Start adding tasks above!
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className={item.completed ? 'row-completed' : ''}>
                  <td className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={item.completed} 
                      onChange={() => handleToggleComplete(item.id)}
                    />
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input 
                        type="text" 
                        value={editValue} 
                        onChange={(e) => setEditValue(e.target.value)}
                        className="checklist-input"
                        style={{ padding: '0.4rem 0.8rem' }}
                      />
                    ) : (
                      <span className={item.completed ? 'text-completed' : ''}>
                        {item.text}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="checklist-actions">
                      {editingId === item.id ? (
                        <button className="btn-save" onClick={() => handleSaveEdit(item.id)}>Save</button>
                      ) : (
                        <button 
                          className="btn-edit" 
                          onClick={() => startEdit(item.id, item.text)} 
                          disabled={item.completed}
                        >
                          Edit
                        </button>
                      )}
                      <button className="btn-delete" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}