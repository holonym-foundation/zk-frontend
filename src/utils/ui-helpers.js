import Resolution from '@unstoppabledomains/resolution';

// truncates 0x1234567890 to 0x12...90
export const truncateAddress = (address) => (address && address.length > 8 ? `${address.slice(0, 6)}...${address.slice(-4)}` : null);

/**
 * Reverse resolution for Unstoppable Domains. Returns address' domain.
 */
export async function udReverseResolution(address) {
  const resolution = new Resolution();
  return await resolution.reverse(address);
}
