// Elements
const cells = document.querySelectorAll(".cell");
const resetBtn = document.querySelector(".reset-btn");
const playerScoreElement = document.getElementById("player-score");
const robotScoreElement = document.getElementById("robot-score");
const drawScoreElement = document.getElementById("draw-score");
const gameStatusElement = document.getElementById("game-status");

// Game State
let currentPlayer = "X";
let gameBoard = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
let scores = {
  player: 0,
  robot: 0,
  draws: 0,
};

// Winning conditions
const winConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Initialize the game
function initGame() {
  cells.forEach((cell, index) => {
    cell.addEventListener("click", () => handleCellClick(index));
  });

  resetBtn.addEventListener("click", resetGame);
  updateGameStatus();
}

// Handle cell click
function handleCellClick(index) {
  if (!gameActive || gameBoard[index] !== "") return;

  // Player's move
  makeMove(index, "X");

  // Check if game continues
  if (gameActive) {
    updateGameStatus();

    // Robot's move after a short delay
    setTimeout(() => {
      if (gameActive) {
        robotMove();
      }
    }, 500);
  }
}

// Make a move
function makeMove(index, player) {
  gameBoard[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(`player-${player.toLowerCase()}`);

  // Add click animation
  cells[index].classList.add("clicked");
  setTimeout(() => {
    cells[index].classList.remove("clicked");
  }, 2000);

  checkGameStatus();
}

// Robot's move (simple AI)
function robotMove() {
  if (!gameActive) return;

  // Try to win
  let move = findWinningMove("O");

  // Block player if they can win
  if (move === -1) {
    move = findWinningMove("X");
  }

  // Take center if available
  if (move === -1 && gameBoard[4] === "") {
    move = 4;
  }

  // Take a corner if available
  if (move === -1) {
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(
      (corner) => gameBoard[corner] === ""
    );
    if (availableCorners.length > 0) {
      move =
        availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
  }

  // Take any available cell
  if (move === -1) {
    const availableCells = gameBoard.map((cell, index) => (cell === "" ? index : -1))
      .filter((index) => index !== -1);
    if (availableCells.length > 0) {
      move = availableCells[Math.floor(Math.random() * availableCells.length)];
    }
  }

  if (move !== -1) {
    makeMove(move, "O");
    updateGameStatus();
  }
}

// Find winning move for a player
function findWinningMove(player) {
  for (const condition of winConditions) {
    const [a, b, c] = condition;
    const cells = [gameBoard[a], gameBoard[b], gameBoard[c]];

    // If two cells are filled by player and one is empty
    if (
      cells.filter((cell) => cell === player).length === 2 &&
      cells.includes("")
    ) {
      // Return the empty cell index
      if (gameBoard[a] === "") return a;
      if (gameBoard[b] === "") return b;
      if (gameBoard[c] === "") return c;
    }
  }
  return -1;
}

// Check game status
function checkGameStatus() {
  let winner = null;

  // Check for win
  for (const condition of winConditions) {
    const [a, b, c] = condition;
    if (
      gameBoard[a] &&
      gameBoard[a] === gameBoard[b] &&
      gameBoard[a] === gameBoard[c]
    ) {
      winner = gameBoard[a];

      // Highlight winning cells
      cells[a].classList.add("winning-cell");
      cells[b].classList.add("winning-cell");
      cells[c].classList.add("winning-cell");
      break;
    }
  }

  if (winner) {
    gameActive = false;
    updateScores(winner);
    showWinnerAlert(winner);
  } else if (!gameBoard.includes("")) {
    // Draw
    gameActive = false;
    scores.draws++;
    updateScoreDisplay();
    showDrawAlert();
  }
}

// Update scores
function updateScores(winner) {
  if (winner === "X") {
    scores.player++;
  } else if (winner === "O") {
    scores.robot++;
  }
  updateScoreDisplay();
}

// Update score display
function updateScoreDisplay() {
  playerScoreElement.textContent = scores.player;
  robotScoreElement.textContent = scores.robot;
  drawScoreElement.textContent = scores.draws;
}

// Update game status text
function updateGameStatus() {
  if (!gameActive) return;

  const statusText =
    currentPlayer === "X" ? "Player's Turn (X)" : "Robot's Turn (O)";
  gameStatusElement.textContent = statusText;

  // Add subtle animation
  gameStatusElement.classList.toggle("animate");
  setTimeout(() => gameStatusElement.classList.toggle("animate"), 0);
}

// Show winner alert
function showWinnerAlert(winner) {
  const winnerName = winner === "X" ? "Player (X)" : "Robot (O)";

  // Create custom modal
  const modal = document.createElement("div");
  modal.className = "custom-modal";
  modal.innerHTML = `
        <div class="modal-content">
            <h2>🎉 ${winnerName} Wins!</h2>
            <p>Great game! Want to play again?</p>
            <div class="modal-buttons">
                <button class="modal-btn play-again">Play Again</button>
                <button class="modal-btn view-stats">View Stats</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Add event listeners
  modal.querySelector(".play-again").addEventListener("click", () => {
    document.body.removeChild(modal);
    resetGame();
  });

  modal.querySelector(".view-stats").addEventListener("click", () => {
    document.body.removeChild(modal);
    showStats();
    resetGame();
  });

  // Click outside to close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
      resetGame();
    }
  });
}

// Show draw alert
function showDrawAlert() {
  const modal = document.createElement("div");
  modal.className = "custom-modal";
  modal.innerHTML = `
        <div class="modal-content">
            <h2>🤝 It's a Draw!</h2>
            <p>Well played! The board is full.</p>
            <div class="modal-buttons">
                <button class="modal-btn play-again">Play Again</button>
                <button class="modal-btn close-btn">Close</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  modal.querySelector(".play-again").addEventListener("click", () => {
    document.body.removeChild(modal);
    resetGame();
  });

  modal.querySelector(".close-btn").addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Show game statistics
function showStats() {
  const modal = document.createElement("div");
  modal.className = "custom-modal stats-modal";
  modal.innerHTML = `
        <div class="modal-content">
            <h2>📊 Game Statistics</h2>
            <div class="stats-container">
                <div class="stat-item">
                    <span class="stat-label">Player Wins (X):</span>
                    <span class="stat-value">${scores.player}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Robot Wins (O):</span>
                    <span class="stat-value">${scores.robot}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Draws:</span>
                    <span class="stat-value">${scores.draws}</span>
                </div>
                <div class="stat-item total">
                    <span class="stat-label">Total Games:</span>
                    <span class="stat-value">${
                      scores.player + scores.robot + scores.draws
                    }</span>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn continue-btn">Continue Playing</button>
                <button class="modal-btn reset-scores-btn">Reset Scores</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  modal.querySelector(".continue-btn").addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  modal.querySelector(".reset-scores-btn").addEventListener("click", () => {
    document.body.removeChild(modal);
    resetScores();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Reset the game board
function resetGame() {
  gameBoard = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = "X";

  // Clear all cells
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("player-x", "player-o", "winning-cell", "clicked");
  });

  // Reset game status
  updateGameStatus();
}

// Reset all scores
function resetScores() {
  scores = { player: 0, robot: 0, draws: 0 };
  updateScoreDisplay();

  // Show confirmation message
  const message = document.createElement("div");
  message.className = "score-reset-message";
  message.textContent = "✅ Scores Reset!";
  document.body.appendChild(message);

  setTimeout(() => {
    document.body.removeChild(message);
  }, 2000);
}

// Add CSS for custom modals
function addModalStyles() {
  const style = document.createElement("style");
  style.textContent = `
        .custom-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            background: #0a0a14;
            border: 2px solid #0ff;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            color: #f0f8ff;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
            animation: modalAppear 0.3s ease-out;
        }
        
        @keyframes modalAppear {
            from {
                opacity: 0;
                transform: scale(0.9) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        .modal-content h2 {
            color: #0ff;
            margin-bottom: 15px;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            font-size: 1.8em;
            text-align: center;
        }
        
        .modal-content p {
            text-align: center;
            margin-bottom: 25px;
            font-size: 1.1em;
            color: #ccc;
        }
        
        .modal-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .modal-btn {
            padding: 12px 25px;
            border: none;
            border-radius: 50px;
            font-family: 'varela-round', sans-serif;
            font-size: 1em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 140px;
        }
        
        .modal-btn.play-again {
            background: linear-gradient(45deg, #0ff, #00bfff);
            color: #000;
        }
        
        .modal-btn.view-stats,
        .modal-btn.continue-btn {
            background: rgba(0, 255, 255, 0.1);
            color: #0ff;
            border: 2px solid #0ff;
        }
        
        .modal-btn.close-btn,
        .modal-btn.reset-scores-btn {
            background: rgba(255, 68, 68, 0.1);
            color: #ff4444;
            border: 2px solid #ff4444;
        }
        
        .modal-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 255, 255, 0.4);
        }
        
        /* Stats modal */
        .stats-container {
            margin: 25px 0;
        }
        
        .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            margin: 8px 0;
            background: rgba(0, 255, 255, 0.05);
            border-radius: 8px;
            border-left: 3px solid #0ff;
        }
        
        .stat-item.total {
            background: rgba(255, 255, 255, 0.1);
            border-left-color: #ff0;
            margin-top: 20px;
            font-size: 1.1em;
        }
        
        .stat-label {
            color: #0ff;
        }
        
        .stat-value {
            font-weight: bold;
            font-size: 1.2em;
        }
        
        /* Score reset message */
        .score-reset-message {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 0, 0.1);
            color: #0f0;
            padding: 15px 25px;
            border-radius: 8px;
            border: 1px solid #0f0;
            animation: slideIn 0.3s ease-out;
            z-index: 1001;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes statusPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        .status-pulse {
            animation: statusPulse 2s ease-in-out;
        }
    `;
  document.head.appendChild(style);
}

// Initialize the game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  addModalStyles();
  initGame();
});
