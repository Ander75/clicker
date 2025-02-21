class Phantom {
    constructor() {
        // Check if Phantom is available
        const { phantom } = window;
        
        if (!phantom?.solana?.isPhantom) {
            throw new Error("Phantom wallet is not installed!");
        }

        this.provider = phantom.solana;
        this.setupAccountChangeListener();
        this.checkExistingSession();
    }

    setupAccountChangeListener() {
        this.provider.on('accountChanged', (newPublicKey) => {
            console.log('Account change detected');
            
            if (!this.isConnected()) return;

            // Simply disconnect when any wallet change is detected
            console.log('Wallet changed - disconnecting user');
            this.disconnect();
            
            // Emit a simple disconnection event
            const event = new CustomEvent('walletConnectionChanged', {
                detail: {
                    connected: false,
                    address: null
                }
            });
            window.dispatchEvent(event);
        });
    }

    // Verify if a session already exists
    checkExistingSession() {
        // Vérifier d'abord les cookies
        const sessionCookie = this.getCookie('wallet_session');
        if (sessionCookie) {
            try {
                const { address, signature } = JSON.parse(sessionCookie);
                this.walletAddress = address;
                this.signature = signature;
                return true;
            } catch (error) {
                console.error('Error parsing session cookie:', error);
            }
        }

        // Vérifier ensuite localStorage comme fallback
        const localSession = localStorage.getItem('wallet_session');
        if (localSession) {
            try {
                const { address, signature } = JSON.parse(localSession);
                this.walletAddress = address;
                this.signature = signature;
                // Synchroniser avec les cookies
                this.setCookie('wallet_session', localSession);
                return true;
            } catch (error) {
                console.error('Error parsing local session:', error);
            }
        }

        return false;
    }

    // Helpers for cookies
    setCookie(name, value, days = 7) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "; expires=" + date.toUTCString();
        document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    }

    async connectWallet() {
        try {
            // 1. Request the connection to the wallet
            const response = await this.provider.connect({
                onlyIfTrusted: false
            });
            const walletAddress = response.publicKey.toString();
            
            // 2. Create a clear message for the user to sign
            const message = `Welcome to Blast! Please sign this message to authenticate.\n\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;
            const encodedMessage = new TextEncoder().encode(message);

            // 3. Request the signature using the recommended method
            const signedMessage = await this.provider.request({
                method: "signMessage",
                params: {
                    message: encodedMessage,
                    display: "utf8"
                },
            });
            
            // 4. Store the session information
            const sessionData = {
                address: walletAddress,
                signature: signedMessage.signature,
                timestamp: Date.now()
            };
            
            // 5. Save in localStorage and cookies
            const sessionStr = JSON.stringify(sessionData);
            localStorage.setItem('wallet_session', sessionStr);
            this.setCookie('wallet_session', sessionStr);
            
            // 6. Update class state
            this.walletAddress = walletAddress;
            this.signature = signedMessage.signature;
            
            return {
                success: true,
                address: walletAddress,
                signature: signedMessage.signature
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
            // Clear localStorage and cookies
            localStorage.removeItem('wallet_session');
            document.cookie = 'wallet_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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
        // Create a global instance of our class
        const phantomWallet = new Phantom();
        // Expose the instance
        window.phantomWallet = phantomWallet;
    } catch (error) {
        console.error('Failed to initialize Phantom:', error);
    }
});
