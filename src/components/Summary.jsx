function DutySummary({ teachers }) {
  const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];

  const countDutiesPerDay = (teacher, day) => {
    return teacher.duty.filter((d) => d.day.toLowerCase() === day.toLowerCase())
      .length;
  };

  return (
    <div className="duty-summary">
      <h3>Podsumowanie dyżurów</h3>
      <table>
        <thead>
          <tr>
            <th>Nauczyciel</th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
            <th>Łącznie</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => {
            const dayCounts = days.map((day) => ({
              day,
              count: countDutiesPerDay(teacher, day),
            }));
            const total = dayCounts.reduce((acc, d) => acc + d.count, 0);
            return (
              <tr key={teacher.id || teacher.name}>
                <td>{teacher.name}</td>
                {dayCounts.map(({ day, count }) => (
                  <td key={day}>{count}</td>
                ))}
                <td>
                  <strong>{total}</strong>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DutySummary;
