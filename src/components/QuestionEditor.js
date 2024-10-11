import React from 'react';

const QuestionEditor = ({ question, handleQuestionChange, handleDeleteQuestion }) => {
  // Handle changes to question text and options
  const handleInputChange = (key, value) => {
    handleQuestionChange(question.id, key, value);
  };

  // Handle adding or updating options for radio/checkbox questions
  const handleOptionsChange = (e) => {
    const options = e.target.value.split(',').map((option) => ({
      label: option.trim(),
      value: option.trim(),
    }));
    handleQuestionChange(question.id, 'options', options);
  };

  return (
    <div className="mb-3">
      <input
        type="text"
        className="form-control mb-2"
        value={question.value}
        onChange={(e) => handleInputChange('value', e.target.value)}
        placeholder="Edit question"
      />
      <select
        className="form-control mb-2"
        value={question.type}
        onChange={(e) => handleInputChange('type', e.target.value)}
      >
        <option value="text">Text</option>
        <option value="textarea">Textarea</option>
        <option value="radio">Radio</option>
        <option value="checkbox">Checkbox</option>
        <option value="number">Number</option>
      </select>

      {/* If the question type is radio or checkbox, render the options input */}
      {(question.type === 'radio' || question.type === 'checkbox') && (
        <input
          type="text"
          className="form-control mb-2"
          value={question.options.map((opt) => opt.label).join(', ')}
          onChange={handleOptionsChange}
          placeholder="Enter options, separated by commas"
        />
      )}

      <button className="btn btn-danger" onClick={() => handleDeleteQuestion(question.id)}>Delete Question</button>
    </div>
  );
};

export default QuestionEditor;
