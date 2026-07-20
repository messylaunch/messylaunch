"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import { notify, projectParties } from "./notify";
import { getSessionUser } from "./auth";

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath("/portal");
}

// Session user, or bounce to login. Authorization always comes from the
// session — client-supplied ids are never trusted for identity.
async function currentUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

// Is this user a participant of the project (the admin, or the project's client)?
async function requireParticipant(projectId: string) {
  const user = await currentUser();
  const parties = await projectParties(projectId);
  if (!parties) throw new Error("Project not found");
  if (user.id !== parties.adminId && user.id !== parties.clientUserId) redirect("/portal");
  return { user, parties };
}

// --- Project thread ---

export async function postMessage(formData: FormData) {
  const projectId = String(formData.get("projectId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const { user, parties } = await requireParticipant(projectId);

  const msg = await db.message.create({ data: { projectId, authorId: user.id, body }, include: { author: true } });
  const recipients = [parties.adminId, parties.clientUserId].filter((id) => id !== user.id);
  await notify(recipients, (userId) => ({
    title: `💬 ${msg.author.name} on ${parties.project.title}`,
    body: body.length > 90 ? `${body.slice(0, 90)}…` : body,
    href: parties.hrefFor(userId),
  }));
  revalidateAll();
}

// --- Tasks / requests ---

export async function createTask(formData: FormData) {
  const user = await currentUser();
  if (user.role !== "ADMIN") redirect("/portal"); // tasks are created from Mission Control

  const projectId = String(formData.get("projectId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const assignedTo = String(formData.get("assignedTo") ?? "CLIENT");
  const dueDateRaw = String(formData.get("dueDate") ?? "");
  await db.task.create({
    data: {
      projectId,
      title,
      details: String(formData.get("details") ?? "") || null,
      assignedTo,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    },
  });

  if (assignedTo === "CLIENT") {
    const parties = await projectParties(projectId);
    if (parties) {
      await notify([parties.clientUserId], (userId) => ({
        title: `📋 New to-do on ${parties.project.title}`,
        body: title,
        href: parties.hrefFor(userId),
      }));
    }
  }
  revalidateAll();
}

export async function submitTask(formData: FormData) {
  const id = String(formData.get("taskId"));
  const existing = await db.task.findUnique({ where: { id } });
  if (!existing) return;
  const { user, parties } = await requireParticipant(existing.projectId);

  // only the assignee's side can submit
  const assigneeId = existing.assignedTo === "CLIENT" ? parties.clientUserId : parties.adminId;
  if (user.id !== assigneeId) return;

  const task = await db.task.update({
    data: { status: "SUBMITTED", submissionNote: String(formData.get("submissionNote") ?? "") || null },
    where: { id },
  });

  const reviewer = task.assignedTo === "CLIENT" ? parties.adminId : parties.clientUserId;
  await notify([reviewer], (userId) => ({
    title: `📥 Ready for review: ${task.title}`,
    body: `On ${parties.project.title} — approve it or request changes.`,
    href: parties.hrefFor(userId),
  }));
  revalidateAll();
}

export async function reviewTask(formData: FormData) {
  const id = String(formData.get("taskId"));
  const existing = await db.task.findUnique({ where: { id } });
  if (!existing) return;
  const { user, parties } = await requireParticipant(existing.projectId);

  // only the side that ISN'T the assignee reviews
  const reviewerId = existing.assignedTo === "CLIENT" ? parties.adminId : parties.clientUserId;
  if (user.id !== reviewerId) return;

  const decision = String(formData.get("decision"));
  const approved = decision === "APPROVED";
  const task = await db.task.update({
    data: { status: approved ? "APPROVED" : "CHANGES_REQUESTED" },
    where: { id },
  });

  const assignee = task.assignedTo === "CLIENT" ? parties.clientUserId : parties.adminId;
  await notify([assignee], (userId) => ({
    title: approved ? `✅ Approved: ${task.title}` : `🔁 Changes requested: ${task.title}`,
    body: `On ${parties.project.title}`,
    href: parties.hrefFor(userId),
  }));
  revalidateAll();
}

export async function reopenTask(formData: FormData) {
  const id = String(formData.get("taskId"));
  const existing = await db.task.findUnique({ where: { id } });
  if (!existing) return;
  await requireParticipant(existing.projectId);
  await db.task.update({ data: { status: "OPEN" }, where: { id } });
  revalidateAll();
}

// --- Project content progress ---

export async function toggleItemComplete(formData: FormData) {
  const id = String(formData.get("itemId"));
  const item = await db.projectItem.findUnique({ where: { id }, include: { section: true } });
  if (!item) return;
  await requireParticipant(item.section.projectId);
  await db.projectItem.update({
    data: { completedAt: item.completedAt ? null : new Date() },
    where: { id },
  });
  revalidateAll();
}

// --- Leads ---

export async function setLeadStatus(formData: FormData) {
  const user = await currentUser();
  if (user.role !== "ADMIN") redirect("/portal");
  const status = String(formData.get("status"));
  if (!["NEW", "CONTACTED", "CONVERTED", "PASSED"].includes(status)) return;
  await db.lead.update({ data: { status }, where: { id: String(formData.get("leadId")) } });
  revalidatePath("/admin/leads");
}

// --- Notifications ---

export async function markNotificationsRead() {
  const user = await currentUser();
  await db.notification.updateMany({
    data: { readAt: new Date() },
    where: { userId: user.id, readAt: null },
  });
  revalidateAll();
}
