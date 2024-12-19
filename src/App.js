import React, { useState, useEffect } from 'react';
import getWeb3Instance from './utils/web3.js';
import TicTacToe from './contracts/TicTacToe.json'; 
import Board from './components/Board'; 
import './App.css'; 

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const currentSquares = history[currentMove];
  const [playerAddress, setPlayerAddress] = useState(null); 

  useEffect(() => {
    const initWeb3 = async () => {
      const web3Instance = await getWeb3Instance();
      if (web3Instance) {
        const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with your deployed contract address
        const abi = TicTacToe.abi; 
        const deployedContract = new web3Instance.eth.Contract(abi, contractAddress);
        setWeb3(web3Instance);
        setContract(deployedContract);

        try {
          const accounts = await web3Instance.eth.getAccounts();
          setPlayerAddress(accounts[0]); 
        } catch (error) {
          console.error("Error getting accounts:", error);
        }
      }
    };
    initWeb3();
  }, []);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setXIsNext(!xIsNext);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    setXIsNext(nextMove % 2 === 0);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}> 
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board 
          xIsNext={xIsNext} 
          squares={currentSquares} 
          onPlay={handlePlay} 
          web3={web3} 
          contract={contract} 
          playerAddress={playerAddress} 
        /> 
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
};

export default App;