import { Navigate, Route, Routes } from 'react-router-dom';
import {
  RequireExperienceBoxSessionRoute,
  RequireExperiencesSessionRoute,
  RequireGuestRoute,
} from '@app/routeGuards';
import { AuthPage } from '@presentation/auth/AuthPage';
import { BoxSelectionPage } from '@presentation/boxes/BoxSelectionPage';
import { BoxHomePage } from '@presentation/box-home/BoxHomePage';
import { CreateBoxPage } from '@presentation/box-home/CreateBoxPage';
import { SharedMomentPage } from '@presentation/shared-moment/SharedMomentPage';
import { BootstrapPage } from '@presentation/bootstrap/BootstrapPage';
import { ExperienceListPage } from '@presentation/experiences/ExperienceListPage';
import { GroupSelectionPage } from '@presentation/groups/GroupSelectionPage';
import { OnboardingPage } from '@presentation/onboarding/OnboardingPage';
import { InvitePreviewPage } from '@presentation/invite/InvitePreviewPage';
import { UnknownSessionPage } from '@presentation/unknown-session/UnknownSessionPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<BootstrapPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/join" element={<InvitePreviewPage />} />
      <Route element={<RequireGuestRoute />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>
      <Route path="/unknown-session" element={<UnknownSessionPage />} />
      <Route element={<RequireExperiencesSessionRoute />}>
        <Route path="/groups" element={<GroupSelectionPage />} />
        <Route path="/groups/:groupId/boxes" element={<BoxSelectionPage />} />
        <Route
          path="/groups/:groupId/boxes/:boxId/experiences"
          element={<ExperienceListPage />}
        />
      </Route>
      <Route element={<RequireExperienceBoxSessionRoute />}>
        <Route path="/box-home" element={<BoxHomePage />} />
        <Route path="/box-home/create" element={<CreateBoxPage />} />
        <Route path="/box-home/:boxId/moment" element={<SharedMomentPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
