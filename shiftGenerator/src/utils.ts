
function getWeekDay(date: Date): string {
  const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-Feira", "Sexta-feira", "Sabado"];
  return weekdays[date.getDay()];
}

function getMonthName(date: Date): string {
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return months[date.getMonth()];
}

function shuffleCollection<T>(items: T[]): T[] {
  const newArray = [...items];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = temp;
  }
  return newArray;
}

export {
  getWeekDay,
  getMonthName,
  shuffleCollection
}

