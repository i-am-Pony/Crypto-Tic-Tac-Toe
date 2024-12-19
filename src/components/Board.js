import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'; 
import Square from './Square';
import { CircularProgress } from '@mui/material'; // For loading indicator

function Board({ 
  xIsNext, 
  squares, 
  onPlay, 
  web3, 
  contract, 
  playerAddress 
}) {
  const [gameID, setGameID] = useState(null);
  const [localSquares, setLocalSquares] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [estimatedGas, setEstimatedGas] = useState(null); 

  useEffect(() => {
    const initGame = async () => {
      setIsLoading(true); 
      try {
        const newGameID = await contract.methods.createGame().send({ from: playerAddress }); 
        setGameID(newGameID); 

        const updateGameState = async () => { 
          try {
            const boardData = await contract.methods.getBoard(newGameID).call(); 
            const currentPlayerData = await contract.methods.getCurrentPlayer(newGameID).call(); 
            const winnerData = await contract.methods.getWinner(newGameID).call(); 

            setLocalSquares(boardData.map(player => player === 0 ? 'X' : player === 1 ? 'O' : null)); 
            setCurrentPlayer(currentPlayerData); 
            setWinner(winnerData === 0 ? 'X' : winnerData === 1 ? 'O' : winnerData === 2 ? 'Draw' : null); 
          } catch (error) {
            console.error("Error fetching game state:", error);
          }
        };
        // Call updateGameState only after newGameID is set
        updateGameState(); 
      } catch (error) {
        console.error("Error creating game:", error);
      } finally {
        setIsLoading(false); 
      }
    };

    if (contract && !gameID) {
      initGame();
    }
  }, [contract, playerAddress]); 

  useEffect(() => {
    const updateGameStateAfterMove = async () => {
      try {
        const boardData = await contract.methods.getBoard(gameID).call(); 
        const currentPlayerData = await contract.methods.getCurrentPlayer(gameID).call(); 
        const winnerData = await contract.methods.getWinner(gameID).call(); 

        setLocalSquares(boardData.map(player => player === 0 ? 'X' : player === 1 ? 'O' : null)); 
        setCurrentPlayer(currentPlayerData); 
        setWinner(winnerData === 0 ? 'X' : winnerData === 1 ? 'O' : winnerData === 2 ? 'Draw' : null); 
      } catch (error) {
        console.error("Error updating game state:", error);
      }
    };

    if (gameID) { 
      updateGameStateAfterMove();
    }
  }, [squares, gameID]); 

  function handleClick(i) {
    if (winner || localSquares[i] || currentPlayer !== (xIsNext ? 0 : 1)) { 
      return; 
    }

    setIsLoading(true); 

    contract.methods.makeMove(gameID, i)
      .estimateGas({ from: playerAddress })
      .then(gasEstimate => {
        setEstimatedGas(web3.utils.fromWei(gasEstimate.toString(), 'gwei')); 
      })
      .then(() => {
        contract.methods.makeMove(gameID, i) 
          .send({ from: playerAddress }) 
          .on('transactionHash', (hash) => {
            console.log('Transaction Hash:', hash);
          })
          .on('receipt', (receipt) => {
            console.log('Transaction Receipt:', receipt);
            const nextSquares = localSquares.slice(); 
            if (xIsNext) {
              nextSquares[i] = 'X'; 
            } else {
              nextSquares[i] = 'O';
            }
            onPlay(nextSquares); 
            setIsLoading(false); 
          })
          .on('error', (error) => {
            console.error('Transaction Error:', error);
            setIsLoading(false); 
          }); 
      })
      .catch(error => {
        console.error('Error estimating gas:', error);
        setIsLoading(false); 
      });
  }

  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <>
      {isLoading && <CircularProgress />} 
      {estimatedGas && <div>Estimated Gas Cost: {estimatedGas} gwei</div>} 
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

Board.propTypes = {
  xIsNext: PropTypes.bool.isRequired,
  squares: PropTypes.array.isRequired,
  onPlay: PropTypes.func.isRequired,
  web3: PropTypes.object.isRequired,
  contract: PropTypes.shape({
    methods: PropTypes.shape({
      createGame: PropTypes.func.isRequired,
      getBoard: PropTypes.func.isRequired,
      makeMove: PropTypes.func.isRequired,
      getCurrentPlayer: PropTypes.func.isRequired,
      getWinner: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  playerAddress: PropTypes.string.isRequired,
};

export default Board;