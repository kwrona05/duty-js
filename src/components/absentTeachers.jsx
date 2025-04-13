import { useState } from "react";
import "./absentTeachers.scss";

function AbsentTeachers({ teachers, setTeachers, duties, setDuties }) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const toggleAbsent = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return;

    const isNowAvailable = !teacher.isAvailable;
    const fullName = `${teacher.name}`;
    const markedName = `~~${fullName}~~`;

    const updatedTeachers = teachers.map((t) =>
      t.id === teacherId ? { ...t, isAvailable: isNowAvailable } : t
    );

    const updatedDuties = duties.map((duty) => {
      if (!Array.isArray(duty.teacher)) return duty;

      const newTeacherList = [...duty.teacher].map((tName) => {
        if (isNowAvailable) {
          return tName === markedName ? fullName : tName;
        } else {
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
          <ul className="teacher-list">
            {teachers.map((teacher) => (
              <li key={teacher.id} className="teacher-item">
                <label>
                  <input
                    type="checkbox"
                    checked={!teacher.isAvailable}
                    onChange={() => toggleAbsent(teacher.id)}
                  />
                  {teacher.name}
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
