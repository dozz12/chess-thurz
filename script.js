document.addEventListener('DOMContentLoaded', () => {
    const chessboard = document.getElementById('chessboard');
    const gameStatus = document.getElementById('gameStatus');
    const resetBtn = document.getElementById('resetBtn');
    let board = [];
    let selectedPiece = null;
    let currentTurn = 'white';
    let gameActive = true;

    // Initialize board
    const pieces = {
        'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔', 'p': '♙',
        'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚', 'P': '♟'
    };

    const initialBoard = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];

    function createBoard() {
        board = JSON.parse(JSON.stringify(initialBoard));
        chessboard.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((i + j) % 2 === 0 ? 'light' : 'dark');
                if (board[i][j] !== '.') {
                    const piece = document.createElement('div');
                    piece.classList.add('piece');
                    piece.textContent = pieces[board[i][j]];
                    square.appendChild(piece);
                }
                square.dataset.row = i;
                square.dataset.col = j;
                square.addEventListener('click', handleClick);
                chessboard.appendChild(square);
            }
        }
        updateStatus();
    }

    function handleClick(e) {
        if (!gameActive) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        if (!selectedPiece) {
            if (board[row][col] !== '.' && isUpperCase(board[row][col]) === (currentTurn === 'white')) {
                selectedPiece = { row, col };
                e.target.classList.add('selected');
            }
        } else {
            if (movePiece(selectedPiece.row, selectedPiece.col, row, col)) {
                currentTurn = currentTurn === 'white' ? 'black' : 'white';
                setTimeout(aiMove, 500); // AI makes move after short delay
            }
            deselectAll();
            selectedPiece = null;
            updateStatus();
        }
    }

    function isUpperCase(char) {
        return char === char.toUpperCase();
    }

    function movePiece(fromRow, fromCol, toRow, toCol) {
        if (fromRow === toRow && fromCol === toCol) return false;

        const piece = board[fromRow][fromCol];
        board[toRow][toCol] = piece;
        board[fromRow][fromCol] = '.';
        return true;
    }

    function aiMove() {
        if (!gameActive) return;

        let fromRow, fromCol, toRow, toCol;
        do {
            fromRow = Math.floor(Math.random() * 8);
            fromCol = Math.floor(Math.random() * 8);
            toRow = Math.floor(Math.random() * 8);
            toCol = Math.floor(Math.random() * 8);
        } while (board[fromRow][fromCol] === '.' || isUpperCase(board[fromRow][fromCol]));

        movePiece(fromRow, fromCol, toRow, toCol);
        currentTurn = 'white';
        updateStatus();
        checkGameOver();
    }

    function deselectAll() {
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    }

    function updateStatus() {
        gameStatus.textContent = `${currentTurn === 'white' ? 'Your' : 'AI\'s'} turn (${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)})`;
    }

    function checkGameOver() {
        // Simple check for king presence
        let whiteKing = false, blackKing = false;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (board[i][j] === 'K') whiteKing = true;
                if (board[i][j] === 'k') blackKing = true;
            }
        }
        if (!whiteKing || !blackKing) {
            gameActive = false;
            gameStatus.textContent = `Game Over! ${whiteKing ? 'Black' : 'White'} wins!`;
        }
    }

    resetBtn.addEventListener('click', () => {
        gameActive = true;
        currentTurn = 'white';
        createBoard();
    });

    createBoard();
});
