import Web3 from 'web3';

const getWeb3Instance = async () => {
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.enable();
      return web3;
    } catch (error) {
      console.error('Error enabling MetaMask:', error);
      return null;
    }
  } else {
    console.error('Please install MetaMask to play the game.');
    return null;
  }
};

export default getWeb3Instance;