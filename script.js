document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    let game = new Chess();
    let draggedPiece = null;

    // Initialize the board
    function createBoard() {
        for (let i = 0; i < 64; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((i + Math.floor(i / 8)) % 2 === 0 ? 'light' : 'dark');
            square.dataset.index = i;
            square.addEventListener('dragover', dragOver);
            square.addEventListener('drop', drop);
            board.appendChild(square);
        }
        renderBoard();
    }

    // Render the current state of the board
    function renderBoard() {
        const pieces = game.board();
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => square.innerHTML = '');

        pieces.forEach((row, i) => {
            row.forEach((piece, j) => {
                if (piece) {
                    const squareIndex = (7 - i) * 8 + j;
                    const square = document.querySelector(`.square[data-index="${squareIndex}"]`);
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece');
                    pieceElement.draggable = game.turn() === 'w'; // Only white (player) can move
                    pieceElement.textContent = getPieceSymbol(piece);
                    pieceElement.addEventListener('dragstart', dragStart);
                    square.appendChild(pieceElement);
                }
            });
        });

        status.textContent = `Turn: ${game.turn() === 'w' ? 'White' : 'Black (AI)'}`;
        if (game.in_checkmate()) {
            status.textContent = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
        } else if (game.in_draw()) {
            status.textContent = 'Draw!';
        } else if (game.in_stalemate()) {
            status.textContent = 'Stalemate!';
        } else if (game.in_check()) {
            status.textContent += ' - Check!';
        }
    }

    // Get Unicode symbol for piece
    function getPieceSymbol(piece) {
        const symbols = {
            'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
            'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♘'
        };
        return symbols[piece.color + piece.type] || '';
    }

    // Drag and drop functions
    function dragStart(e) {
        draggedPiece = e.target;
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        const fromSquare = Array.from(document.querySelectorAll('.piece')).indexOf(draggedPiece);
        const toSquare = e.target.closest('.square').dataset.index;

        const move = {
            from: chessIndexToAlgebraic(fromSquare),
            to: chessIndexToAlgebraic(toSquare),
            promotion: 'q' // Always promote to queen for simplicity
        };

        if (game.move(move)) {
            renderBoard();
            setTimeout(aiMove, 500); // AI moves after player
        } else {
            alert('Invalid move!');
        }
        draggedPiece = null;
    }

    // Convert board index to algebraic notation (e.g., 0 -> 'a8')
    function chessIndexToAlgebraic(index) {
        const files = 'abcdefgh';
        const rank = 8 - Math.floor(index / 8);
        const file = files[index % 8];
        return file + rank;
    }

    // Simple AI: Random legal move
    function aiMove() {
        const moves = game.moves();
        if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            game.move(randomMove);
            renderBoard();
        }
    }

    // Reset game
    resetButton.addEventListener('click', () => {
        game.reset();
        renderBoard();
    });

    createBoard();
});
