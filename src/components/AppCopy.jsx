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
  const [selectedDay, setSelectedDay] = useState("Poniedziałek");
  const [selectedRows, setSelectedRows] = useState([]);
  const tableRef = useRef(null);

  const normalizeTime = (t) => {
    const [h, m] = t.split(":").map(Number);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const dayTranslation = {
    poniedziałek: "monday",
    wtorek: "tuesday",
    środa: "wednesday",
    czwartek: "thursday",
    piątek: "friday",
  };

  // useEffect(() => {
  //   if (selectedDuty !== null) {
  //     filterAvailableTeachers(duties[selectedDuty]);
  //   }
  // }, [selectedDuty, teachers, duties]);

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

  const isTeacherAvailable = (teacher, duty) => {
    const fullName = teacher.name.trim();
    const dutyDay = duty.day.trim().toLowerCase();
    const dutyDayEnglish = dayTranslation[dutyDay] || dutyDay;

    // Sprawdź, czy dyżur jest W PRZEDZIALE dostępności nauczyciela
    const isAvailableAtDutyHour = teacher.lessonsPlan.some((lesson) => {
      const lessonDay = lesson.day.trim().toLowerCase();
      const normalizedLessonDay =
        Object.entries(dayTranslation).find(
          ([pl, en]) => lessonDay === pl || lessonDay === en
        )?.[1] || lessonDay;

      return (
        normalizedLessonDay === dutyDayEnglish &&
        isWithinRange(lesson.from, lesson.to, duty.hour)
      );
    });

    // Sprawdź, czy nauczyciel już ma przypisany dyżur w tym samym dniu i godzinie
    const hasDuty = teacher.duty.some((d) => {
      const dutyEntryDay = d.day.trim().toLowerCase();
      return (
        (dutyEntryDay === dutyDay || dutyEntryDay === dutyDayEnglish) &&
        d.hour === duty.hour
      );
    });

    // Sprawdź, czy nauczyciel jest już przypisany do tego dyżuru (żeby nie dublować)
    const isAlreadyAssigned =
      Array.isArray(duty.teacher) &&
      duty.teacher.some((t) => {
        const normalizedName = t
          .replace("~~", "")
          .replace("[manual] ", "")
          .trim();
        return normalizedName === fullName;
      });

    // W końcu sprawdź flagę dostępności i pozostałe warunki
    return (
      isAvailableAtDutyHour &&
      !hasDuty &&
      teacher.isAvailable &&
      !isAlreadyAssigned
    );
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

  const handleExportSelectedToPNG = () => {
    if (tableRef.current) {
      html2canvas(tableRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = "zmiany_dyzurow.png";
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

  const isWithinRange = (from, to, hour) => {
    const parseTime = (t) => t.split(":").map(Number);
    const [fromH, fromM] = parseTime(from);
    const [toH, toM] = parseTime(to);
    const [hourH, hourM] = parseTime(hour);

    const fromMinutes = fromH * 60 + fromM;
    const toMinutes = toH * 60 + toM;
    const hourMinutes = hourH * 60 + hourM;

    return hourMinutes >= fromMinutes && hourMinutes < toMinutes;
  };

  const handleRemoveTeacher = (dutyIndex, teacherString) => {
    const updatedDuties = [...duties];
    const dutyToUpdate = updatedDuties[dutyIndex];

    if (Array.isArray(dutyToUpdate.teacher)) {
      // Usuwamy nauczyciela z listy nauczycieli przy dyżurze
      dutyToUpdate.teacher = dutyToUpdate.teacher.filter(
        (t) => t !== teacherString
      );

      // Aktualizujemy listę nauczycieli w stanie - usuwamy dyżur z nauczyciela
      const cleanName = teacherString
        .replaceAll("~~", "")
        .replace("[manual] ", "")
        .trim();

      const updatedTeachers = teachers.map((teacher) => {
        if (teacher.name === cleanName) {
          // Usuwamy dyżur z listy dyżurów nauczyciela
          const filteredDuties = teacher.duty.filter(
            (d) =>
              !(
                d.day === dutyToUpdate.day &&
                d.hour === dutyToUpdate.hour &&
                d.place === dutyToUpdate.place
              )
          );
          return { ...teacher, duty: filteredDuties };
        }
        return teacher;
      });

      setDuties(updatedDuties);
      setTeachers(updatedTeachers);
    }
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
      <button
        className="button export"
        onClick={handleExportSelectedToPNG}
        disabled={selectedRows.length === 0}
      >
        Zapisz zaznaczone dyżury jako PNG
      </button>
      <div className="day-filter">
        <label>Wybierz dzień:</label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          <option value="poniedziałek">Poniedziałek</option>
          <option value="wtorek">Wtorek</option>
          <option value="środa">Środa</option>
          <option value="czwartek">Czwartek</option>
          <option value="piątek">Piątek</option>
        </select>
      </div>
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
                            <button
                              className="remove-teacher-btn"
                              onClick={() => handleRemoveTeacher(index, t)}
                              title="Usuń nauczyciela"
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "red",
                                cursor: "pointer",
                                fontWeight: "bold",
                                padding: "0 5px",
                              }}
                            >
                              x
                            </button>
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
                      {selectedDuty === null ? (
                        <option value="">Najpierw wybierz dyżur</option>
                      ) : (
                        teachers
                          .filter((teacher) =>
                            isTeacherAvailable(teacher, duties[selectedDuty])
                          )
                          .map((teacher) => (
                            <option key={teacher.id} value={teacher.name}>
                              {teacher.name}{" "}
                              {teacher.isAvailable === false
                                ? "(NIEOBECNY)"
                                : ""}
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
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(index)}
                    onChange={() => {
                      if (selectedRows.includes(index)) {
                        setSelectedRows(
                          selectedRows.filter((i) => i !== index)
                        );
                      } else {
                        setSelectedRows([...selectedRows, index]);
                      }
                    }}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <table ref={tableRef}>
          <thead>
            <tr>
              <th>Dzień</th>
              <th>Godzina</th>
              <th>Miejsce</th>
              <th>Nauczyciel</th>
            </tr>
          </thead>
          <tbody>
            {duties
              .filter((_, idx) => selectedRows.includes(idx))
              .map((duty, idx) => (
                <tr key={idx}>
                  <td>{duty.day}</td>
                  <td>{duty.hour}</td>
                  <td>{duty.place}</td>
                  <td>
                    {Array.isArray(duty.teacher)
                      ? duty.teacher.map((t, i) => {
                          const cleanName = t
                            .replaceAll("~~", "")
                            .replace("[manual] ", "");
                          return <div key={i}>{cleanName}</div>;
                        })
                      : duty.teacher}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DutyScheduler;
