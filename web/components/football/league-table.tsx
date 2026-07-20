import * as React from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { TeamCrest } from './team-crest';

export interface LeagueStanding {
  rank: number;
  team: {
    id: string;
    name: string;
    crestUrl?: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  status?: 'promotion' | 'relegation' | 'champions-league' | 'europa-league' | 'none';
}

interface LeagueTableProps {
  standings: LeagueStanding[];
  isLoading?: boolean;
}

export function LeagueTable({ standings, isLoading }: LeagueTableProps) {
  const columns: Column<LeagueStanding>[] = [
    {
      key: 'rank',
      header: '#',
      cell: (item) => <span className="text-muted-foreground font-bold">{item.rank}</span>,
      width: '50px',
    },
    {
      key: 'team',
      header: 'Club',
      cell: (item) => (
        <div className="flex items-center gap-3">
          <TeamCrest name={item.team.name} url={item.team.crestUrl} size="sm" />
          <span className="font-semibold">{item.team.name}</span>
        </div>
      ),
    },
    { key: 'played', header: 'MP', cell: (item) => item.played, align: 'center' },
    { key: 'won', header: 'W', cell: (item) => item.won, align: 'center' },
    { key: 'drawn', header: 'D', cell: (item) => item.drawn, align: 'center' },
    { key: 'lost', header: 'L', cell: (item) => item.lost, align: 'center' },
    { key: 'gf', header: 'GF', cell: (item) => item.goalsFor, align: 'center' },
    { key: 'ga', header: 'GA', cell: (item) => item.goalsAgainst, align: 'center' },
    { key: 'gd', header: 'GD', cell: (item) => item.goalDifference, align: 'center' },
    {
      key: 'points',
      header: 'Pts',
      cell: (item) => <span className="font-bold">{item.points}</span>,
      align: 'center',
    },
  ];

  return <DataTable columns={columns} data={standings} isLoading={isLoading} />;
}
