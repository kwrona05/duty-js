import React, { useState, useEffect } from "react";

import TeachersData from "../data/teachers.json";
import DutyData from "../data/duty.json";

import AbsentTeachers from "./absentTeachers";

const AppTest = () => {
  const [duties, setDuties] = useState(DutyData);
  const [teachers, setTeachers] = useState(TeachersData);
  const [selectedDuty, setSelectedDuty] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [availableTeachers, setAvailableTeachers] = useState([]);

  useEffect(() => {
    if (selectedDuty !== null) {
      filterAvailableTeacher(duties[selectedDuty]);
    }
  }, [selectedDuty]);

  const handleSelectedDuty = (index) => {
    setSelectedDuty(index);
    setSelectedTeacher("");
  };

  const filterAvailableTeacher = (duty) => {
    const available = teachers.filter((teacher) => {
      const hasLesson = teacher.lessonsPlan.some(
        (lesson) =>
          lesson.day === duty.day &&
          isOverlapping(lesson.from, lesson.to, duty.hour)
      );

      const hasDuty = teacher.duty.some(
        (d) => d.day === duty.day && d.hour === duty.hour
      );

      return !hasLesson && !hasDuty && teacher.isAvailable;
    });

    setAvailableTeachers(available);
  };
};

export default AppTest;
