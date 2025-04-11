const boardElement = document.getElementById("chessboard");
const game = new Chess();
let selected = null;
let aiLevel = 8; // Ganti ke 4 (mudah), 8 (sedang), 15 (sulit)

const statusDisplay = document.createElement("div");
statusDisplay.style.marginTop = "20px";
statusDisplay.style.fontSize = "20px";
statusDisplay.style.fontWeight = "bold";
document.body.appendChild(statusDisplay);

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
        const symbol = piece.type;
        const color = piece.color;
        square.textContent = getPieceUnicode(symbol, color);
      }

      const file = "abcdefgh"[col];
      const rank = 8 - row;
      square.dataset.square = file + rank;

      if (selected === file + rank) {
        square.classList.add("selected");
      }

      square.addEventListener("click", handleClick);
      boardElement.appendChild(square);
    }
  }

  updateStatus();
}

function getPieceUnicode(type, color) {
  const codes = {
    p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚"
  };
  const piece = codes[type];
  return color === "w"
    ? piece.replace("♟", "♙")
           .replace("♜", "♖")
           .replace("♞", "♘")
           .replace("♝", "♗")
           .replace("♛", "♕")
           .replace("♚", "♔")
    : piece;
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
        setTimeout(makeAIMove, 300);
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
  stockfish.postMessage("position fen " + game.fen());
  stockfish.postMessage("go depth " + aiLevel);

  stockfish.onmessage = function (e) {
    const line = e.data;
    if (line.startsWith("bestmove")) {
      const move = line.split(" ")[1];
      game.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: "q" });
      renderBoard();
    }
  };
}

function updateStatus() {
  let status = "";

  if (game.in_checkmate()) {
    status = game.turn() === "w" ? "Hitam menang (Skakmat)" : "Putih menang (Skakmat)";
  } else if (game.in_draw()) {
    status = "Permainan Seri";
  } else if (game.in_check()) {
    status = (game.turn() === "w" ? "Putih" : "Hitam") + " dalam skak!";
  } else {
    status = (game.turn() === "w" ? "Giliran Kamu (Putih)" : "Giliran AI (Hitam)");
  }

  statusDisplay.textContent = status;
}

renderBoard();
