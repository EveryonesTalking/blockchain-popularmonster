export const enableLace = async () => {
    try {
        if (!window.cardano || !window.cardano.lace) {
            throw new Error("Lace Wallet not found. Please install it.");
        }

        const api = await window.cardano.lace.enable();
        return api;
    } catch (err) {
        console.error("Wallet connection failed:", err);
        return null;
    }
};

export const getLaceAddress = async (api) => {
    try {
        const addresses = await api.getUsedAddresses();
        if (addresses.length === 0) return null;

        return addresses[0]; // base address (hex)
    } catch (err) {
        console.error("Error fetching address:", err);
        return null;
    }
};
