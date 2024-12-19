import React from 'react';
import PropTypes from 'prop-types';

const Square = (props) => {
  return (
    <button onClick={() => props.onSquareClick(props.value)}>
      {props.value}
    </button>
  );
};

Square.propTypes = {
  value: PropTypes.string.isRequired,
  onSquareClick: PropTypes.func.isRequired,
};

export default Square;