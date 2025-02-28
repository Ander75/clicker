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
            
            // Get active games
            const activeGames = await this.gameModel.getActiveGame();
            if (activeGames && activeGames.length > 0) {
                console.log('Active games found:', activeGames);
                
                // Traiter chaque jeu actif
                for (const activeGame of activeGames) {
                    const lastClickTime = new Date(activeGame.gameSpecific.lastClick).getTime();
                    const currentTime = new Date().getTime();
                    const elapsedSeconds = Math.floor((currentTime - lastClickTime) / 1000);
                    const maxTime = activeGame.gameSpecific.timeRemaining;
                    
                    if (elapsedSeconds >= maxTime) {
                        console.log(`Game ${activeGame.id} has expired. Last click was ${elapsedSeconds}s ago. Max time: ${maxTime}s`);
                        await this.gameModel.finishGame(activeGame.id);
                    } else {
                        activeGame.gameSpecific.timeRemaining = maxTime - elapsedSeconds;
                        cards.push(this.formatGameForDisplay(activeGame));
                    }
                }
            }

            // Get game history
            const gameHistory = await this.gameModel.getGameHistory(4);
            if (gameHistory && gameHistory.length > 0) {
                const formattedHistory = gameHistory.map(game => 
                    this.formatGameForDisplay(game)
                );
                cards.push(...formattedHistory);
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

    // Utility method to format SOL values
    formatSolAmount(value) {
        // Convert to number and limit to 3 decimal places
        const formattedValue = parseFloat(parseFloat(value).toFixed(3));
        
        // If the value is 0, return "0 SOL"
        if (formattedValue === 0) {
            return "0 SOL";
        }
        
        // Convert to string and remove unnecessary zeros after the decimal point
        const valueString = formattedValue.toString();
        
        // If there are no decimal places, return the integer
        if (!valueString.includes('.')) {
            return `${valueString} SOL`;
        }
        
        // Remove trailing zeros
        const trimmedValue = valueString.replace(/\.?0+$/, '');
        
        return `${trimmedValue} SOL`;
    }

    // Format game data for display
    formatGameForDisplay(game) {
        return {
            ...game,
            value: this.formatSolAmount(game.value),
            gameSpecific: {
                ...game.gameSpecific,
                betAmount: this.formatSolAmount(0.001) // Fixed bet amount
            }
        };
    }
}

module.exports = CardService;
