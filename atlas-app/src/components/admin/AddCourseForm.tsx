"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/lib/admin-actions";

export function AddCourseForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createCourse({
        universityName: String(fd.get("universityName")),
        city: String(fd.get("city")),
        courseName: String(fd.get("courseName")),
        tuitionPerYear: Number(fd.get("tuitionPerYear")),
        applicationDeadline: String(fd.get("applicationDeadline")),
        entryRequirement: String(fd.get("entryRequirement")),
        ieltsRequirement: String(fd.get("ieltsRequirement")),
      });
      formRef.current?.reset();
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form ref={formRef} onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      <input className="field-input" name="universityName" placeholder="University name" required />
      <input className="field-input" name="city" placeholder="City" required />
      <input className="field-input" name="courseName" placeholder="Course name" required defaultValue="MSc Data Science" />
      <input className="field-input" name="tuitionPerYear" type="number" placeholder="Tuition/year (£)" required />
      <input className="field-input" name="applicationDeadline" type="date" required />
      <input className="field-input" name="entryRequirement" placeholder="Entry requirement (e.g. 2:1 Hons)" required />
      <input className="field-input" name="ieltsRequirement" placeholder="IELTS requirement" required />
      <button type="submit" className="btn btn-primary" disabled={isPending}>
        {isPending ? "Adding…" : saved ? "Added ✓" : "Add course"}
      </button>
    </form>
  );
}
