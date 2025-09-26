import React, { useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function Question({ id, title }) {
    const storageKey = `question_${id}`;

    return (
        <BrowserOnly fallback={<div>Loading...</div>}>
            {() => {
                const QuestionContent = () => {
                    const [value, setValue] = useState('');

                    useEffect(() => {
                        // Only access localStorage after component mounts
                        const savedValue = localStorage.getItem(storageKey) || '';
                        setValue(savedValue);
                    }, [storageKey]);

                    const handleChange = (e) => {
                        const newValue = e.target.value;
                        setValue(newValue);
                        localStorage.setItem(storageKey, newValue);
                    };

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
                                value={value}
                                onChange={handleChange}
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
                };

                return <QuestionContent />;
            }}
        </BrowserOnly>
    );
}
