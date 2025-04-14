import React, {  useState, createContext, useContext, ReactNode } from 'react';
import { Dialog } from './Dialog.tsx';
import { Button } from './Button.tsx';


type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'success';
};

type ConfirmContextType = {
  confirm: (options?: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within a ConfirmProvider');
  return context.confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<(val: boolean) => void>(() => {});

  const confirm = (opts?: ConfirmOptions): Promise<boolean> => {
    setOptions({
      title: 'Confirm Action',
      description: 'Are you sure you want to proceed?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'primary',
      ...opts
    });
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolver(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolver(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog isOpen={isOpen} onClose={handleCancel} title={options.title}>
        <p className="text-gray-700">{options.description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={handleCancel} variant="outline" size="sm">
            {options.cancelText || 'Cancel'}
          </Button>
          <Button 
            onClick={handleConfirm} 
            variant={options.variant || 'primary'} 
            size="sm"
          >
            {options.confirmText || 'Confirm'}
          </Button>
        </div>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
