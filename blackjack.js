/*
    Blackjack clone
    Written by Ben Cottrell. AGPLv3.
*/
"use strict";
function $(id) {
    return document.body.querySelector(id);
}
var playerDeckView = undefined;
var opponentDeckView = undefined;
var gameState = undefined;
var newGameButton = undefined;
var takeButton = undefined;
var passButton = undefined;
var gameStatusText = undefined;
class CardDeckView {
    rootElem = undefined;
    gameState = undefined;
    playerName = "";
    constructor(selector, gameState, playerName) {
        this.rootElem = $(selector);
        this.playerName = playerName;
        this.gameState = gameState;
        this.gameState.playerCards[this.playerName] = [];
    }
    clearCards() {
        this.gameState.playerCards[this.playerName] = [];
        while (this.rootElem.firstChild) {
            this.rootElem.removeChild(this.rootElem.firstChild);
        }
    }
    addCard(card) {
        this.gameState.playerCards[this.playerName].push(card);
        var cardElem = document.createElement("div");
        cardElem.className = "card " + Card.getStyleClassName(card);
        this.rootElem.appendChild(cardElem);
    }
}
class Card {
    static CARD_NAME_CODES = {
        "Ace": "a", "King": "k", "Queen": "q", "Jack": "j",
        "Ten": "10", "Nine": "9", "Eight": "8", "Seven": "7", "Six": "6", "Five": "5",
        "Four": "4", "Three": "3", "Two": "2"
    };
    static CARD_NAME_SCORES = [1,10,10,10,10,9,8,7,6,5,4,3,2];
    static SUIT_NAME_CODES = { "Diamonds": "d", "Hearts": "h", "Clubs": "c", "Spades": "s" };
    static COLOR_NAME_CODES = { "Red": "r", "Black": "b" };
    static ALLOWED_SUIT_COLORS = [0, 0, 1, 1];
    static NUM_CARD_NAMES = Object.keys(Card.CARD_NAME_CODES).length;
    static NUM_CARD_SUITS = Object.keys(Card.SUIT_NAME_CODES).length;
    static NUM_CARD_COLORS = Object.keys(Card.COLOR_NAME_CODES).length;
    static getStyleClassName(card) {
        //name,suit,color
        return `_${card.assetName()}`;
    }
    //Bit layout for card value:
    //4,3,1
    //nnnnsssc
    cardValue;
    nameId() { 
        return this.cardValue >> 4;
    }
    suitId() {
        return (this.cardValue & 0xf) >> 1;
    }
    colorId() {
        return (this.cardValue & 0xf) & 0x1;
    }
    scoreValue() {
        return Card.CARD_NAME_SCORES[this.nameId()];
    }
    cardName() {
        var nameId = this.nameId();
        return Card.CARD_NAME_CODES[Object.keys(Card.CARD_NAME_CODES)[nameId]];
    }
    suitName() {
        var suitId = this.suitId();
        return Card.SUIT_NAME_CODES[Object.keys(Card.SUIT_NAME_CODES)[suitId]];
    }
    colorName() {
        var suitId = this.suitId();
        return (Card.COLOR_NAME_CODES[
            Object.keys(Card.COLOR_NAME_CODES)[Card.ALLOWED_SUIT_COLORS[suitId]]
        ]);
    }
    assetName() {
        if (cardValue != 0xffffffff) {
            return `${this.cardName()}${this.suitName()}${this.colorName()}`;
        } else {
            return 
        }
    }
    constructor(nameId, suitId) {
        this.cardValue = (nameId << 4) | (suitId << 1);
        this.cardValue = this.cardValue | Card.ALLOWED_SUIT_COLORS[this.suitId()];
    }
}
class GameState {
    gameOver=true;
    playerCards = {};
    playerDeckViews = {};
    playerIdTurn=0;
    playerWinner=undefined;
    startNewGame() {
        this.playerCards = {};
        this.playerIdTurn = 0;
        this.gameOver = false;
        this.playerWinner = undefined;
        if (Object.keys(this.playerDeckViews).length != 0) {
            Object.values(this.playerDeckViews).forEach(e => {
                e.clearCards();
            });
        };
        this.playerTakeCards(0);
        takeButton.disabled = false;
        passButton.disabled = false;
    }
    playerTakeCards(playerId) {
        if (playerId == this.playerIdTurn) {
            dealCards(
                this.playerDeckViews[
                    Object.keys(this.playerDeckViews)[this.playerIdTurn]
                ],
                2);
        }
    }
    playerPass(playerId) {
        if (playerId == this.playerIdTurn) {
            this.nextTurn();
        }
    }
    npTurn() {
        var result = crng() * 30;
        if (result < 15) {  }
    }
    nextTurn() {
        var result = this.checkWinner();
        if (result === undefined) {
            if (this.playerIdTurn < Object.keys(playerDeckViews).length) {
                this.playerIdTurn += 1;
                if (playerIdTurn == 1) {
                    this.npTurn();    
                }
            } else {
                this.playerIdTurn = 0;
            }
        } else {
            if (result.message === undefined) {
                alert(`${result.name} wins with a score of ${result.score}`);
            } else {
                alert(`${result.message}`);
            }
            onGameOver();
        }
    }
    onGameOver() {
        this.gameOver = true;
        takeButton.disabled = true;
        passButton.disabled = true;
    }
    checkWinner() {
        var playerScores = new Array(Object.keys(this.playerCards).length);
        var oppScore = 0;
        var highScore = 0;
        var topScoreSets = [];
        Object.keys(this.playerCards).forEach((k,i) => {
            playerScores[i] = [0,0];
            playerScores[i][0] = k;
            this.playerCards[k].forEach(e => {
                playerScores[i][1] += e.scoreValue();
            });
        });
        var topScores = playerScores.sort((a,b)=> a[1]<b[1]);
        console.log(topScores);
        for (var i=0; i < topScores.length; i++) {
            if (i < topScores.length - 1) {
                if (topScores[i][1] == topScores[i+1][1]) {
                    return {message:`It's a draw between ${topScores[i][0]} and ${topScores[i+1][0]}`};
                }
            }
            if (topScores[i][1] <= 21) {
                return {name:topScores[i][0],score:topScores[i][1]};
            }
        }
    }
}
function crng() {
    var tempArray = new Uint32Array(52);
    self.crypto.getRandomValues(tempArray);
    return tempArray[Math.floor(Math.random() * tempArray.length)] / 0xffffffff;
}
function randomCard() {
    var currentCard = new Card(Math.floor(crng() * Card.NUM_CARD_NAMES), 
        Math.floor(crng() * Card.NUM_CARD_SUITS));
    return currentCard;
}
function dealCards(deckView, numCards) {
    deckView.clearCards();
    var cards = [];
    var currentCard = undefined;
    for (var i = 0; i < numCards; ++i) {
        do {
            currentCard = randomCard();
        } while (cards.indexOf(currentCard) != -1)
        cards.push(currentCard);
        deckView.addCard(currentCard);
    }
}
document.onreadystatechange = () => {
    gameState = new GameState();
    var player1Name = "Player1";
    var houseName = "House"
    playerDeckView = new CardDeckView("#playerDeck", gameState, "Player1");
    opponentDeckView = new CardDeckView("#opponentDeck", gameState, "House");
    gameState.playerDeckViews[player1Name] = playerDeckView;
    gameState.playerDeckViews[houseName] = opponentDeckView;
    newGameButton = $("#newGameButton");
    newGameButton.addEventListener("click", e => {
        gameState.startNewGame();
    });
    takeButton = $("#takeButton");
    takeButton.addEventListener("click", e => {
        gameState.playerTakeCards(0);
        gameState.nextTurn();
    });
    passButton = $("#passButton");    
    passButton.addEventListener("click", e => {
        gameState.playerPass(0);
    });
    gameStatusText = $("#gameStatusText");
    gameState.onGameOver();
}