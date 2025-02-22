const { cardTemplate, cardStyles } = require('./rendercards');
const GameCardModel = require('./modelcards');
const fs = require('fs');
const path = require('path');

class CardService {
    constructor() {
        this.cards = [];
        this.gameModel = new GameCardModel();
        this.logStream = fs.createWriteStream(path.join(__dirname, 'passenger.log'), { flags: 'a' });
    }

    // Initialization of cards with real game data
    async initializeCards() {
        try {
            const cards = [];
            
            // Get active game first
            const activeGame = await this.gameModel.getActiveGame();
            if (activeGame) {
                console.log('Active game found:', activeGame);
                
                // Check if the active game should be finished
                const lastClickTime = new Date(activeGame.gameSpecific.lastClick).getTime();
                const currentTime = new Date().getTime();
                const elapsedSeconds = Math.floor((currentTime - lastClickTime) / 1000);
                const maxTime = activeGame.gameSpecific.timeRemaining; // max_time from DB
                
                if (elapsedSeconds >= maxTime) {
                    console.log(`Game ${activeGame.id} has expired. Last click was ${elapsedSeconds}s ago. Max time: ${maxTime}s`);
                    // Mark the game as finished
                    await this.gameModel.finishGame(activeGame.id);
                    // Get the new active game if there is one
                    const newActiveGame = await this.gameModel.getActiveGame();
                    if (newActiveGame) {
                        cards.push(newActiveGame);
                    }
                } else {
                    // The game is still active
                    // Update the time remaining
                    activeGame.gameSpecific.timeRemaining = maxTime - elapsedSeconds;
                    cards.push(activeGame);
                }
            }

            // Get game history
            const gameHistory = await this.gameModel.getGameHistory(4);
            if (gameHistory && gameHistory.length > 0) {
                console.log('Game history found:', gameHistory);
                cards.push(...gameHistory);
            }

            console.log('Final cards array:', cards);
            return cards;
        } catch (error) {
            const errorMessage = `[${new Date().toISOString()}] Error initializing cards: ${error.stack}\n`;
            this.logStream.write(errorMessage);
            console.error(errorMessage);
            throw error;
        }
    }

    // Get all cards with template and styles for frontend
    async getAllCards() {
        try {
            console.log('Starting getAllCards...');
            
            // Get the cards
            const cards = await this.initializeCards();
            console.log('Cards received from initializeCards:', cards);

            // Build the response with an explicit structure
            const responseData = {
                cards: cards || [], // Ensure we always have an array
                template: cardTemplate,
                styles: cardStyles
            };

            // Log for verification
            console.log('Response data before sending:', {
                cardsCount: responseData.cards.length,
                hasTemplate: !!responseData.template,
                hasStyles: !!responseData.styles
            });

            return {
                status: 'success',
                data: responseData
            };
        } catch (error) {
            console.error('Error in getAllCards:', error);
            return {
                status: 'error',
                data: {
                    cards: [],
                    template: cardTemplate,
                    styles: cardStyles
                },
                message: error.message
            };
        }
    }

    // Handle game click
    async handleGameClick(gameId) {
        try {
            const updatedGame = await this.gameModel.updateGameClick(gameId);
            if (updatedGame) {
                // Update the card in memory
                const index = this.cards.findIndex(card => card.id === gameId);
                if (index !== -1) {
                    this.cards[index] = updatedGame;
                }
            }
            return updatedGame;
        } catch (error) {
            const errorMessage = `[${new Date().toISOString()}] Error handling game click: ${error.stack}\n`;
            this.logStream.write(errorMessage);
            console.error(errorMessage);
            throw error;
        }
    }

    // Get a card by its ID
    getCardById(id) {
        return this.cards.find(card => card.id === id);
    }

    displayCard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        container.appendChild(cardElement);
        
        return cardElement;
    }
}

module.exports = CardService;
