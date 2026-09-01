import { prisma } from "@/lib/prisma";
import { ToggleButton } from "@/components/admin/ToggleButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { togglePartnerPriority, deletePartner } from "@/lib/admin-actions";

export default async function AdminServicesPage() {
  const partners = await prisma.servicePartner.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });

  return (
    <div className="card">
      <div className="panel-head">
        <h3>Service partners ({partners.length})</h3>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Partner</th>
              <th>Priority</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id}>
                <td>{p.category}</td>
                <td>{p.name}</td>
                <td>
                  <ToggleButton action={togglePartnerPriority} id={p.id} on={p.isPriority} onLabel="Priority" offLabel="Standard" />
                </td>
                <td>
                  <DeleteButton action={deletePartner} id={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
