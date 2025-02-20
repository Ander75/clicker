// Template HTML pour une carte
const cardTemplate = `
<div class="card-content">
    <div class="card-header">
        <span class="card-id"></span>
        <span class="card-type"></span>
    </div>
    <div class="card-body">
        <span class="card-value"></span>
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
    height: 254px;
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
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.card-body {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
}
`;

module.exports = {
    cardTemplate,
    cardStyles
};