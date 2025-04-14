// import React, { useState } from 'react';
// import { Service, ServiceStatus } from '../../types/service.ts';
// import { useServiceStore } from '../../store/serviceStore.ts';
// import { RadioGroup } from '../ui/RadioGroup.tsx';
// import { Button } from '../ui/Button.tsx';

// interface ServiceStatusUpdateProps {
//   service: Service;
//   onClose: () => void;
//   onUpdate: (id: string, status: ServiceStatus) => Promise<void>;
// }

// export const ServiceStatusUpdate: React.FC<ServiceStatusUpdateProps> = ({ 
//   service, 
//   onClose,
//   onUpdate
// }) => {
//   const [status, setStatus] = useState(service.status);
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     try {
//       await onUpdate(service.id, status);
//       onClose();
//     } catch (error) {
//       console.error('Error updating status:', error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
  
//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="text-center mb-2">
//         <h2 className="text-xl font-semibold text-gray-900">Update Status</h2>
//         <p className="text-sm text-gray-500 mt-1">Select the current status for {service.name}</p>
//       </div>
      
//       <RadioGroup
//         value={status}
//         onChange={(value) => setStatus(value as ServiceStatus)}
//         options={[
//           {
//             value: ServiceStatus.OPERATIONAL,
//             label: 'Operational',
//             description: 'The service is functioning normally.',
//           },
//           {
//             value: ServiceStatus.DEGRADED,
//             label: 'Degraded',
//             description: 'The service is experiencing minor issues.',
//           },
//           {
//             value: ServiceStatus.PARTIAL_OUTAGE,
//             label: 'Partial Outage',
//             description: 'The service is partially unavailable.',
//           },
//           {
//             value: ServiceStatus.MAJOR_OUTAGE,
//             label: 'Major Outage',
//             description: 'The service is completely unavailable.',
//           },
//         ]}
//       />
      
//       <div className="flex justify-end space-x-3 pt-4">
//         <Button 
//           type="button" 
//           variant="secondary"
//           onClick={onClose}
//         >
//           Cancel
//         </Button>
        
//         <Button 
//           type="submit"
//           isLoading={isSubmitting}
//         >
//           Update Status
//         </Button>
//       </div>
//     </form>
//   );
// };