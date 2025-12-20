'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/10"
        >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
        </button>
    );
}
