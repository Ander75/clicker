const { cardTemplate, cardStyles } = require('./rendercards');

class CardService {
    constructor() {
        this.cards = [];
        // Initialization with 3 cards by default
        this.initializeCards(3);
    }

    // Initialization of cards at startup
    initializeCards(count) {
        for (let i = 0; i < count; i++) {
            const cardId = this.cards.length + 1;
            const card = {
                id: cardId,
                createdAt: new Date().toISOString(),
                type: 'standard',
                value: Math.floor(Math.random() * 100),
                status: 'active'
            };
            this.cards.push(card);
        }
    }

    // Get all cards with styles
    getAllCards() {
        return {
            cards: this.cards,
            template: cardTemplate,
            styles: cardStyles
        };
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
