import { useState, useEffect } from "react";
import { useT } from "src/i18n";

function DateTime() {
  const t = useT();
  // La hora arranca vacía: el HTML prerenderizado no debe traer la hora del
  // build. Se completa al montar y se actualiza cada segundo.
  const [date, setDate] = useState<Date | null>(null);
  useEffect(() => {
    setDate(new Date());
    const intervalID = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(intervalID);
  }, []);
  if (!date) return <p className="font-bold whitespace-nowrap" />;
  const hora = `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  const formatoHora = `${hora} `;
  const fechaLarga = date.toLocaleDateString(t("date.localeTag"), {
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
