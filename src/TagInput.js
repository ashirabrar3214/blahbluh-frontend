import React, { useState, useRef } from 'react';

/**
 * A component for inputting tags.
 * Tags are created by typing and pressing 'Enter' or ','.
 * They can be deleted by clicking the 'x' or by pressing 'Backspace' on an empty input.
 */
const TagInput = ({ tags, onTagsChange }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  /**
   * Handles changes to the input field.
   */
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  /**
   * Adds a new tag to the tags array if it's not empty or a duplicate.
   */
  const addTag = (value) => {
    const newTag = value.trim();
    // Prevent adding empty or duplicate tags
    if (newTag && !tags.includes(newTag)) {
      onTagsChange([...tags, newTag]);
    }
  };

  /**
   * Handles keydown events for creating and deleting tags.
   */
  const handleKeyDown = (e) => {
    // If 'Enter' or ',' is pressed, add the tag
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
      setInputValue('');
    } 
    // If 'Backspace' is pressed on an empty input, remove the last tag
    else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  /**
   * Handles blur events to add the current input as a tag.
   */
  const handleBlur = () => {
    addTag(inputValue);
    setInputValue('');
  };

  /**
   * Removes a tag from the tags array by its index.
   */
  const removeTag = (indexToRemove) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="tag-form">
      <div className="tag-input-container" onClick={() => inputRef.current?.focus()}>
        {tags.map((tag, index) => (
          <div key={index} className="tag-chip">
            {tag}
            <button type="button" className="tag-remove-button" onClick={() => removeTag(index)}>&times;</button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="tag-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="What would you like yap about?"
          autoFocus
        />
      </div>
    </div>
  );
};

export default TagInput;