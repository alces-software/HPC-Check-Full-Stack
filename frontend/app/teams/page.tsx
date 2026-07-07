import { Suspense } from 'react';
import TeamPage from '../components/TeamsSettingsPage';

export const metadata = {
   title: 'Team Options'
};

export default async function Teams() {
   return (
      <main>
         <Suspense>
            <TeamPage />
         </Suspense>
      </main>
   );
}
