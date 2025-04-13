import { useState, useEffect } from "react";
import dutyData from "./data/duty.json";
import teacherData from "./data/teachers.json";
import "./App.scss";
import AbsentTeachers from "./components/absentTeachers";

function DutyScheduler() {
  const [duties, setDuties] = useState(dutyData);
  const [teachers, setTeachers] = useState(teacherData);
  const [selectedDuty, setSelectedDuty] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [availableTeachers, setAvailableTeachers] = useState([]);

  useEffect(() => {
    if (selectedDuty !== null) {
      filterAvailableTeachers(duties[selectedDuty]);
    }
  }, [selectedDuty]);

  useEffect(() => {
    console.log("Duties updated: ", duties);
  }, [duties]);

  useEffect(() => {
    const updatedTeachers = assignDutiesToTeachers(teacherData, dutyData);
    setTeachers(updatedTeachers);
  }, []);

  const handleSelectDuty = (index) => {
    setSelectedDuty(index);
    setSelectedTeacher("");
  };

  const filterAvailableTeachers = (duty) => {
    const available = teachers.filter((teacher) => {
      const fullName = `${teacher.name}`;

      const hasLesson = teacher.lessonsPlan.some(
        (lesson) =>
          lesson.day === duty.day &&
          isOverlapping(lesson.from, lesson.to, duty.hour)
      );

      const hasDuty = teacher.duty.some(
        (d) => d.day === duty.day && d.hour === duty.hour
      );

      const isMarkedName = (name) => name.replaceAll("~~", "");

      const isAlreadyAssigned =
        Array.isArray(duty.teacher) &&
        duty.teacher.some((tName) => isMarkedName(tName) === fullName);

      return (
        !hasLesson && !hasDuty && teacher.isAvailable && !isAlreadyAssigned
      );
    });

    setAvailableTeachers(available);
  };

  function assignDutiesToTeachers(teachers, duties) {
    // Tworzymy nową listę nauczycieli z uzupełnionym polem duty
    return teachers.map((teacher) => {
      // Filtrujemy wszystkie dyżury, które pasują do nauczyciela po nazwisku
      const matchedDuties = duties
        .filter(
          (duty) =>
            Array.isArray(duty.teacher) && duty.teacher.includes(teacher.name)
        )
        .map((duty) => ({
          day: duty.day,
          hour: duty.hour,
          place: duty.place,
        }));

      // Zwracamy nowego nauczyciela z przypisanym polem duty
      return {
        ...teacher,
        duty: matchedDuties,
      };
    });
  }

  const handleAssignTeacher = () => {
    if (selectedDuty !== null && selectedTeacher) {
      const updatedDuties = [...duties];

      if (Array.isArray(updatedDuties[selectedDuty].teacher)) {
        if (!updatedDuties[selectedDuty].teacher.includes(selectedTeacher)) {
          updatedDuties[selectedDuty].teacher.push(selectedTeacher);
        }
      } else if (updatedDuties[selectedDuty].teacher === null) {
        updatedDuties[selectedDuty].teacher = [selectedTeacher];
      } else {
        updatedDuties[selectedDuty].teacher = [selectedTeacher];
      }

      setDuties(updatedDuties);

      const updatedTeachers = teachers.map((teacher) => {
        const fullName = `${teacher.name}`;
        if (fullName === selectedTeacher) {
          return {
            ...teacher,
            duty: [
              ...teacher.duty,
              {
                day: updatedDuties[selectedDuty].day,
                hour: updatedDuties[selectedDuty].hour,
              },
            ],
          };
        }
        return teacher;
      });

      setTeachers(updatedTeachers);
      setSelectedTeacher("");
      setSelectedDuty(null);
    }
  };

  const isOverlapping = (from, to, hour) => {
    const parseTime = (t) => t.split(":").map(Number);
    const [fromH, fromM] = parseTime(from);
    const [toH, toM] = parseTime(to);
    const [hourH, hourM] = parseTime(hour);

    const fromMinutes = fromH * 60 + fromM;
    const toMinutes = toH * 60 + toM;
    const hourMinutes = hourH * 60 + hourM;

    return hourMinutes >= fromMinutes && hourMinutes < toMinutes;
  };

  return (
    <div className="duty-scheduler">
      <h2>Przypisywanie dyżurów</h2>
      <AbsentTeachers
        teachers={teachers}
        setTeachers={setTeachers}
        duties={duties}
        setDuties={setDuties}
      />
      <table>
        <thead>
          <tr>
            <th>Dzień</th>
            <th>Godzina</th>
            <th>Miejsce</th>
            <th>Nauczyciel(e)</th>
            <th>Dyżur</th>
            <th>Zaznacz dyżur</th>
          </tr>
        </thead>
        <tbody>
          {duties.map((duty, index) => (
            <tr key={index} className="duty-row">
              <td>{duty.day}</td>
              <td>{duty.hour}</td>
              <td>{duty.place}</td>
              <td>
                {Array.isArray(duty.teacher)
                  ? duty.teacher.map((t, i) => (
                      <div
                        key={i}
                        style={{
                          textDecoration: t.startsWith("~~")
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {t.replaceAll("~~", "")}
                      </div>
                    ))
                  : duty.teacher}
              </td>
              <td>
                <div className="assign-teacher">
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                  >
                    <option value="">Wybierz nauczyciela</option>
                    {availableTeachers.length === 0 ? (
                      <option value="">Brak dostępnych nauczycieli</option>
                    ) : (
                      availableTeachers.map((teacher) => (
                        <option key={teacher.id} value={`${teacher.name}`}>
                          {teacher.name}
                        </option>
                      ))
                    )}
                  </select>
                  <button
                    className="button secondary"
                    onClick={handleAssignTeacher}
                    disabled={!selectedTeacher}
                  >
                    Przypisz
                  </button>
                </div>
              </td>
              <td>
                <button
                  className="button primary"
                  onClick={() => handleSelectDuty(index)}
                >
                  Wybierz
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DutyScheduler;
