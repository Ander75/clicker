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
            this.cards = [];
            
            // Get active game first
            const activeGame = await this.gameModel.getActiveGame();
            if (activeGame) {
                // Calcul du temps restant pour le jeu actif
                const now = new Date();
                const lastClick = new Date(activeGame.gameSpecific.lastClick);
                const timeElapsed = Math.floor((now - lastClick) / 1000);
                const timeRemaining = activeGame.gameSpecific.timeRemaining - timeElapsed;

                // Mise à jour du statut et du temps restant
                activeGame.status = timeRemaining > 0 ? 'active' : 'finished';
                activeGame.gameSpecific.timeRemaining = Math.max(0, timeRemaining);

                console.log('Active game processing:', {
                    id: activeGame.gameSpecific.gameId,
                    timeElapsed: `${timeElapsed} seconds`,
                    timeRemaining: `${timeRemaining} seconds`,
                    status: activeGame.status
                });

                this.cards.push(activeGame);
            }

            // Get game history
            const gameHistory = await this.gameModel.getGameHistory(4);
            if (gameHistory.length > 0) {
                gameHistory.forEach(game => {
                    // Pour les jeux terminés, on garde timeRemaining à 0
                    game.gameSpecific.timeRemaining = 0;
                    game.status = 'finished';
                    
                    console.log('History game processing:', {
                        id: game.gameSpecific.gameId,
                        status: game.status,
                        timeRemaining: game.gameSpecific.timeRemaining
                    });
                });

                // Filtrer les doublons
                const uniqueGames = gameHistory.filter(game => 
                    !this.cards.some(existingGame => existingGame.id === game.id)
                );
                this.cards.push(...uniqueGames);
            }
            
            // Log détaillé de tous les jeux
            console.log('All games status:', this.cards.map(card => ({
                id: card.gameSpecific.gameId,
                status: card.status,
                timeRemaining: card.gameSpecific.timeRemaining
            })));
            
            return this.cards;
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
            await this.initializeCards(); // Ensure we have latest data
            
            // Debug log pour voir ce qu'on a réellement
            console.log('Current cards state:', {
                cardsArray: this.cards,
                length: this.cards.length
            });

            const response = {
                status: 'success',
                data: {
                    cards: this.cards || [], // S'assurer que c'est toujours un tableau
                    template: cardTemplate,
                    styles: cardStyles
                }
            };

            // Log pour vérifier la structure finale
            console.log('Response to frontend:', {
                status: response.status,
                cardsCount: response.data.cards.length,
                hasTemplate: !!response.data.template,
                hasStyles: !!response.data.styles,
                firstCard: response.data.cards[0] || 'no card'
            });

            return response;
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
