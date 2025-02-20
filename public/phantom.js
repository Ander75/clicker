class Phantom {
    constructor() {
        // Check if Phantom is available
        const { phantom } = window;
        
        if (!phantom?.solana?.isPhantom) {
            throw new Error("Phantom wallet is not installed!");
        }

        this.provider = phantom.solana;
        this.checkExistingSession();
    }

    // Verify if a session already exists
    checkExistingSession() {
        const session = localStorage.getItem('wallet_session');
        if (session) {
            const { address, signature } = JSON.parse(session);
            this.walletAddress = address;
            this.signature = signature;
            return true;
        }
        return false;
    }

    async connectWallet() {
        try {
            // 1. Request the connection to the wallet (without automatic connection)
            const response = await this.provider.connect({
                onlyIfTrusted: false  // Force the connection request
            });
            const walletAddress = response.publicKey.toString();
            
            // 2. Create the message to sign
            const message = `Welcome to Blast! Please sign this message to confirm your identity.\n\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;
            const encodedMessage = new TextEncoder().encode(message);

            // 3. Request the signature
            const signedMessage = await this.provider.signMessage(encodedMessage, "utf8");
            
            // 4. Store the session information
            const sessionData = {
                address: walletAddress,
                signature: signedMessage,
                timestamp: Date.now()
            };
            
            // 5. Save the session information in the localStorage
            localStorage.setItem('wallet_session', JSON.stringify(sessionData));
            
            // 6. Update the class state
            this.walletAddress = walletAddress;
            this.signature = signedMessage;
            
            return {
                success: true,
                address: walletAddress,
                signature: signedMessage
            };

        } catch (error) {
            console.error("Error connecting to Phantom wallet:", error);
            throw error;
        }
    }

    // Listen to account changes
    listenToAccountChanges() {
        this.provider.on('accountChanged', (publicKey) => {
            if (publicKey) {
                console.log(`Switched to account ${publicKey.toBase58()}`);
                this.walletAddress = publicKey.toString();
            } else {
                // If no new public key, disconnect
                this.disconnect();
            }
        });
    }

    async disconnect() {
        try {
            await this.provider.disconnect();
            this.walletAddress = null;
            this.signature = null;
            localStorage.removeItem('wallet_session');
            return { success: true };
        } catch (error) {
            console.error("Error disconnecting from Phantom wallet:", error);
            throw error;
        }
    }

    isConnected() {
        return !!this.walletAddress && !!this.signature;
    }

    getWalletAddress() {
        return this.walletAddress;
    }

    getSignature() {
        return this.signature;
    }

    // Get the headers for API requests
    getAuthHeaders() {
        if (!this.isConnected()) {
            return {};
        }
        return {
            'X-Wallet-Address': this.walletAddress,
            'X-Wallet-Signature': this.signature
        };
    }
}

// Initialize Phantom instance globally
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Créer une instance globale de notre classe
        const phantomWallet = new Phantom();
        // Exposer l'instance
        window.phantomWallet = phantomWallet;
    } catch (error) {
        console.error('Failed to initialize Phantom:', error);
    }
});
