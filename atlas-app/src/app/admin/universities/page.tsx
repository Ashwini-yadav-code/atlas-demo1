import { prisma } from "@/lib/prisma";
import { AddCourseForm } from "@/components/admin/AddCourseForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteCourse } from "@/lib/admin-actions";

export default async function AdminUniversitiesPage() {
  const courses = await prisma.course.findMany({ include: { university: true }, orderBy: { createdAt: "desc" } });

  return (
    <>
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="panel-head">
          <h3>Add a course</h3>
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          <AddCourseForm />
        </div>
      </div>

      <div className="card">
        <div className="panel-head">
          <h3>Catalogue ({courses.length})</h3>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>University</th>
                <th>Course</th>
                <th>Tuition/yr</th>
                <th>Deadline</th>
                <th>Entry</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.university.name}</td>
                  <td>{c.name}</td>
                  <td>£{c.tuitionPerYear.toLocaleString()}</td>
                  <td>{c.applicationDeadline.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td>{c.entryRequirement}</td>
                  <td>
                    <DeleteButton action={deleteCourse} id={c.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
