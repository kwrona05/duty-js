import { useState } from "react";
import teachersData from "./data/teachers.json";
import dutyData from "./data/duty.json";

const Home = () => {
  const [duty, setDuty] = useState(dutyData);

  const getAvailableTeachers = (day, hour, place) => {
    return teachersData.filter((teacher) => {
      const hasLesson = teacher.lessonsPlan.some(
        (lesson) =>
          lesson.day === day && hour >= lesson.from && hour <= lesson.to
      );

      const isAlreadyAssigned = duty.some(
        (d) =>
          d.teacher?.id === teacher.id &&
          d.day === day &&
          d.hour === hour &&
          d.place === place
      );

      return !hasLesson && !isAlreadyAssigned;
    });
  };

  const assignTeacher = (day, hour, place, teacherId) => {
    const selectedTeacher = teachersData.find(
      (t) => t.id === parseInt(teacherId)
    );

    if (!selectedTeacher) {
      console.error(`Nauczyciel o ID ${teacherId} nie istnieje!`);
      return;
    }

    console.log(
      `Przypisano nauczyciela ${selectedTeacher.name} ${selectedTeacher.surname} do dyżuru: ${day}, ${hour}, ${place}`
    );

    setDuty((prevDuty) =>
      prevDuty.map((dutyItem) =>
        dutyItem.day === day &&
        dutyItem.hour === hour &&
        dutyItem.place === place
          ? { ...dutyItem, teacher: { ...selectedTeacher } }
          : dutyItem
      )
    );
  };

  return (
    <div>
      <h1>Dyzury</h1>

      <table>
        <thead>
          <tr>
            <th>Dzień</th>
            <th>Godzina</th>
            <th>Miejsce</th>
            <th>Dostępni nauczyciele</th>
          </tr>
        </thead>
        <tbody>
          {duty.map((dutyItem, index) => (
            <tr key={index}>
              <td>{dutyItem.day}</td>
              <td>{dutyItem.hour}</td>
              <td>{dutyItem.place}</td>
              <td>
                <select
                  onChange={(e) => {
                    const selectedTeacherId = e.target.value;
                    assignTeacher(
                      dutyItem.day,
                      dutyItem.hour,
                      dutyItem.place,
                      selectedTeacherId
                    );
                  }}
                  value={dutyItem?.teacher?.id?.toString() ?? ""} // Poprawione
                >
                  <option value="" disabled>
                    Wybierz nauczyciela
                  </option>
                  {getAvailableTeachers(
                    dutyItem.day,
                    dutyItem.hour,
                    dutyItem.place
                  ).map((teacher) => (
                    <option
                      key={teacher.id}
                      value={teacher.id.toString()} // Konwersja na string
                    >
                      {teacher.name} {teacher.surname}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
