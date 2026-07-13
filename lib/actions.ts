"use server";

import { revalidatePath } from "next/cache";
import { db } from "./db";
import { notify, projectParties } from "./notify";

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath("/portal");
}

// --- Project thread ---

export async function postMessage(formData: FormData) {
  const projectId = String(formData.get("projectId"));
  const authorId = String(formData.get("authorId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const msg = await db.message.create({ data: { projectId, authorId, body }, include: { author: true } });

  const parties = await projectParties(projectId);
  if (parties) {
    const recipients = [parties.adminId, parties.clientUserId].filter((id) => id !== authorId);
    await notify(recipients, (userId) => ({
      title: `💬 ${msg.author.name} on ${parties.project.title}`,
      body: body.length > 90 ? `${body.slice(0, 90)}…` : body,
      href: parties.hrefFor(userId),
    }));
  }
  revalidateAll();
}

// --- Tasks / requests ---

export async function createTask(formData: FormData) {
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

  // tasks are created from Mission Control, so only the client needs a heads-up
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
  const task = await db.task.update({
    data: { status: "SUBMITTED", submissionNote: String(formData.get("submissionNote") ?? "") || null },
    where: { id },
  });

  // the assignee submitted — tell the other side it's ready to review
  const parties = await projectParties(task.projectId);
  if (parties) {
    const reviewer = task.assignedTo === "CLIENT" ? parties.adminId : parties.clientUserId;
    await notify([reviewer], (userId) => ({
      title: `📥 Ready for review: ${task.title}`,
      body: `On ${parties.project.title} — approve it or request changes.`,
      href: parties.hrefFor(userId),
    }));
  }
  revalidateAll();
}

export async function reviewTask(formData: FormData) {
  const id = String(formData.get("taskId"));
  const decision = String(formData.get("decision")); // APPROVED | CHANGES_REQUESTED
  const approved = decision === "APPROVED";
  const task = await db.task.update({
    data: { status: approved ? "APPROVED" : "CHANGES_REQUESTED" },
    where: { id },
  });

  // tell the assignee the verdict
  const parties = await projectParties(task.projectId);
  if (parties) {
    const assignee = task.assignedTo === "CLIENT" ? parties.clientUserId : parties.adminId;
    await notify([assignee], (userId) => ({
      title: approved ? `✅ Approved: ${task.title}` : `🔁 Changes requested: ${task.title}`,
      body: `On ${parties.project.title}`,
      href: parties.hrefFor(userId),
    }));
  }
  revalidateAll();
}

export async function reopenTask(formData: FormData) {
  const id = String(formData.get("taskId"));
  await db.task.update({ data: { status: "OPEN" }, where: { id } });
  revalidateAll();
}

// --- Project content progress ---

export async function toggleItemComplete(formData: FormData) {
  const id = String(formData.get("itemId"));
  const item = await db.projectItem.findUnique({ where: { id } });
  if (!item) return;
  await db.projectItem.update({
    data: { completedAt: item.completedAt ? null : new Date() },
    where: { id },
  });
  revalidateAll();
}

// --- Notifications ---

export async function markNotificationsRead(formData: FormData) {
  const userId = String(formData.get("userId"));
  await db.notification.updateMany({
    data: { readAt: new Date() },
    where: { userId, readAt: null },
  });
  revalidateAll();
}
