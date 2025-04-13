import { useState } from "react";
import Duties from "../data/duty.json";
import "./absentTeachers.scss";

function AbsentTeachers({ teachers, setTeachers, duties, setDuties }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dutyData, setDutyData] = useState(Duties);

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const toggleAbsent = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return;

    const isNowAvailable = !teacher.isAvailable;
    const fullName = `${teacher.name} ${teacher.surname}`;
    const markedName = `~~${fullName}~~`;

    const updatedTeachers = teachers.map((t) =>
      t.id === teacherId ? { ...t, isAvailable: isNowAvailable } : t
    );

    const updatedDuties = duties.map((duty) => {
      if (!Array.isArray(duty.teacher)) return duty;

      const newTeacherList = duty.teacher.map((tName) => {
        if (isNowAvailable) {
          // Odznaczamy nieobecność
          return tName === markedName ? fullName : tName;
        } else {
          // Zaznaczamy jako nieobecnego
          return tName === fullName ? markedName : tName;
        }
      });

      return {
        ...duty,
        teacher: newTeacherList,
      };
    });

    setTeachers(updatedTeachers);
    setDuties(updatedDuties);
  };

  return (
    <div className="absent-teachers">
      <button onClick={toggleForm} className="toggle-form-btn">
        {isFormOpen ? "Ukryj formularz" : "Zaznacz nieobecnych nauczycieli"}
      </button>

      {isFormOpen && (
        <div className="form-container">
          <h3>Zaznacz nieobecnych nauczycieli</h3>
          <ul>
            {/* {teachers.map((teacher) => (
              <li key={} className="teacher-item">
                <label>
                  <input
                    type="checkbox"
                    checked={!teacher.isAvailable}
                    onChange={() => toggleAbsent(teacher.id)}
                  />
                  {teacher.name} {teacher.surname}
                </label>
              </li>
            ))} */}
            {Duties.map((duty) => (
              <li key={duty.teacher} className="teacher-item">
                <label>
                  <input
                    type="checkbox"
                    checked={duty.teacher}
                    onChange={() => {
                      toggleAbsent(duty.teacher);
                    }}
                  />
                  {duty.teacher}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AbsentTeachers;
