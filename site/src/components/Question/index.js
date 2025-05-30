import React from 'react';

export default function Question({ id, title }) {
    const storageKey = `question_${id}`;

    return (
        <div className="question" style={{
            border: '1px solid #e1e4e8',
            borderRadius: '6px',
            padding: '16px',
            margin: '16px 0',
            backgroundColor: '#f6f8fa'
        }}>
            <p className="question-title" style={{
                fontWeight: 'bold',
                marginBottom: '12px',
                color: '#24292e'
            }}>
                {title}
            </p>

            <textarea
                defaultValue={localStorage.getItem(storageKey) || ''}
                onChange={(e) => localStorage.setItem(storageKey, e.target.value)}
                placeholder="Enter your answer here..."
                rows={2}
                style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5da',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '60px'
                }}
            />
        </div>
    );
}

