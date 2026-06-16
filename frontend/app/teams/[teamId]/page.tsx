import teams from "../../data/teams.json";
import TeamSettingsPage from "../../components/TeamsSettingsPage";

type Team = {
  id: string;
  name: string;
  userIds: string[];
  clusterIds: string[];
};

type TeamPageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

export default async function TeamPage({ params }: TeamPageProps) {
  const resolvedParams = await params;
  const teamId = resolvedParams.teamId;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`, {
    cache: "no-store",
  });

  const data = await res.json();

  const teams: Team[] = data.body ?? [];

  const team = teams.find((team) => team.id === teamId);


  return (
    <TeamSettingsPage
      team={team}
      teamId={teamId}
    />
  );
}