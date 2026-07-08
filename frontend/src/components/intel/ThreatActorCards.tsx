import React from 'react';
import { Users, Award, ShieldAlert } from 'lucide-react';

interface ThreatActor {
  id: string;
  name: string;
  country: string;
  campaignCount: number;
  malwareCount: number;
  status: 'active' | 'inactive';
}

interface ThreatActorCardsProps {
  actors: ThreatActor[];
}

export const ThreatActorCards: React.FC<ThreatActorCardsProps> = ({ actors }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Threat Actors Profile Catalog">
      {actors.map((actor) => (
        <div
          key={actor.id}
          className="border border-gray-200 dark:border-gray-800 rounded-card p-4 bg-white dark:bg-dark-bg-card shadow-small flex items-start gap-4 hover:border-primary-blue/30 dark:hover:border-primary-sky/30 transition-all"
        >
          <div className="h-10 w-10 shrink-0 rounded-full bg-primary-blue/10 dark:bg-primary-sky/10 text-primary-blue dark:text-primary-sky flex items-center justify-center" aria-hidden="true">
            <Users className="h-5 w-5" />
          </div>

          <div className="space-y-1 min-w-0 flex-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-light-text-primary dark:text-dark-text-primary truncate">
                {actor.name}
              </h3>
              <span className={`inline-flex items-center rounded-badge border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${actor.status === 'active' ? 'bg-severity-critical/10 text-severity-critical border-severity-critical/20' : 'bg-gray-100 text-gray-500'}`}>
                {actor.status}
              </span>
            </div>

            <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted">
              Origin: <strong className="text-light-text-secondary dark:text-dark-text-secondary">{actor.country}</strong>
            </p>

            <div className="flex gap-4 pt-1.5 text-[10px] font-semibold text-light-text-secondary dark:text-dark-text-secondary">
              <span className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-primary-sky" />
                {actor.campaignCount} Campaigns
              </span>
              <span className="flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-severity-medium" />
                {actor.malwareCount} Malware
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThreatActorCards;
