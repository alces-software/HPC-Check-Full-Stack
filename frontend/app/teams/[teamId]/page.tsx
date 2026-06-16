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

  const team = (teams as Team[]).find((team) => team.id === teamId);

  return (
    <TeamSettingsPage
      team={team}
      teamId={teamId}
    />
  );
}