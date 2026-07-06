"use server";

import { revalidatePath } from "next/cache";
import { db } from "./db";

// --- Project thread ---

export async function postMessage(formData: FormData) {
  const projectId = String(formData.get("projectId"));
  const authorId = String(formData.get("authorId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await db.message.create({ data: { projectId, authorId, body } });
  revalidatePath("/admin/projects");
  revalidatePath("/portal");
}

// --- Tasks / requests ---

export async function createTask(formData: FormData) {
  const projectId = String(formData.get("projectId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const dueDateRaw = String(formData.get("dueDate") ?? "");
  await db.task.create({
    data: {
      projectId,
      title,
      details: String(formData.get("details") ?? "") || null,
      assignedTo: String(formData.get("assignedTo") ?? "CLIENT"),
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    },
  });
  revalidatePath("/admin/projects");
  revalidatePath("/portal");
  revalidatePath("/admin");
}

export async function submitTask(formData: FormData) {
  const id = String(formData.get("taskId"));
  await db.task.update({
    data: { status: "SUBMITTED", submissionNote: String(formData.get("submissionNote") ?? "") || null },
    where: { id },
  });
  revalidatePath("/admin/projects");
  revalidatePath("/portal");
  revalidatePath("/admin");
}

export async function reviewTask(formData: FormData) {
  const id = String(formData.get("taskId"));
  const decision = String(formData.get("decision")); // APPROVED | CHANGES_REQUESTED
  await db.task.update({
    data: { status: decision === "APPROVED" ? "APPROVED" : "CHANGES_REQUESTED" },
    where: { id },
  });
  revalidatePath("/admin/projects");
  revalidatePath("/portal");
  revalidatePath("/admin");
}

export async function reopenTask(formData: FormData) {
  const id = String(formData.get("taskId"));
  await db.task.update({ data: { status: "OPEN" }, where: { id } });
  revalidatePath("/admin/projects");
  revalidatePath("/portal");
  revalidatePath("/admin");
}
