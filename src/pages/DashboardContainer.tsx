import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { OverviewPage } from './dashboard/OverviewPage';
import { DatabaseListPage } from './dashboard/DatabaseListPage';
import { DatabaseExplorerPage } from './dashboard/DatabaseExplorerPage';
import { AuthenticationPage } from './dashboard/AuthenticationPage';
import { StoragePage } from './dashboard/StoragePage';
import { FunctionsPage } from './dashboard/FunctionsPage';
import { SettingsPage } from './dashboard/SettingsPage';
import { TeamPage } from './dashboard/TeamPage';

interface DashboardContainerProps {
  onNavigate: (page: string) => void;
  initialTab?: string;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ 
  onNavigate,
  initialTab = 'overview'
}) => {
  const [currentTab, setCurrentTab] = useState<string>(initialTab);

  // Global modal triggers that can be invoked across tabs
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateDbModalOpen, setIsCreateDbModalOpen] = useState(false);

  const handleNavigateTab = (tab: string) => {
    setCurrentTab(tab);
    window.history.pushState({}, '', `/dashboard/${tab}`);
  };

  const handleOpenCreateTable = () => {
    setCurrentTab('explorer');
    setIsCreateTableModalOpen(true);
  };

  const handleOpenInviteMember = () => {
    setCurrentTab('team');
    setIsInviteModalOpen(true);
  };

  return (
    <DashboardLayout
      currentTab={currentTab}
      onNavigateTab={handleNavigateTab}
      onNavigateLanding={() => onNavigate('home')}
    >
      {currentTab === 'overview' && (
        <OverviewPage
          onNavigateTab={handleNavigateTab}
          onOpenCreateTable={handleOpenCreateTable}
          onOpenInviteMember={handleOpenInviteMember}
        />
      )}

      {currentTab === 'databases' && (
        <DatabaseListPage
          onNavigateTab={handleNavigateTab}
          isCreateModalOpen={isCreateDbModalOpen}
          onCloseCreateModal={() => setIsCreateDbModalOpen(false)}
        />
      )}

      {currentTab === 'explorer' && (
        <DatabaseExplorerPage
          isCreateTableModalOpen={isCreateTableModalOpen}
          onCloseCreateTableModal={() => setIsCreateTableModalOpen(false)}
        />
      )}

      {currentTab === 'auth' && (
        <AuthenticationPage />
      )}

      {currentTab === 'storage' && (
        <StoragePage />
      )}

      {currentTab === 'functions' && (
        <FunctionsPage />
      )}

      {currentTab === 'settings' && (
        <SettingsPage onOpenInviteMember={handleOpenInviteMember} />
      )}

      {currentTab === 'team' && (
        <TeamPage
          isInviteModalOpen={isInviteModalOpen}
          onCloseInviteModal={() => setIsInviteModalOpen(false)}
        />
      )}
    </DashboardLayout>
  );
};
