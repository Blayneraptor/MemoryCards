import React, { useState, useEffect } from "react";
import "./App.css";

const cardImages = [
  "carta1.png",
  "carta2.png",
  "carta3.png",
  "carta4.png",
  "carta5.png",
  "carta6.png",
  "carta7.png",
  "carta8.png",
];

const shuffleArray = (array) => {
  const shuffledArray = [...array, ...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

const App = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isIntroVisible, setIsIntroVisible] = useState(true);

  useEffect(() => {
    setCards(shuffleArray(cardImages));
  }, []);

  const handleCardClick = (index) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedCards.includes(index)) return;

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [first, second] = newFlippedCards;
      if (cards[first] === cards[second]) {
        setMatchedCards((prev) => [...prev, first, second]);
        // No hay espera, puedes hacer clic de nuevo rápidamente
      }
      setTimeout(() => setFlippedCards([]), 500); // Reducir el tiempo de espera a 500 ms
    }
  };

  const renderCard = (index) => {
    const isFlipped = flippedCards.includes(index) || matchedCards.includes(index);
    return (
      <div
        key={index}
        className={`card ${isFlipped ? "flipped" : ""}`}
        onClick={() => handleCardClick(index)}
      >
        <img
          src={process.env.PUBLIC_URL + "/images/" + (isFlipped ? cards[index] : "cartaback.png")}
          alt="card"
          className="card-image"
        />
      </div>
    );
  };

  const handleRestart = () => {
    setCards(shuffleArray(cardImages));
    setFlippedCards([]);
    setMatchedCards([]);
    setIsIntroVisible(true);
  };

  return (
    <div className="game-container">
      {isIntroVisible ? (
        <div className="intro-screen">
          <h1>¡Jugar a Memory Cards Blayne!</h1>
          <button onClick={() => setIsIntroVisible(false)} className="start-button">Empezar</button>
        </div>
      ) : (
        <>
          <div className="card-grid">{cards.map((_, index) => renderCard(index))}</div>
          {matchedCards.length === cards.length && (
            <div className="win-message">
              <h2>¡Felicidades, has ganado!</h2>
              <button onClick={handleRestart} className="restart-button">Reiniciar Juego</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
