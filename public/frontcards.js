document.addEventListener('DOMContentLoaded', async () => {
    const cardsContainer = document.getElementById('cards-container');
    let updateTimers = []; // To store update intervals
    
    async function fetchCards() {
        try {
            console.log('Fetching cards...');
            const response = await fetch('/click/api/cards/card', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Raw response from server:', data);
            return data;
        } catch (error) {
            console.error('Error when fetching cards:', error);
            throw error;
        }
    }

    function updateTimeDisplay(cardElement, timeRemaining) {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        cardElement.querySelector('.timer-value').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function startCardTimer(cardElement, cardData) {
        // Clear any existing timer for this card
        if (cardData.timerId) {
            clearInterval(cardData.timerId);
        }

        // Calculate initial time remaining
        let timeRemaining = cardData.gameSpecific.timeRemaining;
        updateTimeDisplay(cardElement, timeRemaining);

        // Start the countdown
        const timerId = setInterval(() => {
            timeRemaining--;
            
            if (timeRemaining <= 0) {
                clearInterval(timerId);
                cardElement.classList.add('finished');
                timeRemaining = 0;
            }
            
            updateTimeDisplay(cardElement, timeRemaining);
        }, 1000);

        // Store the timer ID for cleanup
        updateTimers.push(timerId);
    }

    function updateCardContent(cardElement, cardData) {
        // Update game ID
        cardElement.querySelector('.game-id__value').textContent = cardData.gameSpecific.gameId;
        
        // Update jackpot value (déjà formaté par le back)
        cardElement.querySelector('.jackpot-value').textContent = cardData.value;
        
        // Update clicks
        cardElement.querySelector('.clicks-value').textContent = cardData.gameSpecific.totalClicks;
        
        // Add class for finished games
        if (cardData.status === 'finished') {
            cardElement.classList.add('finished');
            updateTimeDisplay(cardElement, 0);
        } else {
            cardElement.classList.remove('finished');
            startCardTimer(cardElement, cardData);
        }
        
        // Update bet amount (déjà formaté par le back)
        cardElement.querySelector('.bet-amount').textContent = cardData.gameSpecific.betAmount;

        // Debug log
        console.log(`Card ${cardData.gameSpecific.gameId} updated:`, {
            status: cardData.status,
            timeRemaining: cardData.gameSpecific.timeRemaining,
            clicks: cardData.gameSpecific.totalClicks
        });
    }
    
    try {
        // Clear any existing timers before loading new cards
        updateTimers.forEach(timerId => clearInterval(timerId));
        updateTimers = [];

        const result = await fetchCards();
        console.log('Raw API response:', result);
        console.log('Response structure:', {
            hasStatus: 'status' in result,
            hasData: 'data' in result,
            dataKeys: result.data ? Object.keys(result.data) : 'no data',
            cardsLength: result.data?.cards?.length || 0,
            firstCard: result.data?.cards?.[0] || 'no card'
        });
        
        if (result.status === 'success' && result.data?.cards?.length > 0) {
            // Add styles
            const styleElement = document.createElement('style');
            styleElement.textContent = result.data.styles;
            document.head.appendChild(styleElement);

            // Create cards grid container
            const gridDiv = document.createElement('div');
            gridDiv.className = 'cards-grid';
            cardsContainer.appendChild(gridDiv);

            console.log('Processing cards:', result.data.cards.length);
            // Create cards with the template
            result.data.cards.forEach((card, index) => {
                console.log(`Processing card ${index}:`, card);
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card';
                
                // Use the template
                cardDiv.innerHTML = result.data.template;
                
                // Update card content
                updateCardContent(cardDiv, card);
                
                gridDiv.appendChild(cardDiv);
            });
        } else {
            console.log('No cards data received or empty array', result.data);
            cardsContainer.innerHTML = '<div class="info">No active games available.</div>';
        }
    } catch (error) {
        console.error('Error when displaying cards:', error);
        cardsContainer.innerHTML = '<div class="error">Unable to load games. Please try again later.</div>';
    }

    // Cleanup timers when the page is unloaded
    window.addEventListener('beforeunload', () => {
        updateTimers.forEach(timerId => clearInterval(timerId));
    });
});
