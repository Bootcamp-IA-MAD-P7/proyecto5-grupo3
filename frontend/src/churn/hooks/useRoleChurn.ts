// @path: frontend/src/churn/hooks/useRoleChurn.ts
import { useContext } from 'react';
import { RoleChurnContext } from '../context/RoleChurnContext';

export const useRoleChurn = () => {
    const context = useContext(RoleChurnContext);
    if (context === undefined) {
        throw new Error('useRoleChurn must be used within a RoleChurnProvider');
    }
    return context;
};