import { useState, useEffect, useRef } from "react";
import dutyData from "../data/duty.json";
import teacherData from "../data/teachers.json";
import "../App.scss";
import AbsentTeachers from "./absentTeachers";
import html2canvas from "html2canvas";
// import DutySummary from "./Summary";

function DutyScheduler() {
  const [duties, setDuties] = useState(dutyData);
  const [teachers, setTeachers] = useState(teacherData);
  const [selectedDuty, setSelectedDuty] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedDay, setSelectedDay] = useState("Poniedziałek");
  const tableRef = useRef(null);

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

      const isSpecialDuty =
        (duty.day === "środa" &&
          duty.hour === "14:20" &&
          duty.place === "Dziedziniec") ||
        duty.place === "Budynek A" ||
        (duty.day === "czwartek" &&
          duty.hour === "14:20" &&
          (duty.place === "Dziedziniec" || duty.place === "Budynek A")) ||
        (duty.day === "Piątek" &&
          duty.hour === "13:20" &&
          (duty.place === "Budynek B parter + WC" ||
            duty.place === "Budynek B 1piętro")) ||
        (duty.day === "Poniedziałek" &&
          duty.hour === "14:20" &&
          (duty.place === "Budynek A" || duty.place === "Budynek A 1piętro"));

      const hasDuty =
        !isSpecialDuty &&
        teacher.duty.some((d) => d.day === duty.day && d.hour === duty.hour);

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
    return teachers.map((teacher) => {
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

      return {
        ...teacher,
        duty: matchedDuties,
      };
    });
  }

  const pairedDuties = (selectedIndex, allDuties) => {
    const current = allDuties[selectedIndex];

    const pairs = [
      {
        day: "wtorek",
        hour: "16:00",
        places: ["Dziedziniec", "Budynek A"],
      },
      {
        day: "wtorek",
        hour: "14:20",
        places: ["Budynek B parter + WC", "Budynek B 1piętro"],
      },
      {
        day: "wtorek",
        hour: "15:10",
        places: ["Budynek B parter + WC", "Budynek B 1piętro"],
      },
      {
        day: "środa",
        hour: "14:20",
        places: ["Dziedziniec", "Budynek A"],
      },
      {
        day: "środa",
        hour: "16:00",
        places: ["Dziedziniec", "Budynek A"],
      },
      {
        day: "czwartek",
        hour: "14:20",
        places: ["Dziedziniec", "Budynek A"],
      },
      {
        day: "czwartek",
        hour: "13:20",
        places: ["Budynek B parter + WC", "Budynek B 1piętro"],
      },
      {
        day: "piątek",
        hour: "13:20",
        places: ["Budynek B parter + WC", "Budynek B 1piętro"],
      },
    ];

    const pair = pairs.find(
      (p) =>
        p.day === current.day &&
        p.hour === current.hour &&
        p.places.includes(current.place)
    );

    if (!pair) return null;

    return allDuties.findIndex(
      (duty, i) =>
        i !== selectedIndex &&
        duty.day === current.day &&
        duty.hour === current.hour &&
        pair.places.includes(duty.place)
    );
  };

  const handleExportToPNG = () => {
    if (tableRef.current) {
      html2canvas(tableRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = "dyzury.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const handleAssignTeacher = () => {
    if (selectedDuty !== null && selectedTeacher) {
      const updateDuties = [...duties];

      const currentDuty = updateDuties[selectedDuty];
      const pairIndex = pairedDuties(selectedDuty, updateDuties);
      const pairDuty = pairIndex !== -1 ? updateDuties[pairIndex] : null;

      const dutiesToUpdate = [currentDuty];
      if (pairDuty) {
        dutiesToUpdate.push(pairDuty);
      }

      const updatedTeachers = teachers.map((teacher) => {
        if (teacher.name === selectedTeacher) {
          const newDuties = dutiesToUpdate.map((duty) => ({
            day: duty.day,
            hour: duty.hour,
            place: duty.place,
          }));

          return {
            ...teacher,
            duty: [...teacher.duty, ...newDuties],
          };
        }
        return teacher;
      });

      dutiesToUpdate.forEach((duty) => {
        const manualName = `[manual] ${selectedTeacher}`;

        if (Array.isArray(duty.teacher)) {
          if (!duty.teacher.includes(manualName)) {
            duty.teacher.push(manualName);
          }
        } else if (duty.teacher === null) {
          duty.teacher = [manualName];
        } else {
          duty.teacher = [manualName];
        }
      });

      setDuties(updateDuties);
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
      <button className="button export" onClick={handleExportToPNG}>
        Zapisz tabelę jako PNG
      </button>
      <div className="day-filter">
        <label>Wybierz dzień:</label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          <option value="Poniedziałek">Poniedziałek</option>
          <option value="Wtorek">Wtorek</option>
          <option value="Środa">Środa</option>
          <option value="Czwartek">Czwartek</option>
          <option value="Piątek">Piątek</option>
        </select>
      </div>
      <table ref={tableRef}>
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
          {duties
            .map((duty, index) => ({ duty, index }))
            .filter(
              ({ duty }) => duty.day.toLowerCase() === selectedDay.toLowerCase()
            )
            .map(({ duty, index }) => (
              <tr
                key={index}
                className={`duty-row ${
                  selectedDuty === index ? "selected-row" : ""
                }`}
              >
                <td>{duty.day}</td>
                <td>{duty.hour}</td>
                <td>{duty.place}</td>
                <td>
                  {Array.isArray(duty.teacher)
                    ? duty.teacher.map((t, i) => {
                        const isAbsent = t.startsWith("~~");
                        const isManual = t.startsWith("[manual]");
                        const cleanName = t
                          .replaceAll("~~", "")
                          .replace("[manual] ", "");

                        return (
                          <div
                            key={i}
                            className={
                              isAbsent
                                ? "absent-teacher"
                                : isManual
                                ? "manual-teacher"
                                : ""
                            }
                            style={{
                              textDecoration: isAbsent
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {cleanName}
                          </div>
                        );
                      })
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
