import React from "react";
import "./../styles/card.css";

const Card = ({ name, certificate }) => {
  return (
    <div className="card">
      <div className="container">
        <h4>
          <b>{name}</b>
        </h4>
        <p>{certificate}</p>
      </div>
    </div>
  );
};

export default Card;
