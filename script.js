// Cell function factory
function Cell() {
    const EMPTY = null;
    let value = EMPTY;

    const getValue = () => value;

    const setValue = (player)=> {
        value = player;
    }

    return  {
        getValue,
        setValue
    };
}

// GameBoard function factory
function GameBoard(size = 3) {
    const board = [];

    const rows = size;
    const cols = size;
    
    const initializeBoard = () => {
        for (let i = 0; i < rows; ++i) {
            board[i] = [];
            for (let j = 0; j < cols; ++j) {
                board[i].push(Cell());
            }
        }
    }
    
    initializeBoard();

    const getBoard = () => board;

    const markToken = (row, col, player) => {
        if (board[row][col].getValue() !== null) {
            return false;
        }
        board[row][col].setValue(player);
        
        return true;
    }

    return {
        initializeBoard,
        getBoard,
        markToken,
    }
}

// GameController function factory
function GameController(playerOneName="Player1", playerTwoName="player2") {

    const boardSize = 3;

    const players = [{
        name:playerOneName,
        token:'X'
    },
    {
        name:playerTwoName,
        token:'O'
    }];

    const board = GameBoard(boardSize);
    
    let currentPlayer = players[0];

    // switch player
    const switchPlayer = () => {
        currentPlayer = currentPlayer === players[0]? players[1] : players[0];
    }

    // get board values for the ui
    const getBoardValues = () => {
        return board.getBoard().map(row => row.map(cell => cell.getValue())).flat();
    }

    // check valid cells in the board
    const isValidCell = (row, col, boardSize) => {
        if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
            return true;
        }
        return false;
    }

    // check if the board is full for draw
    const isBoardFull = () => {
        return board.getBoard().every( row =>
            row.every( cell => cell.getValue() !== null)
        );
    }

    // moves to feed the bot
    const movesAvailable = () => {
        const moves = [];

        board.getBoard().forEach((row, r) => {
            row.forEach((col, c) => {
                if (col.getValue() === null) {
                    moves.push([r, c]);
                }
            })
        });

        return moves;
    }

    // check if someone won
    const checkWin = (row, col) => {
        const token = currentPlayer.token;
        const boardSize = board.getBoard().length;

        const grid = board.getBoard();
        const directions = [[0,1], [1,0], [1,1], [1,-1]];

        for (const [dx, dy] of directions) {
            let count = 1;

            //pos direction
            for (let i = 1; i < boardSize; ++i) {
                const r = row+i*dx, c = col+i*dy;

                if (isValidCell(r, c, boardSize) && grid[r][c].getValue() === token) {
                    count++;
                } else break;
            }

            //neg direction
            for (let i = 1; i < boardSize; ++i) {
                const r = row-i*dx, c = col-i*dy;

                if (isValidCell(r, c, boardSize) && grid[r][c].getValue() === token) {
                    count++;
                } else break;
            }

            if (count >= boardSize) return true;
        }
        return false;
    }

    //play the game round 
    const playMove = (row, col) => {
        if (!board.markToken(row, col, currentPlayer.token)) {
            return null;
        }

        if (checkWin(row, col)) {
            return {winner : currentPlayer};
        } else if (isBoardFull()) {
            return {draw: true};
        }

        switchPlayer();

        return null;
    }

    //reset the game
    const reset = () => {
        board.initializeBoard();
        currentPlayer = players[0];
    }

    return {
        boardSize,
        playMove,
        reset,
        movesAvailable,
        getBoardValues,
    };
}

// Dom controller function factory
function DomController () {
    const gameContainer = document.querySelector('#game-board');
    const domGameBoard = document.querySelectorAll('.cell');
    const winBoard = document.querySelector('#winBoard');
    const restartBtn = document.querySelector('#restart-btn');

    const game = GameController();

    let isGameOver = null;

    const gameOver = () => {
        if (isGameOver === null) {
            return;
        }   

        if ('winner' in isGameOver) {
            winBoard.textContent = `${isGameOver.winner.name}  Won!`;

        } else {
            winBoard.textContent = `It's a Draw Fuck both of you!`;
        }

        gameContainer.style.display = 'none';
        winBoard.style.display = 'block';
    }

    const uiReset = () => {
        game.reset();
        gameContainer.style.display = 'grid';
        winBoard.style.display = 'none';
        printBoard();        
    }

     const printBoard = () => {
        const gridValues = game.getBoardValues();
        for(let i = 0; i < domGameBoard.length; ++i) {
            domGameBoard[i].textContent = gridValues[i];
        }
    }

    const dropToken = (e) => {
        const index1D = e.target.dataset.index;
        const row = Math.floor(index1D/game.boardSize);
        const col = index1D%game.boardSize;

        isGameOver = game.playMove(row, col);
        gameOver();
        printBoard();
    }   
  
    const addEvents = () => {
        gameContainer.addEventListener('click', dropToken);
        restartBtn.addEventListener('click', uiReset);
    }    

    addEvents();
    printBoard();
}   

const dom = DomController();

/* 
Todo :-

1.Add win screen.   [Done]
2.Start with the modal taking player names or play against bot. 
3.Add functionality to restart the game.
    a.Once the restart button is clicked then the game should go to the modal.
4.Add tic-tac-toe bot.
*/
