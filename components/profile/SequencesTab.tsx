import React from 'react';
import { Contact, Sequence, SequenceEnrollment } from '../../types';
import { useData } from '../../hooks/useData';
import Spinner from '../ui/Spinner';
import { formatDistanceToNow } from 'date-fns';

interface SequencesTabProps {
  contact: Contact;
}

const SequencesTab: React.FC<SequencesTabProps> = ({ contact }) => {
    const { useSequenceEnrollments, useSequences } = useData();
    const { data: enrollments, isLoading: enrollmentsLoading } = useSequenceEnrollments({ contactId: contact.id });
    const { data: sequences, isLoading: sequencesLoading } = useSequences(contact.organizationId);

    const getSequenceName = (id: string) => {
        return sequences?.find(s => s.id === id)?.name || 'Unknown Sequence';
    };

    const isLoading = enrollmentsLoading || sequencesLoading;
    
    if (isLoading) return <Spinner />;

    return (
        <div className="space-y-4">
            {enrollments?.map(enrollment => (
                <div key={enrollment.id} className="p-4 border border-border-default rounded-lg">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-text-default">{getSequenceName(enrollment.sequenceId)}</h4>
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary`}>
                            {enrollment.status}
                        </span>
                    </div>
                    <div className="text-sm text-text-secondary mt-2 grid grid-cols-3 gap-4">
                       <div>
                           <p className="font-medium">Enrolled</p>
                           <p>{new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                       </div>
                        <div>
                           <p className="font-medium">Current Step</p>
                           <p>{enrollment.currentStep}</p>
                       </div>
                        <div>
                           <p className="font-medium">Next Step</p>
                           <p>{enrollment.nextStepDate ? formatDistanceToNow(new Date(enrollment.nextStepDate), { addSuffix: true }) : 'N/A'}</p>
                       </div>
                    </div>
                </div>
            ))}

            {enrollments?.length === 0 && (
                <p className="text-center text-text-secondary py-8">
                    This contact is not enrolled in any sequences.
                </p>
            )}
        </div>
    );
};

export default SequencesTab;
