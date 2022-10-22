
export const getHoloFromAddress = async (address) => {
  const response = await fetch(`https://sciverse.id/api/getHolo?address=${address}`);
  const holo_ = await response.json();
  return {...holo_, address: address};
};

export const getHoloFromCredentials = async (creds, service) => {
  const response = await fetch(`https://sciverse.id/api/addressForCredentials?credentials=${creds}&service=${service.toLowerCase()}`);
  const address = await response.json();
  return await getHoloFromAddress(address);
};

export const searchHolos = async (searchStr) => {
  const numAllowedAttempts = 3;
  let attemptNum = 0;
  while (attemptNum < numAllowedAttempts) {
    try {
      const resp = await fetch(`https://sciverse.id/api/searchHolos?searchStr=${searchStr}`);
      const holos = await resp.json();
      console.log('holos...')
      console.log(holos)
      return holos;
    } catch (err) {
      attemptNum++;
    }
  }
  console.log(`Failed ${numAllowedAttempts} attempts to fetch search results for search "${searchStr}"`);
};

export const holoIsEmpty = (holo) => {
  return !Object.values(holo)?.some(x=>x)
}