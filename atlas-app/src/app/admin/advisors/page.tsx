import { prisma } from "@/lib/prisma";

export default async function AdminAdvisorsPage() {
  const advisors = await prisma.advisor.findMany({
    include: {
      students: { include: { student: { include: { tasks: true } } } },
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {advisors.map((advisor) => (
        <div key={advisor.id} className="card">
          <div className="panel-head">
            <h3>{advisor.name}</h3>
            <span className="panel-note">{advisor.jobTitle}</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Stage</th>
                  <th>Outstanding tasks</th>
                </tr>
              </thead>
              <tbody>
                {advisor.students.map((link) => {
                  const outstanding = link.student.tasks.filter((t) => !t.done).length;
                  return (
                    <tr key={link.id}>
                      <td>{link.student.name ?? link.student.email}</td>
                      <td>{link.student.currentStage.replace("_", " ")}</td>
                      <td>{outstanding}</td>
                    </tr>
                  );
                })}
                {advisor.students.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ color: "var(--ink-soft)" }}>No students assigned yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
