class CardService {
    constructor() {
        this.cards = [];
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
