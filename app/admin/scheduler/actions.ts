'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createScheduledTask(data: {
    name: string;
    description?: string;
    schedule: string;
    action: string;
}) {
    const task = await prisma.scheduledTask.create({
        data: {
            name: data.name,
            description: data.description,
            schedule: data.schedule,
            action: data.action,
            enabled: true,
        },
    });

    revalidatePath('/admin');
    return task;
}

export async function updateScheduledTask(id: number, data: {
    name?: string;
    description?: string;
    schedule?: string;
    action?: string;
    enabled?: boolean;
}) {
    const task = await prisma.scheduledTask.update({
        where: { id },
        data,
    });

    revalidatePath('/admin');
    return task;
}

export async function toggleScheduledTask(id: number, enabled: boolean) {
    await prisma.scheduledTask.update({
        where: { id },
        data: { enabled },
    });

    revalidatePath('/admin');
}

export async function deleteScheduledTask(id: number) {
    await prisma.scheduledTask.delete({
        where: { id },
    });

    revalidatePath('/admin');
}

export async function runScheduledTask(id: number) {
  const task = await prisma.scheduledTask.findUnique({
    where: { id },
  });

  if (!task) throw new Error('Task not found');

  // Update last run time
  await prisma.scheduledTask.update({
    where: { id },
    data: { lastRun: new Date() },
  });

  // Parse and execute action
  try {
    const action = JSON.parse(task.action);

    // 1) Crear tarea simple
    if (action.type === 'create_task') {
      await prisma.task.create({
        data: {
          title: action.title ?? 'Scheduled Task',
          priority: action.priority ?? 'Medium',
          status: 'Pending',
          dueDate: new Date().toISOString(),
        } as any,
      });

    // 2) Revisar leads viejos
    } else if (action.type === 'check_lead_age') {
      const days = action.days || 7;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const oldLeads = await prisma.deal.findMany({
        where: {
          stage: 'Lead',
          createdAt: { lt: cutoffDate },
        },
        include: { client: true },
      });

      for (const lead of oldLeads) {
        await prisma.task.create({
          data: {
            title: `Follow up with ${lead.client?.name ?? 'lead'}`,
            priority: 'Medium',
            status: 'Pending',
            dueDate: new Date().toISOString(),
            // clientId: lead.clientId,  // (solo si existe en tu modelo)
          } as any,
        });
      }

      console.log(`Checked lead age: Found ${oldLeads.length} old leads.`);

    // 3) Revisar tareas próximas a vencer
    } else if (action.type === 'check_task_due') {
      const hoursBefore = action.hoursBefore || 24;
      const now = new Date();
      const cutoff = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);

      const tasksDueSoon = await prisma.task.findMany({
        where: {
          status: 'Pending',
          dueDate: { lte: cutoff },
        },
      });

      console.log(`Checked task due: Found ${tasksDueSoon.length} tasks due soon.`);
    }

  } catch (error) {
    console.error('Error running scheduled task', error);
  }

  revalidatePath('/admin');
}

            // Add reminder notes
            for (const dueTask of dueTasks) {
                await prisma.note.create({
                    data: {
                        content: `⚠️ Automated Reminder: This task is due in less than ${hoursBefore} hours.`,
                        taskId: dueTask.id,
                        clientId: dueTask.clientId
                    }
                });
            }

            console.log(`Checked task due: Found ${dueTasks.length} tasks due soon.`);
        }

        // Log execution success
        await prisma.automationExecution.create({
            data: {
                // ruleId is optional now
                status: 'Success',
                metadata: JSON.stringify({ taskId: task.id, action: action.type }),
                duration: 0
            }
        });

    } catch (error) {
        console.error('Failed to execute scheduled task:', error);
        // Log failure
        await prisma.automationExecution.create({
            data: {
                status: 'Failed',
                error: String(error),
                metadata: JSON.stringify({ taskId: task.id }),
                duration: 0
            }
        });
    }

    revalidatePath('/admin');
    return { success: true };
}
