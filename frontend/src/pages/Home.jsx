import React, { useState, useEffect } from 'react';

// Custom Typewriter component
const Typewriter = ({ texts, typingSpeed = 100, deletingSpeed = 50, delayAfterText = 2000 }) => {
  const [text, setText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[currentTextIndex];
    let timeout;

    if (!isDeleting && text === current) {
      // Wait to finish before deleting
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, delayAfterText);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setCurrentTextIndex((prev) => (prev + 1) % texts.length);
    } else {
      const nextText = isDeleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1);
      timeout = setTimeout(() => {
        setText(nextText);
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, texts, currentTextIndex, typingSpeed, deletingSpeed, delayAfterText]);

  return <h2 className="text-2xl md:text-3xl text-blue-600 min-h-[40px] typewriter-cursor">{text}</h2>;
};

const Home = () => {
  return (
    <section className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-white to-blue-50 text-center px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to My Transcription App</h1>
      <Typewriter
        texts={['Fast transcription.', 'Accurate captions.', 'Ready for your lectures!']}
        typingSpeed={100}
        deletingSpeed={50}
        delayAfterText={2000}
      />
      <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">Get Started</button>
    </section>
  );
};

export default Home;

