import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function withAuth<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
    const Wrapped: React.FC<P> = (props) => {
        const router = useRouter();
        useEffect(() => {
            const user = typeof window !== 'undefined' ? localStorage.getItem('gt_user') : null;
            if (!user) {
                router.replace('/login');
            }
        }, [router]);
        return <Component {...props} />;
    };

    Wrapped.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

    return Wrapped;
}
