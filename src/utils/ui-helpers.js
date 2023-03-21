// truncates 0x1234567890 to 0x12...90
export const truncateAddress = (address) => (address && address.length > 8 ? `${address.slice(0, 6)}...${address.slice(-4)}` : null);
