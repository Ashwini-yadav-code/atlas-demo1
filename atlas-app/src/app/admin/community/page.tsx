import { prisma } from "@/lib/prisma";
import { ToggleButton } from "@/components/admin/ToggleButton";
import { toggleContentStatus } from "@/lib/admin-actions";

export default async function AdminCommunityPage() {
  const items = await prisma.communityContent.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="card">
      <div className="panel-head">
        <h3>Community content ({items.length})</h3>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Title</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.type}</td>
                <td>{item.title}</td>
                <td>
                  <ToggleButton action={toggleContentStatus} id={item.id} on={item.status === "PUBLISHED"} onLabel="Published" offLabel="Draft" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
