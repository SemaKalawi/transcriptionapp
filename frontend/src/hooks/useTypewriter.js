import { useState, useEffect } from 'react';

export default function useTypewriter(words = [], speed = 150, pause = 1000) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex % words.length];
    let typeSpeed = isDeleting ? speed / 2 : speed;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        const updatedText = currentWord.substring(0, letterIndex + 1);
        setText(updatedText);
        setLetterIndex(letterIndex + 1);

        if (updatedText === currentWord) {
          setIsDeleting(true);
        }
      } else {
        const updatedText = currentWord.substring(0, letterIndex - 1);
        setText(updatedText);
        setLetterIndex(letterIndex - 1);

        if (updatedText === '') {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting && letterIndex === 0 ? pause : typeSpeed);

    return () => clearTimeout(timeout);
  }, [letterIndex, isDeleting, wordIndex, words, speed, pause]);

  return text;
}
