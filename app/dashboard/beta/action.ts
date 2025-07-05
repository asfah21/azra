'use server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = (formData.get('role') as string) || 'mekanik';

  const hashedPassword = await bcrypt.hash(password || 'default123', 10);

  await prisma.user.create({ 
    data: { 
      name, 
      email,
      password: hashedPassword,
      role: role as any
    } 
  });

  // Revalidate untuk memastikan data ter-update
  revalidatePath('/dashboard/beta');
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
  
  // Revalidate untuk memastikan data ter-update
  revalidatePath('/dashboard/beta');
}
