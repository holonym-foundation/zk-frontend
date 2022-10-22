// truncates 0x1234567890 to 0x12...90
export const truncateAddress = (address) => (address && address.length > 4 ? `${address.slice(0, 4)}...${address.slice(-2)}` : null);
