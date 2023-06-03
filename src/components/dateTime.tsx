import React, { useState, useEffect } from 'react';

function DateTime() {
  const [date, setDate] = useState(new Date());
  const fecha = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
  const hora = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  useEffect(() => {
    const intervalID = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(intervalID);
  }, []);
  const formatoHora = `${hora} `;

  return (
    <p className='font-bold whitespace-nowrap' style={{ filter: "drop-shadow(0px 0px 1px black)" }}>{formatoHora}</p>
  );
}

export default DateTime;
