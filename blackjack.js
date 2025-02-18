/*
    Blackjack clone
    Written by Ben Cottrell. AGPLv3.
*/
"use strict";
function $(id) {
    return document.getElementById(id);
}
var playerDeckView = undefined;
var opponentDeckView = undefined;
var gameState = undefined;
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
        return `${this.cardName()}${this.suitName()}${this.colorName()}`;
    }
    constructor(nameId, suitId) {
        this.cardValue = (nameId << 4) | (suitId << 1);
        this.cardValue = this.cardValue | Card.ALLOWED_SUIT_COLORS[this.suitId()];
    }
}
class GameState {
    playerCards = {};
    static checkwinner_call_count = 0;
    checkWinner() {
        GameState.checkwinner_call_count += 1;
        if (this.checkWinner > 1) return;
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
        //console.log(GameState.checkwinner_call_count);
        //console.log("High score: " + playerScores.sort((a,b)=> a[1]<b[1])[0])
        var topScores = playerScores.sort((a,b)=> a[1]<b[1]);
        console.log(topScores);
        for (var i=0; i < topScores.length; i++) {
            if (i < topScores.length - 1) {
                if (topScores[i][1] == topScores[i+1][1]) {
                    console.log(`It's a draw between ${topScores[i][0]} and ${topScores[i+1][0]}`);
                }
            }
            if (topScores[i][1] <= 21) {
                console.log(`${topScores[i][0]} wins: ${topScores[i][1]}`);
                break;
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
function dealCards(deckView) {
    deckView.clearCards();
    var cards = [];
    var currentCard = undefined;
    let DEAL_NUM_CARDS = 3;
    for (var i = 0; i < DEAL_NUM_CARDS; ++i) {
        do {
            currentCard = randomCard();
        } while (cards.indexOf(currentCard) != -1)
        cards.push(currentCard);
        deckView.addCard(currentCard);
    }
}
document.onreadystatechange = () => {
    gameState = new GameState();
    playerDeckView = new CardDeckView("playerDeck", gameState, "Player1");
    opponentDeckView = new CardDeckView("opponentDeck", gameState, "House");
    $("dealButton").addEventListener("click", (e) => {
        dealCards(playerDeckView);
        dealCards(opponentDeckView);
        //gameState.checkWinner();
    });
}