// @path: frontend/src/churn/context/RoleChurnContext.tsx
import { createContext, useState, type PropsWithChildren } from 'react';

export type Role = 'agent' | 'analyst';

// Definir el tipo del contexto correctamente
interface RoleChurnContextType {
  role: Role;
  setRole: (role: Role) => void;
}

// Crear el contexto con un valor inicial undefined o un valor por defecto
export const RoleChurnContext = createContext<RoleChurnContextType | undefined>(
  undefined,
);

export const RoleChurnProvider = ({ children }: PropsWithChildren) => {
  const [role, setRole] = useState<Role>('agent'); // Valor inicial por defecto

  return (
    <RoleChurnContext.Provider value={{ role, setRole }}>
      {children}
    </RoleChurnContext.Provider>
  );
};
