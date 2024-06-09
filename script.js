// tic tac toe


const gameboard = (function() {
    let board = [["", "", ""],
                 ["", "", ""],
                 ["", "", ""]];
    // how many cells are filled
    let filled = 0;

    const getBoard = () => board;
    const getFilled = () => filled;
    const add = (row, col, fighter) => {
        board[row][col] = fighter;
        filled += 1;
    };
    const clearBoard = () => {
        filled = 0;
        board = [["", "", ""],
                 ["", "", ""],
                 ["", "", ""]];
    };

    return {getFilled, add, clearBoard, getBoard};
})();

function createPlayer(name, fighter) {
    return {name, fighter};
}

const gameController = (function() {

    // settings control
    let fighterOne; 
    let fighterTwo;
    let playerOne; 
    let playerTwo;

    const playerOneNameInput = document.querySelector("#player-one-name");
    const playerTwoNameInput = document.querySelector("#player-two-name");
    const getPlayerNameInputs = () => ({playerOneNameInput, playerTwoNameInput});

    const getPlayers = () => ({playerOne, playerTwo});
    const setFighters = (fighter) => {
        if (fighter.dataset.player == "one") fighterOne = fighter.dataset.name;
        else fighterTwo = fighter.dataset.name;
    };

    const validateInput = () => {
        if (playerOneNameInput.checkValidity()
            && playerTwoNameInput.checkValidity() 
            && (playerOneNameInput.value != playerTwoNameInput.value)
            && (fighterOne != undefined && fighterTwo != undefined) ) return true;
        else return false;
    };
    const checkSettings = () => {
        if (validateInput()) {
            playerOne = createPlayer(playerOneNameInput.value, fighterOne);
            playerTwo = createPlayer(playerTwoNameInput.value, fighterTwo);
            activePlayer = playerOne;
            return true;
        } else {
            screenController.showErrorMessage(playerOneNameInput, playerTwoNameInput);
            return false;
        }
    };

    let activePlayer;
    const getActivePlayer = () => activePlayer;

    const switchPlayer = () => {
        activePlayer = activePlayer == playerOne ? playerTwo : playerOne;
    };

    const playRound = (cell) => {
        let row = cell.dataset.row;
        let col = cell.dataset.col;
        let threeInARow = false;

        // if cell is occupied
        if (gameboard.getBoard()[row][col] != "") return;

        // if cell not occupied, add to gameboard object and update display
        gameboard.add(row, col, getActivePlayer().fighter);
        screenController.updateScreen(cell, getActivePlayer().fighter);

        // checking if game is over
        threeInARow = checkThreeInARow(row, col);

        // switch player 
        switchPlayer();

        // variable 3 in a row == true || board is filled
        if (threeInARow == true || gameboard.getFilled() == 9) {
            screenController.showGameover(threeInARow);
        }
    };

    const checkThreeInARow = (row, col) => {
        // impossible to have 3 in a row until at least 5 choices are made
        if (gameboard.getFilled() < 5) return false;
    
        // retrieving most recent input data
        let fighter = getActivePlayer().fighter;
        let vertical = 0;
        let horizontal = 0;
        let diagonalLeft = 0;
        let diagonalRight = 0;
    
        for(let i = 0; i < 3; i++) {
            if (gameboard.getBoard()[row][i] == fighter) vertical++;
            if (gameboard.getBoard()[i][col] == fighter) horizontal++;
            if (gameboard.getBoard()[i][i] == fighter) diagonalLeft++;
            if (gameboard.getBoard()[i][2 - i] == fighter) diagonalRight++;
        }
    
        if (vertical === 3 || horizontal === 3 || diagonalLeft === 3 || diagonalRight === 3) return true;
        else {
            return false;
        }
    };

    return {checkSettings, setFighters, getPlayers, getPlayerNameInputs ,getActivePlayer, playRound};
})();

// directly interacts with ui
const screenController = (function() {

    // settings
    const chooseFighter = (fighter) => fighter.classList.add("chosen"); 
    const removeFighter = (fighter) => fighter.classList.remove("chosen");
    const clickHandlerFighter = (e) => {
        const player = e.target.dataset.player;
        const name = e.target.dataset.name;

        fighters.forEach(fighter => {
            if ( (fighter == e.target) || (fighter.dataset.player != player && fighter.dataset.name != name) ) {
                chooseFighter(fighter);
                gameController.setFighters(fighter);
            } else {
                removeFighter(fighter);
            }
        });
    };
    const fighters = document.querySelectorAll(".fighter-container > button");
    fighters.forEach(fighter => fighter.addEventListener("click", clickHandlerFighter));

    const playerOneNameErrorMsg = document.querySelector("#player-one .name-error-message");
    const playerTwoNameErrorMsg = document.querySelector("#player-two .name-error-message");
    const showErrorMessage = (playerOneNameInput, playerTwoNameInput) => {
        playerNamesClearError();

        if (playerOneNameInput.validity.valueMissing) playerOneNameErrorMsg.textContent = "*Input is required";
        if (playerTwoNameInput.validity.valueMissing) playerTwoNameErrorMsg.textContent = "*Input is required";
        
        // do not display this error message for double empty inputs
        if ((playerOneNameInput.value == playerTwoNameInput.value) && !playerOneNameInput.validity.valueMissing) {
            playerOneNameErrorMsg.textContent = "*Names cannot be the same";
        }
    };
    const playerNamesClearError = () => {
        // clearing previous error messages
        playerOneNameErrorMsg.textContent = "";
        playerTwoNameErrorMsg.textContent = "";
    };

    const startGameButton = document.querySelector("#start-game-button");
    const gameSettingsWrapper = document.querySelector("#game-settings-wrapper");
    const playerOneNameDisplay = document.querySelector("#player-one-info > .name");
    const playerOneFighterDisplay = document.querySelector("#player-one-info > .fighter");
    const playerTwoNameDisplay = document.querySelector("#player-two-info > .name");
    const playerTwoFighterDisplay = document.querySelector("#player-two-info > .fighter");
    startGameButton.addEventListener("click", () => {
        if (gameController.checkSettings()) {
            gameSettingsWrapper.classList.toggle("hide");

            // display player info 
            playerOneNameDisplay.textContent = gameController.getPlayers().playerOne.name;
            playerTwoNameDisplay.textContent = gameController.getPlayers().playerTwo.name;
            playerOneFighterDisplay.textContent = gameController.getPlayers().playerOne.fighter;
            playerTwoFighterDisplay.textContent = gameController.getPlayers().playerTwo.fighter;

            // want to indicate player one's turn
            screenController.showActivePlayer();
        }
    });


    // gameboard
    const clickHandlerBoard = (e) => {
        let cell = e.target;
        gameController.playRound(cell);
    };
    const cells = document.querySelectorAll("#game-container > div");
    cells.forEach(cell => cell.addEventListener("click", clickHandlerBoard));

    const updateScreen = (cell, fighter) => {
        cell.textContent = fighter;
        showActivePlayer();
    };

    let activePlayerOneFlag = true;
    const showActivePlayer = () => {
        if (activePlayerOneFlag) {
            playerOneNameDisplay.classList.add("active");
            playerTwoNameDisplay.classList.remove("active");
        } else {
            playerTwoNameDisplay.classList.add("active"); 
            playerOneNameDisplay.classList.remove("active");
        }
        activePlayerOneFlag = !activePlayerOneFlag;
    };

    const clearActivePlayer = () => {
        playerOneNameDisplay.classList.remove("active");
        playerTwoNameDisplay.classList.remove("active");
    };

    const resultMessage = document.querySelector("#result-message");
    const newGameButton = document.querySelector("#new-game-button");
    const newGame = () => {
        // clear player info
        playerOneNameDisplay.textContent = "";
        playerOneFighterDisplay.textContent = "";
        playerTwoNameDisplay.textContent = "";
        playerTwoFighterDisplay.textContent = "";
        
        activePlayerOneFlag = true;
        gameboard.clearBoard();
        cells.forEach(cell => cell.textContent = "");
        cells.forEach(cell => cell.addEventListener("click", clickHandlerBoard));
        resultMessage.textContent = "";
        newGameButton.classList.toggle("hide");

        // settings
        gameSettingsWrapper.classList.toggle("hide");
        fighters.forEach(fighter => fighter.classList.remove("chosen"));
        playerNamesClearError();

        // - clear name inputs
        gameController.getPlayerNameInputs().playerOneNameInput.value = "";
        gameController.getPlayerNameInputs().playerTwoNameInput.value = "";
    };
    newGameButton.addEventListener("click", newGame);

    const showGameover = (threeInARow) => {
        // display winner if three in a row
        if (threeInARow) {
            const winner = gameController.getActivePlayer();
            resultMessage.textContent = `The winner is: ${winner.name}!`;
        } else {
            resultMessage.textContent = "TIE!";
        }

        // clear active player highlight
        clearActivePlayer();

        // disable board
        cells.forEach(cell => cell.removeEventListener("click", clickHandlerBoard));

        // offer new game
        newGameButton.classList.toggle("hide");
    };

    return {updateScreen, showGameover, showActivePlayer, showErrorMessage};
})();