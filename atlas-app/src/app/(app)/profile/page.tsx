import { requireUser } from "@/lib/session";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <div style={{ maxWidth: 760 }}>
      <div className="j-head">
        <div>
          <h1>Profile &amp; settings</h1>
          <p>This is what your quiz shortlist and applications match against — keep it current.</p>
        </div>
      </div>
      <ProfileForm
        user={{
          name: user.name ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
          homeCity: user.homeCity ?? "",
          qualification: user.qualification ?? "",
          percentage: user.percentage ?? "",
          englishTest: user.englishTest ?? "",
          courseInterest: user.courseInterest ?? "",
          budgetRange: user.budgetRange ?? "",
        }}
      />
    </div>
  );
}
