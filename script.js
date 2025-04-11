const boardElement = document.getElementById("chessboard");
const statusElement = document.getElementById("status");
const levelSelect = document.getElementById("level-select");

const game = new window.Chess();
let selected = null;
let engine = STOCKFISH();
let aiLevel = parseInt(levelSelect.value);

levelSelect.addEventListener("change", () => {
  aiLevel = parseInt(levelSelect.value);
});

function renderBoard() {
  boardElement.innerHTML = "";
  const board = game.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      const isLight = (row + col) % 2 === 0;
      square.className = "square " + (isLight ? "light" : "dark");

      const piece = board[row][col];
      if (piece) {
        square.textContent = getPieceUnicode(piece.type, piece.color);
      }

      const file = "abcdefgh"[col];
      const rank = 8 - row;
      const squareId = file + rank;
      square.dataset.square = squareId;

      if (selected === squareId) {
        square.classList.add("selected");
      }

      square.addEventListener("click", handleClick);
      boardElement.appendChild(square);
    }
  }
  updateStatus();
}

function getPieceUnicode(type, color) {
  const codes = { p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚" };
  let symbol = codes[type];
  return color === "w" ? symbol.replace("♟", "♙")
                              .replace("♜", "♖")
                              .replace("♞", "♘")
                              .replace("♝", "♗")
                              .replace("♛", "♕")
                              .replace("♚", "♔") : symbol;
}

function handleClick(e) {
  if (game.game_over()) return;

  const square = e.currentTarget.dataset.square;
  if (selected) {
    const move = game.move({ from: selected, to: square, promotion: "q" });
    selected = null;
    if (move) {
      renderBoard();
      if (!game.game_over()) {
        setTimeout(makeAIMove, 200);
      }
    } else {
      renderBoard();
    }
  } else {
    selected = square;
    renderBoard();
  }
}

function makeAIMove() {
  engine.postMessage("ucinewgame");
  engine.postMessage("isready");
  engine.postMessage("position fen " + game.fen());
  engine.postMessage("go depth " + aiLevel);

  engine.onmessage = (event) => {
    const line = event.data;
    if (line.startsWith("bestmove")) {
      const move = line.split(" ")[1];
      game.move({
        from: move.substring(0, 2),
        to: move.substring(2, 4),
        promotion: "q"
      });
      renderBoard();
    }
  };
}

function updateStatus() {
  if (game.in_checkmate()) {
    statusElement.textContent = game.turn() === "w"
      ? "Hitam menang (Skakmat)" : "Putih menang (Skakmat)";
  } else if (game.in_draw()) {
    statusElement.textContent = "Permainan Seri";
  } else if (game.in_check()) {
    statusElement.textContent = (game.turn() === "w" ? "Putih" : "Hitam") + " dalam skak!";
  } else {
    statusElement.textContent = game.turn() === "w"
      ? "Giliran Kamu (Putih)" : "Giliran AI (Hitam)";
  }
}

renderBoard();
