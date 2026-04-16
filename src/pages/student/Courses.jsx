import React, { useState } from "react";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    code: "",
    title: "",
    unit: "",
    lecturer: "",
    phone: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addCourse = () => {
    if (!form.code || !form.title) return;
    setCourses([...courses, form]);
    setForm({ code: "", title: "", unit: "", lecturer: "", phone: "" });
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ADMIN SIDE */}
      <div className="bg-white shadow-xl rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>

        <input
          name="code"
          placeholder="Course Code"
          value={form.code}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />

        <input
          name="title"
          placeholder="Course Title"
          value={form.title}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />

        <input
          name="unit"
          placeholder="Course Unit"
          value={form.unit}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />

        <input
          name="lecturer"
          placeholder="Lecturer Name"
          value={form.lecturer}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />

        <input
          name="phone"
          placeholder="Lecturer Phone"
          value={form.phone}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />

        <button
          onClick={addCourse}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          Add Course
        </button>
      </div>

      {/* STUDENT SIDE */}
      <div className="bg-white shadow-xl rounded-2xl p-4 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Course List</h2>

        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2 border">S/N</th>
              <th className="p-2 border">Course Code</th>
              <th className="p-2 border">Course Title</th>
              <th className="p-2 border">CU</th>
              <th className="p-2 border">Lecturer</th>
              <th className="p-2 border">Phone</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, index) => (
              <tr key={index} className="text-sm">
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">{c.code}</td>
                <td className="p-2 border">{c.title}</td>
                <td className="p-2 border">{c.unit}</td>
                <td className="p-2 border">{c.lecturer}</td>
                <td className="p-2 border">{c.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
