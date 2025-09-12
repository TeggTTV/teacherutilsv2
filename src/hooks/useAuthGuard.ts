import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { getApiUrl } from '@/lib/config';
import { useRouter } from 'next/navigation';

export function useAuthGuard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(getApiUrl('/api/users/me'), {
                    credentials: 'include',
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const updateUserData = (newData: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...newData });
        }
    };

    return { 
        user, 
        loading,
        updateUserData
    };
}
