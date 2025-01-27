import React, { useState, useEffect } from "react";
import "./App.css";

const cardImages = [
  "carta1.PNG",
  "carta2.PNG",
  "carta3.PNG",
  "carta4.PNG",
  "carta5.PNG",
  "carta6.PNG",
  "carta7.PNG",
  "carta8.PNG",
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
  const [moveCount, setMoveCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [lastScores, setLastScores] = useState([]);
  const [introAnimationCompleted, setIntroAnimationCompleted] = useState(false);

  useEffect(() => {
    let timer;
    if (timerRunning) {
      timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [timerRunning]);

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setTimerRunning(false);
      const newScore = { moves: moveCount, time: timeElapsed };
      setLastScores((prev) => [newScore, ...prev].slice(0, 5));
    }
  }, [matchedCards, cards, moveCount, timeElapsed]);

  const handleCardClick = (index) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedCards.includes(index)) return;

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoveCount((prev) => prev + 1);

      const [first, second] = newFlippedCards;
      if (cards[first] === cards[second]) {
        setMatchedCards((prev) => [...prev, first, second]);
      }
      setTimeout(() => setFlippedCards([]), 500);
    }
  };

  const handleRestart = () => {
    setCards(shuffleArray(cardImages));
    setFlippedCards([]);
    setMatchedCards([]);
    setMoveCount(0);
    setTimeElapsed(0);
    setTimerRunning(false);
    setIsIntroVisible(true);
    setIntroAnimationCompleted(false);
  };

  const handleStart = () => {
    setCards(shuffleArray(cardImages));
    setFlippedCards([]);
    setMatchedCards([]);
    setMoveCount(0);
    setTimeElapsed(0);
    setTimerRunning(true);
    setIsIntroVisible(false);
    setIntroAnimationCompleted(true);
  
    // Esperamos un poco antes de mostrar las cartas
    setTimeout(() => {
      document.querySelector(".card-grid").classList.add("show");
    }, 200); // Espera a que la intro se haya desvanecido
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min y ${secs} seg`;
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
          src={process.env.PUBLIC_URL + "/images/" + (isFlipped ? cards[index] : "cartaback.PNG")}
          alt="card"
          className="card-image"
        />
      </div>
    );
  };

  // Encuentra el índice del récord con menos movimientos
  const bestScoreIndex = lastScores.reduce(
    (bestIndex, score, index, scores) =>
      score.moves < scores[bestIndex]?.moves ? index : bestIndex,
    0
  );

  const [showRecords, setShowRecords] = useState(false);

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setShowRecords(true);
    }
  }, [matchedCards, cards]);

  return (
    <div
      className="app-container"
      style={{
        backgroundImage: "url('./images/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div className="game-container">
        {isIntroVisible ? (
          <div className={`intro-screen ${introAnimationCompleted ? "fade-in" : ""}`}>
            <h1>¡Jugar a Memory Cards Blayne!</h1>
            <button onClick={handleStart} className="start-button">
              Empezar
            </button>
          </div>
        ) : (
          <>
            <div className="sidebar">
              <h2>Movimientos: {moveCount}</h2>
              <h2>Tiempo: {formatTime(timeElapsed)}</h2>
              {matchedCards.length === cards.length && (
                <div className="win-message">
                  <h2>¡Felicidades, has ganado!</h2>
                  <p>
                    Terminaste en {moveCount} movimientos con un tiempo de {formatTime(timeElapsed)}.
                  </p>
                  <button onClick={handleRestart} className="restart-button">
                    Reiniciar Juego
                  </button>
                </div>
              )}
            </div>
            <div className="card-grid">{cards.map((_, index) => renderCard(index))}</div>
          </>
        )}
      </div>

      {!isIntroVisible && showRecords && (
        <div className="records-container">
          <h2>Records</h2>
          <ul>
            {lastScores.map((score, index) => (
              <li
                key={index}
                style={{
                  color: index === bestScoreIndex ? "#ffbf00" : "#fff",
                  fontWeight: index === bestScoreIndex ? "bold" : "normal",
                }}
              >
                <strong>{index + 1}:</strong> Movimientos: {score.moves}, Tiempo: {formatTime(score.time)}
              </li>
            ))}
            {lastScores.length === 0 && <p>No hay registros aún.</p>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;