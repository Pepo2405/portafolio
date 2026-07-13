import { useState, useEffect } from "react";

function DateTime() {
  const [date, setDate] = useState(new Date());
  const hora = `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  useEffect(() => {
    const intervalID = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(intervalID);
  }, []);
  const formatoHora = `${hora} `;
  const fechaLarga = date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <p
      title={fechaLarga}
      className="cursor-default font-bold whitespace-nowrap"
      style={{ filter: "drop-shadow(0px 0px 1px black)" }}
    >
      {formatoHora}
    </p>
  );
}

export default DateTime;
