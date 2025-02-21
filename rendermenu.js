class MenuRenderer {
    constructor() {
        // Definition of styles and template in the constructor
        this.menuData = {
            styles: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap');

                .menu-container {
                    width: 100%;
                    max-width: 800px;
                    z-index: 1000;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                .menu-wrapper {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    width: 100%;
                }

                .menu-logo {
                    height: 40px;
                    width: auto;
                }

                .connect-wallet-btn {
                    position: relative;
                    display: inline-block;
                    cursor: pointer;
                    outline: none;
                    border: 0;
                    vertical-align: middle;
                    text-decoration: none;
                    font-family: 'Inter', sans-serif;
                    font-size: 15px;
                    font-weight: 600;
                    margin-top: -10px;
                    color: #382b22;
                    text-transform: uppercase;
                    padding: 1.25em 2em;
                    background: #fff0f0;
                    border: 2px solid #b18597;
                    border-radius: 5rem;
                    transform-style: preserve-3d;
                    transition: transform 150ms cubic-bezier(0, 0, 0.58, 1),
                                background 150ms cubic-bezier(0, 0, 0.58, 1);
                }

                .connect-wallet-btn::before {
                    position: absolute;
                    content: '';
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: #f9c4d2;
                    border-radius: inherit;
                    box-shadow: 0 0 0 2px #b18597, 0 0.625em 0 0 #ffe3e2;
                    transform: translate3d(0, 0.75em, -1em);
                    transition: transform 150ms cubic-bezier(0, 0, 0.58, 1),
                                box-shadow 150ms cubic-bezier(0, 0, 0.58, 1);
                }

                .connect-wallet-btn:hover {
                    background: #ffe9e9;
                    transform: translate(0, 0.25em);
                }

                .connect-wallet-btn:hover::before {
                    box-shadow: 0 0 0 2px #b18597, 0 0.5em 0 0 #ffe3e2;
                    transform: translate3d(0, 0.5em, -1em);
                }

                .connect-wallet-btn:active {
                    background: #ffe9e9;
                    transform: translate(0em, 0.75em);
                }

                .connect-wallet-btn:active::before {
                    box-shadow: 0 0 0 2px #b18597, 0 0 #ffe3e2;
                    transform: translate3d(0, 0, -1em);
                }

                @media (max-width: 768px) {
                    .menu-logo {
                        height: 30px;
                        width: auto;
                    }
                }
            `,
            template: `
                <div class="menu-container">
                    <div class="menu-wrapper">
                        <img src="{{logo}}" alt="Blast Logo" class="menu-logo">
                        <button class="connect-wallet-btn">
                            CONNECT WALLET
                        </button>
                    </div>
                </div>
            `
        };
    }

    getMenuHTML() {
        return this.menuData;
    }
}

module.exports = MenuRenderer;
