import { useEffect } from 'react';
import { useAuthGuard } from './useAuthGuard';

export function useAuthGuardDebug() {
    console.log('[Debug] useAuthGuardDebug initializing');
    
    useEffect(() => {
        console.log('[Debug] useAuthGuardDebug mounted');
        return () => console.log('[Debug] useAuthGuardDebug unmounted');
    }, []);

    const result = useAuthGuard();
    console.log('[Debug] useAuthGuard returned:', result);

    return result;
}
