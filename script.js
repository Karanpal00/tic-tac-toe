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

    const printBoard = () => {
        const boardValues = board.map((row) => row.map((cell) => cell.getValue()));
        console.table(boardValues);
    }

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
        printBoard,
        markToken,
    }

}

// GameController function factory
function GameController(playerOneName="Player1", playerTwoName="player2") {
    const players = [{
        name:playerOneName,
        token:'X'
    },
    {
        name:playerTwoName,
        token:'O'
    }];

    const board = GameBoard();
    
    let currentPlayer = players[0];

    // switch player
    const switchPlayer = () => {
        currentPlayer = currentPlayer === players[0]? players[1] : players[0];
    }  

    // check valid cells
    const isValidCell = (row, col, boardSize) => {
        if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
            return true;
        }
        return false;
    }

    const isBoardFull = () => {
        return board.getBoard().every( row => {
            row.every( cell => cell.getValue() !== null);
        })
    }

    // check if someone won
    const checkWin = (row, col) => {
        const token = currentPlayer.token;
        const boardSize = board.getBoard().length;

        const directions = [[0,1], [1,0], [1,1], [1,-1]];

        for (const [dx, dy] of directions) {
            let count = 1;

            //pos direction
            for (let i = 1; i < boardSize; ++i) {
                const r = row+i*dx, c = col+i*dy;

                if (isValidCell(r, c, boardSize) && board.getBoard()[r][c].getValue() === token) {
                    count++;
                } else break;
            }

            //neg direction
            for (let i = 1; i < boardSize; ++i) {
                const r = row-i*dx, c = col-i*dy;

                if (isValidCell(r, c, boardSize) && board.getBoard()[r][c].getValue() === token) {
                    count++;
                } else break;
            }

            if (count >= boardSize) return true;
        }
        return false;
    }

    // log the players turn
    const log = () => {
        console.log(`Now ${currentPlayer.name}'s turn.`);
    }

    //play the round 
    const playRound = (row, col) => {
        if (!board.markToken(row, col, currentPlayer.token)) {
            console.log('Cannot play this move, try another one.');
            return;
        }
        
        const res = checkWin(row, col);

        if (!res) {
            switchPlayer();
            board.printBoard(); 
            log();  
        } else {
            board.printBoard();
            alert(`${currentPlayer.name} won!.`);
        }
    }

    const reset = () => {
        board.initializeBoard();
        currentPlayer = players[0];
    }

    board.printBoard();
    log();

    return {
        playRound,
        reset,
    };
}

const game = GameController();
