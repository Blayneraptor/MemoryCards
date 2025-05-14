import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactConfetti from "react-confetti";
import useSound from "./useSound";
import "./App.css";

// Array de imágenes de cartas
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

// Función para mezclar el array de cartas
const shuffleArray = (array) => {
  const shuffledArray = [...array, ...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

const App = () => {  // Estados principales del juego
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const [moveCount, setMoveCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [lastScores, setLastScores] = useState(() => {
    // Intentar cargar las puntuaciones desde localStorage
    const savedScores = localStorage.getItem("memoryGameScores");
    return savedScores ? JSON.parse(savedScores) : [];
  });
  
  // Estados para animaciones y efectos
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCardFlipping, setIsCardFlipping] = useState(false);
  const [showWinMessage, setShowWinMessage] = useState(false);
    // Estados para el modo de dos jugadores
  const [isTwoPlayerMode, setIsTwoPlayerMode] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [playerScores, setPlayerScores] = useState({ player1: 0, player2: 0 });
  
  // Referencias
  const confettiRef = useRef(null);
  const windowSize = useWindowSize();
  const { playSound } = useSound();
  const isMobile = windowSize.width <= 768;

  // Custom hook para obtener el tamaño de la ventana
  function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    useEffect(() => {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener("resize", handleResize);
      
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);    return windowSize;
  }

  // Efecto para manejar el timer
  useEffect(() => {
    let timer;
    if (timerRunning) {
      timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [timerRunning]);  // Ya no mostramos notificación de orientación al cambiar de jugador
  // Efecto para manejar el final del juego
  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setTimerRunning(false);
      
      if (isTwoPlayerMode) {
        // Determine winner
        const winner = playerScores.player1 > playerScores.player2 ? 1 : 
                       playerScores.player1 < playerScores.player2 ? 2 : 0; // 0 = draw
        
        // Show confetti and victory message
        setShowConfetti(true);
        playSound("win");
        setTimeout(() => {
          setShowWinMessage(true);
        }, 1000);
      } else {
        // Single player mode
        const newScore = { 
          moves: moveCount, 
          time: timeElapsed, 
          date: new Date().toLocaleDateString() 
        };
        const updatedScores = [newScore, ...lastScores].slice(0, 5);
        setLastScores(updatedScores);
        localStorage.setItem("memoryGameScores", JSON.stringify(updatedScores));
        
        // Show confetti and victory message
        setShowConfetti(true);
        playSound("win");
        setTimeout(() => {
          setShowWinMessage(true);
        }, 1000);
      }
      
      // Hide confetti after a few seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 8000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedCards, cards, moveCount, timeElapsed, lastScores, playSound, isTwoPlayerMode, playerScores]);
  // Manejar clic en carta
  const handleCardClick = (index) => {
    // No permitir clic si ya hay dos cartas volteadas, o si la carta ya está volteada o emparejada
    if (
      flippedCards.length === 2 || 
      flippedCards.includes(index) || 
      matchedCards.includes(index) ||
      isCardFlipping
    ) return;

    // Añadir la carta a las volteadas
    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    // Sonido de carta volteada
    playSound("flip");
      // Si ya hay dos cartas volteadas, comprobar si coinciden
    if (newFlippedCards.length === 2) {
      setIsCardFlipping(true);
      setMoveCount((prev) => prev + 1);

      const [first, second] = newFlippedCards;
      
      // Comprobar si las cartas coinciden
      setTimeout(() => {
        const isMatch = cards[first] === cards[second];
        
        if (isMatch) {
          setMatchedCards((prev) => [...prev, first, second]);
          playSound("match");
          
          // Update player scores in two-player mode
          if (isTwoPlayerMode) {
            setPlayerScores(prev => {
              const key = currentPlayer === 1 ? 'player1' : 'player2';
              return { ...prev, [key]: prev[key] + 1 };
            });
          }        } else {
          playSound("wrong");
          
          // Switch player in two-player mode when cards don't match
          if (isTwoPlayerMode) {
            // Cambiar de jugador sin mostrar la notificación
            setCurrentPlayer(prev => prev === 1 ? 2 : 1);
          }
        }
        
        setFlippedCards([]);
        setIsCardFlipping(false);
      }, 600);
    }
  };
  // Reiniciar el juego
  const handleRestart = () => {
    setCards(shuffleArray(cardImages));
    setFlippedCards([]);
    setMatchedCards([]);
    setMoveCount(0);
    setTimeElapsed(0);
    setTimerRunning(false);
    setIsIntroVisible(true);
    setShowWinMessage(false);
    setShowConfetti(false);
    setCurrentPlayer(1);
    setPlayerScores({ player1: 0, player2: 0 });
  };

  // Iniciar el juego
  const handleStart = (playerMode = "single") => {
    setCards(shuffleArray(cardImages));
    setFlippedCards([]);
    setMatchedCards([]);
    setMoveCount(0);
    setTimeElapsed(0);
    setTimerRunning(true);
    setIsIntroVisible(false);
    setShowWinMessage(false);
    setCurrentPlayer(1);
    setPlayerScores({ player1: 0, player2: 0 });
    setIsTwoPlayerMode(playerMode === "two");
    
    // Pequeña animación para mostrar las cartas
    setTimeout(() => {
      const cardGrid = document.querySelector(".card-grid");
      if (cardGrid) cardGrid.classList.add("show");
    }, 300);
    
    playSound("start");
  };

  // Formatear el tiempo para mostrarlo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  // Encontrar el índice del mejor récord (menos movimientos)
  const bestScoreIndex = lastScores.reduce(
    (bestIndex, score, index, scores) =>
      score.moves < scores[bestIndex]?.moves ? index : bestIndex,
    0
  );  // Componente para mostrar el estado de los jugadores
  const PlayerStatus = () => (
    <div
      className={`player-status ${currentPlayer === 1 ? 'player1-active' : 'player2-active'}`}
    >
      <h3>Modo Dos Jugadores</h3>
      <div className="player-info">
        <div className={`player-name ${currentPlayer === 1 ? 'active-player' : ''}`}>
          <span>Jugador 1</span>
        </div>
        <div className="player-score">{playerScores.player1} puntos</div>
      </div>
      <div className="player-info">
        <div className={`player-name ${currentPlayer === 2 ? 'active-player' : ''}`}>
          <span>Jugador 2</span>
        </div>
        <div className="player-score">{playerScores.player2} puntos</div>
      </div>
    </div>
  );

  // Renderizar una carta
  const renderCard = (index) => {
    const isFlipped = flippedCards.includes(index) || matchedCards.includes(index);
    const isMatched = matchedCards.includes(index);
    
    return (      <motion.div
        key={index}
        className={`card ${isFlipped ? "flipped" : ""} ${isMatched ? "matched" : ""}`}
        onClick={() => handleCardClick(index)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.3,
          delay: index * 0.05,
          type: "spring",
          stiffness: 300
        }}
        whileHover={{ y: -10 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="card-front" style={{ 
          backgroundImage: `url('${process.env.PUBLIC_URL}/images/${cards[index]}')`
        }}></div>
        <div className="card-back" style={{ 
          backgroundImage: `url('${process.env.PUBLIC_URL}/images/cartaback.PNG')`
        }}></div>
      </motion.div>
    );
  };  return (
    <div
      className="app-container"
      style={{
        background: `url('${process.env.PUBLIC_URL}/images/bg.jpg')`
      }}
    >      {/* Confeti para celebrar la victoria */}
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={400}
          ref={confettiRef}
        />      )}        {/* Player Status in Two-Player Mode */}
      {!isIntroVisible && isTwoPlayerMode && <PlayerStatus />}
      
      {/* Reset Button outside of game container */}
      {!isIntroVisible && (
        <motion.button
          className="reset-button"
          onClick={handleRestart}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reiniciar Juego
        </motion.button>      )}

      <div className="game-container">
        {isIntroVisible ? (
          <motion.div 
            className="intro-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Memory Cards Blayne
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              Pon a prueba tu memoria encontrando todas las parejas de cartas en el menor número de movimientos posible.
            </motion.p>
            <div className="game-mode-buttons">
              <motion.button 
                onClick={() => handleStart("single")} 
                className="start-button"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Un Jugador
              </motion.button>
              <motion.button 
                onClick={() => handleStart("two")} 
                className="start-button two-player"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dos Jugadores
              </motion.button>
            </div>
          </motion.div>
        ) : (          <div className="game-area">            <div 
              className="game-info"
            >              {isTwoPlayerMode && (
                <div className="game-info-item player-turn">
                  <span>Turno:</span>
                  <span className="game-info-value current-player">Jugador {currentPlayer}</span>
                </div>
              )}
              <div className="game-info-item">
                <span>Movimientos:</span>
                <span className="game-info-value">{moveCount}</span>
              </div>
              <div className="game-info-item">
                <span>Tiempo:</span>
                <span className="game-info-value">{formatTime(timeElapsed)}</span>
              </div>
            </div><div className="card-grid">
              {cards.map((_, index) => renderCard(index))}
            </div>
            
              {/* Mostrar récords si hay alguno y no estamos en modo dos jugadores */}
            {lastScores.length > 0 && !isTwoPlayerMode && (
              <motion.div 
                className="records-container"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2>Mejores Récords</h2>
                <ul>
                  {lastScores.map((score, index) => (
                    <motion.li
                      key={index}
                      className={index === bestScoreIndex ? "best-score" : ""}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                    >
                      <strong>{index + 1}.</strong> {score.moves} movimientos en {formatTime(score.time)}
                      <span className="score-date">{score.date}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}{/* Mensaje de victoria */}
            <AnimatePresence>
              {showWinMessage && (
                <motion.div 
                  className="win-message"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    {isTwoPlayerMode ? 
                      (playerScores.player1 === playerScores.player2 ? 
                        "¡Empate!" :
                        `¡Jugador ${playerScores.player1 > playerScores.player2 ? "1" : "2"} Gana!`) :
                      "¡Felicidades!"}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    {isTwoPlayerMode ? (
                      <>
                        Puntuación final: <br />
                        Jugador 1: <strong>{playerScores.player1}</strong> puntos<br />
                        Jugador 2: <strong>{playerScores.player2}</strong> puntos<br />
                        Tiempo: <strong>{formatTime(timeElapsed)}</strong>
                      </>
                    ) : (
                      <>
                        Has completado el juego en <strong>{moveCount}</strong> movimientos y <strong>{formatTime(timeElapsed)}</strong>.
                      </>
                    )}
                  </motion.p>
                  <motion.button 
                    onClick={handleRestart} 
                    className="restart-button"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Jugar de Nuevo
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}      </div>
    </div>  );
};

export default App;