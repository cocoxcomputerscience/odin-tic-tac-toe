const gameboard = (function() {

    let board = [["", "", ""],
                 ["", "", ""],
                 ["", "", ""]];
    let filled = 0;

    const getBoard = () => board;
    // returns how many cells are filled
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

    // settings controls
    let fighterOne = null;
    let fighterTwo = null;
    let playerOne; 
    let playerTwo;

    const playerOneNameInput = document.querySelector("#player-one-name");
    const playerTwoNameInput = document.querySelector("#player-two-name");
    const getPlayerNameInputs = () => ({playerOneNameInput, playerTwoNameInput});
    const getPlayers = () => ({playerOne, playerTwo});

    const setFighters = (fighter) => {
        if (fighter.dataset.player == "one") fighterOne = fighter;
        else fighterTwo = fighter;
    };

    const clearFighters = () => {
        fighterOne = null;
        fighterTwo = null;
    };

    const validateInput = () => {
        if (playerOneNameInput.checkValidity()
            && playerTwoNameInput.checkValidity() 
            && (playerOneNameInput.value != playerTwoNameInput.value)
            && (fighterOne != null && fighterTwo != null) ) return true;
        else return false;
    };

    const checkSettings = () => {
        if (validateInput()) {
            playerOne = createPlayer(playerOneNameInput.value, fighterOne.dataset.name);
            playerTwo = createPlayer(playerTwoNameInput.value, fighterTwo.dataset.name);
            activePlayer = playerOne;
            return true;
        } else {
            screenController.showErrorMessage(playerOneNameInput, playerTwoNameInput, fighterOne, fighterTwo);
            return false;
        }
    };

    // controls after starting game
    let activePlayer;
    const getActivePlayer = () => activePlayer;
    const setActivePlayer = (flag) => {
        if (flag) activePlayer = playerOne;
        else activePlayer = playerTwo;
    }

    const switchPlayer = () => {
        activePlayer = activePlayer == playerOne ? playerTwo : playerOne;
    };

    const playRound = (cell) => {
        let row = cell.dataset.row;
        let col = cell.dataset.col;
        let threeInARow = false;

        // if cell is occupied
        if (gameboard.getBoard()[row][col] != "") return;

        // if cell is not occupied
        gameboard.add(row, col, getActivePlayer().fighter);

        // checking if new input ended the game
        threeInARow = checkThreeInARow(row, col);

        // updating screen
        screenController.updateScreen(cell, getActivePlayer().fighter, threeInARow);

        if (threeInARow == true || gameboard.getFilled() == 9) {
            screenController.showGameover(threeInARow);
            return;
        }

        switchPlayer();
    };

    const checkThreeInARow = (row, col) => {
        // impossible to have 3 in a row until at least 5 inputs
        if (gameboard.getFilled() < 5) return false;
    
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
        else return false;
    };

    return {checkSettings, setFighters, clearFighters, getPlayers, getPlayerNameInputs ,getActivePlayer, setActivePlayer, playRound};
})();

const screenController = (function() {

    const gameSettings = document.querySelector("#game-settings");
    const gameMain = document.querySelector("#game-main");
    const fighters = document.querySelectorAll(".fighter-container > button");
    const playerOneNameErrorMsg = document.querySelector("#player-one .name-error-message");
    const playerTwoNameErrorMsg = document.querySelector("#player-two .name-error-message");
    const figherErrorMsg = document.querySelector("#fighter-error-message");
    const startGameButton = document.querySelector("#start-game-button");

    const cells = document.querySelectorAll("#game-container > div");
    const playerOneNameDisplay = document.querySelector("#player-one-info > .name");
    const playerTwoNameDisplay = document.querySelector("#player-two-info > .name");
    const playerOneFighterDisplay = document.querySelector("#player-one-info > .fighter");
    const playerTwoFighterDisplay = document.querySelector("#player-two-info > .fighter");
    const resultMessage = document.querySelector("#result-message");
    const newGameButton = document.querySelector("#new-game-button");
    const startOverButton = document.querySelector("#start-over-button");

    // for both flags, true indicates playerOne; false indicates playerTwo
    let activePlayerFlag = true;    // indicates the active player of the round
    let firstPlayerFlag = true;     // indicates the player who started the first round 

    const chooseFighter = (fighter) => fighter.classList.add("active-fighter"); 
    const removeFighter = (fighter) => fighter.classList.remove("active-fighter");
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

    const clearErrorMessage = () => {
        playerOneNameErrorMsg.textContent = "";
        playerTwoNameErrorMsg.textContent = "";
        figherErrorMsg.textContent = "";
    };

    const showErrorMessage = (playerOneNameInput, playerTwoNameInput, fighterOne, fighterTwo) => {
        clearErrorMessage();
        if (fighterOne == null || fighterTwo == null) figherErrorMsg.textContent = "*Both players must select a fighter"

        if (playerOneNameInput.validity.valueMissing) playerOneNameErrorMsg.textContent = "*Input is required";
        if (playerTwoNameInput.validity.valueMissing) playerTwoNameErrorMsg.textContent = "*Input is required";
        
        // this will not run if both inputs are empty
        if ((playerOneNameInput.value == playerTwoNameInput.value) && !playerOneNameInput.validity.valueMissing) {
            playerOneNameErrorMsg.textContent = "*Names cannot be the same";
            playerTwoNameErrorMsg.textContent = "*Names cannot be the same";
        }
    };

    const clickHandlerBoard = (e) => {
        let cell = e.target;
        gameController.playRound(cell);
    };

    const updateScreen = (cell, fighter, threeInARow) => {
        cell.textContent = fighter;
        if (!threeInARow) showActivePlayer();
    };

    const showActivePlayer = () => {
        if (activePlayerFlag) {
            playerOneNameDisplay.parentElement.classList.add("active-player");
            playerTwoNameDisplay.parentElement.classList.remove("active-player");
        } else {
            playerTwoNameDisplay.parentElement.classList.add("active-player"); 
            playerOneNameDisplay.parentElement.classList.remove("active-player");
        }
        activePlayerFlag = !activePlayerFlag;
    };

    const clearActivePlayer = () => {
        playerOneNameDisplay.parentElement.classList.remove("active-player");
        playerTwoNameDisplay.parentElement.classList.remove("active-player");
    };

    const newGame = () => {
        // clear gameboard
        gameboard.clearBoard();
        cells.forEach(cell => cell.textContent = "");
        cells.forEach(cell => cell.addEventListener("click", clickHandlerBoard));

        // hide result text and buttons
        resultMessage.textContent = "";
        newGameButton.classList.toggle("hide");
        startOverButton.classList.toggle("hide");

        // resetting active player settings
        firstPlayerFlag = !firstPlayerFlag;
        activePlayerFlag = firstPlayerFlag;
        gameController.setActivePlayer(firstPlayerFlag);
        showActivePlayer();
    };

    const startOver = () => {
        // clear player turn info
        playerOneNameDisplay.textContent = "";
        playerOneFighterDisplay.textContent = "";
        playerTwoNameDisplay.textContent = "";
        playerTwoFighterDisplay.textContent = "";

        // clear gameboard
        gameboard.clearBoard();
        cells.forEach(cell => cell.textContent = "");
        cells.forEach(cell => cell.addEventListener("click", clickHandlerBoard));

        // hide result text and buttons
        resultMessage.textContent = "";
        newGameButton.classList.toggle("hide");
        startOverButton.classList.toggle("hide");

        // hide main game
        gameMain.classList.toggle("hide");

        // settings
        gameSettings.classList.toggle("hide");
        fighters.forEach(fighter => fighter.classList.remove("active-fighter"));
        gameController.clearFighters();
        gameController.getPlayerNameInputs().playerOneNameInput.value = "";
        gameController.getPlayerNameInputs().playerTwoNameInput.value = "";
        clearErrorMessage();
    };

    const showGameover = (threeInARow) => {
        // display winner if three in a row
        if (threeInARow) {
            const winner = gameController.getActivePlayer();
            resultMessage.textContent = `The winner is: ${winner.name}!`;
        } else {
            resultMessage.textContent = "TIE!";
        }

        // clear active player highlight
        if (!threeInARow) clearActivePlayer();

        // disable board
        cells.forEach(cell => cell.removeEventListener("click", clickHandlerBoard));

        // offer new game or to start over from setting
        newGameButton.classList.toggle("hide");
        startOverButton.classList.toggle("hide");
    };

    startGameButton.addEventListener("click", () => {
        if (gameController.checkSettings()) {
            gameSettings.classList.toggle("hide");
            gameMain.classList.toggle("hide");

            // display player info 
            playerOneNameDisplay.textContent = gameController.getPlayers().playerOne.name;
            playerTwoNameDisplay.textContent = gameController.getPlayers().playerTwo.name;
            playerOneFighterDisplay.textContent = gameController.getPlayers().playerOne.fighter;
            playerTwoFighterDisplay.textContent = gameController.getPlayers().playerTwo.fighter;

            // want to indicate player one's turn
            screenController.showActivePlayer();
        }
    });
    fighters.forEach(fighter => fighter.addEventListener("click", clickHandlerFighter));
    cells.forEach(cell => cell.addEventListener("click", clickHandlerBoard));
    newGameButton.addEventListener("click", newGame);
    startOverButton.addEventListener("click", startOver);

    return {updateScreen, showGameover, showActivePlayer, showErrorMessage};
})();