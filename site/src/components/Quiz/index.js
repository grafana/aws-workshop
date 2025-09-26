import React, { useState } from 'react';
import styles from './Quiz.module.css';

export default function Quiz({ questions }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIndex, cIndex) => {
    if (!showResults) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [qIndex]: cIndex,
      }));
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    return questions.reduce((score, question, index) => {
      const selected = selectedAnswers[index];
      const correct = question.choices.findIndex((c) => c.is_correct);
      return selected === correct ? score + 1 : score;
    }, 0);
  };

  return (
    <div className={styles.quizContainer}>
      {questions.map((q, qIndex) => {
        const selected = selectedAnswers[qIndex];
        const correctIndex = q.choices.findIndex((c) => c.is_correct);

        return (
          <div key={qIndex} className={styles.questionBlock}>
            <p className={styles.question}>{q.question_text}</p>
            <ul className={styles.choices}>
              {q.choices.map((choice, cIndex) => {
                let className = styles.choice;

                if (showResults) {
                  if (cIndex === correctIndex) {
                    className += ` ${styles.correct}`;
                  } else if (selected === cIndex) {
                    className += ` ${styles.incorrect}`;
                  }
                } else if (selected === cIndex) {
                  className += ` ${styles.selected}`;
                }

                return (
                  <li
                    key={cIndex}
                    className={className}
                    onClick={() => handleSelect(qIndex, cIndex)}
                  >
                    {choice.choice_text}
                    {showResults && cIndex === correctIndex && ' ✅'}
                    {showResults && selected === cIndex && selected !== correctIndex && ' ❌'}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {!showResults ? (
        <button className={styles.submitButton} onClick={handleSubmit}>
          Check Answers
        </button>
      ) : (
        <p className={styles.score}>
          You got {calculateScore()} out of {questions.length} correct.
        </p>
      )}
    </div>
  );
}
