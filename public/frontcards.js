document.addEventListener('DOMContentLoaded', async () => {
    const cardsContainer = document.getElementById('cards-container');
    
    async function fetchCards() {
        try {
            const response = await fetch('/click/api/cards/card', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error when fetching cards:', error);
            throw error;
        }
    }
    
    try {
        const result = await fetchCards();
        
        if (result && result.status === 'success') {
            // Add styles
            const styleElement = document.createElement('style');
            styleElement.textContent = result.data.styles;
            document.head.appendChild(styleElement);

            // Create cards with the template
            result.data.cards.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card';
                
                // Use the template directly
                cardDiv.innerHTML = result.data.template;
                
                // Update card content using the provided function
                updateCardContent(cardDiv, card);
                
                cardsContainer.appendChild(cardDiv);
            });
        }
    } catch (error) {
        console.error('Error when displaying cards:', error);
    }
});
