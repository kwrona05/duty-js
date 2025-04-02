import { useState } from "react";
import "./absentTeachers.scss";

function AbsentTeachers({ teachers, setTeachers }) {
  const [isFormOpen, setIsFormOpen] = useState(false); // Kontrola rozwinięcia formularza
  const [absentTeachers, setAbsentTeachers] = useState([]);

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const toggleAbsent = (teacherId) => {
    const updatedTeachers = teachers.map((teacher) =>
      teacher.id === teacherId
        ? { ...teacher, isAvailable: !teacher.isAvailable }
        : teacher
    );

    setTeachers(updatedTeachers);
  };

  return (
    <div className="absent-teachers">
      <button onClick={toggleForm} className="toggle-form-btn">
        {isFormOpen ? "Hide Form" : "Mark Absent Teachers"}
      </button>

      {/* Jeśli formularz jest rozwinięty, wyświetl go */}
      {isFormOpen && (
        <div className="form-container">
          <h3>Zaznacz nieobecnych nauczycieli</h3>
          <ul>
            {teachers.map((teacher) => (
              <li key={teacher.id} className="teacher-item">
                <label>
                  <input
                    type="checkbox"
                    checked={!teacher.isAvailable}
                    onChange={() => toggleAbsent(teacher.id)}
                  />
                  {teacher.name} {teacher.surname}
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
