// Template HTML pour une carte
const cardTemplate = `
<div class="card-content">
    <div class="game-card__main">
        <div class="game-card__image">
            <!-- Placeholder for game image -->
            <div class="placeholder-image"></div>
        </div>
        
        <div class="game-card__info">
            <div class="game-id">GAME ID #<span class="game-id__value"></span></div>
            <div class="game-title"></div>
            
            <div class="jackpot-section">
                <div class="jackpot-label">Current Jackpot</div>
                <div class="jackpot-value"></div>
                <div class="jackpot-usd"></div>
            </div>
            
            <div class="game-stats">
                <div class="clicks">
                    Clicks : <span class="clicks-value"></span>
                </div>
                <div class="timer">
                    Finish in : <span class="timer-value"></span>
                </div>
            </div>
        </div>
    </div>

    <div class="game-card__footer">
        <button class="bet-button">
            MAKE A BET
            <span class="bet-amount"></span>
        </button>
    </div>
</div>
`;

// Styles for cards
const cardStyles = `
.cards-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    align-items: center;
}

.card {
    position: relative;
    display: inline-block;
    cursor: pointer;
    outline: none;
    border: 0;
    vertical-align: middle;
    text-decoration: none;
    font-family: inherit;
    font-size: 15px;
    width: 100%;
    max-width: 600px;
    height: 316px;
    font-weight: 600;
    color:rgb(48, 48, 48);
    padding: 1.25em 2em;
    background:rgb(226, 226, 226);
    border: 2px solid rgb(173, 173, 173);
    border-radius: 3rem;
    transform-style: preserve-3d;
    transition: transform 150ms cubic-bezier(0, 0, 0.58, 1),
                background 150ms cubic-bezier(0, 0, 0.58, 1);
}

.card::before {
    position: absolute;
    content: '';
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:rgb(236, 236, 236);
    border-radius: inherit;
    box-shadow: 0 0 0 2px rgb(151, 151, 151), 0 0.625em 0 0 rgb(228, 228, 228);
    transform: translate3d(0, 0.75em, -1em);
    transition: transform 150ms cubic-bezier(0, 0, 0.58, 1),
                box-shadow 150ms cubic-bezier(0, 0, 0.58, 1);
}

.card-content {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.game-card__main {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 1rem;
    margin-bottom: 0.7rem;
}

.game-card__image {
    width: 100%;
    aspect-ratio: 1;
    background: #888;
    border-radius: 1rem;
}

.game-card__info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.game-id {
    color: #666;
    font-size: 0.6rem;
    font-family: 'Jura', sans-serif;
    margin-bottom: -10px;
}

.game-title {
    font-size: 1rem;
    font-weight: 900;
    color: #333;
    font-family: 'Jura', sans-serif;
}

.jackpot-section {
    margin-bottom: 1rem;
}

.jackpot-label {
    font-size: 1rem;
    color: #333;
    font-family: 'Jura', sans-serif;
}

.jackpot-value {
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: 1px;
    font-family: 'Jura', sans-serif;
}

.jackpot-usd {
    color: #666;
    font-size: 1rem;
    font-family: 'Inter', sans-serif;
}

.game-stats {
    display: flex;
    gap: 2rem;
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
}

.game-card__footer {
    margin-top: auto;
}

.bet-button {
    position: relative;
    width: 100%;
    background:rgb(140, 223, 108);
    border: 2px solid rgb(83, 129, 65);
    border-radius: 17px;
    padding: 8px;
    color: #333;
    font-family: 'Inter', sans-serif;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform-style: preserve-3d;
    transform: translateZ(0);
    outline: none;
    text-decoration: none;
    vertical-align: middle;
}

.bet-button::before {
    position: absolute;
    content: '';
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgb(110, 158, 91);
    border-radius: inherit;
    box-shadow: 0 0 0 2px rgb(83, 129, 65);
    transform: translate3d(0, 0.75em, -1em);
    transition: transform 150ms cubic-bezier(0, 0, 0.58, 1),
                box-shadow 150ms cubic-bezier(0, 0, 0.58, 1);
}

.bet-button:hover {
    background: rgb(110, 158, 91);
    transform: translate(0, 0.25em);
}

.bet-button:hover::before {
    transform: translate3d(0, 0.5em, -1em);
}

.bet-amount {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: #333;
    font-family: 'Jura', sans-serif;
    position: relative;
    z-index: 1;
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Jura:wght@400;500;600;700&display=swap');
`;

module.exports = {
    cardTemplate,
    cardStyles
};