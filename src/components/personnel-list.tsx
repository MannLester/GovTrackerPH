import React from 'react';
import { ProjectPersonnel } from '@/models/dim-models/dim-project';

interface PersonnelListProps {
  personnel: ProjectPersonnel[];
}

export function PersonnelList({ personnel }: PersonnelListProps) {
  if (!personnel || personnel.length === 0) {
    return (
      <p className="text-sm text-foreground leading-relaxed">
        No personnel information available
      </p>
    );
  }

  return (
    <ul className="text-sm text-foreground leading-relaxed space-y-1">
      {personnel.map((person) => (
        <li key={person.personnel_id} className="flex items-center">
          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2 flex-shrink-0"></span>
          {person.username}
        </li>
      ))}
    </ul>
  );
}
