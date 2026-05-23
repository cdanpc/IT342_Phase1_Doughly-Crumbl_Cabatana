import { useEffect, useMemo, useState } from 'react';
import { Ban, RotateCcw, Search, ShieldCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';
import PageHeader from '../../components/ui/PageHeader';
import {
  banUser,
  disableUser,
  getAdminUsers,
  restoreUser,
  unbanUser,
} from '../../shared/api/adminUserApi';
import type { AdminUser } from '../../shared/types';
import { useAuth } from '../../shared/hooks/AuthContext';
import { getApiErrorMessage } from '../../shared/utils/apiError';
import '../../shared/components/LoadingSpinner.css';
import './AdminUsers.css';

type StatusFilter = 'ALL' | 'ACTIVE' | 'BANNED' | 'REMOVED';
type UserAction = 'BAN' | 'UNBAN' | 'REMOVE' | 'RESTORE';

interface PendingAction {
  type: UserAction;
  user: AdminUser;
}

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Banned', value: 'BANNED' },
  { label: 'Removed', value: 'REMOVED' },
];

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isActing, setIsActing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to load users. Please try again.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((managedUser) => {
      const status = getUserStatus(managedUser);
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;
      const matchesSearch =
        !query ||
        managedUser.name.toLowerCase().includes(query) ||
        managedUser.email.toLowerCase().includes(query) ||
        managedUser.role.toLowerCase().includes(query) ||
        (managedUser.phoneNumber ?? '').toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, users]);

  const counts = useMemo(() => ({
    total: users.length,
    active: users.filter((managedUser) => getUserStatus(managedUser) === 'ACTIVE').length,
    banned: users.filter((managedUser) => getUserStatus(managedUser) === 'BANNED').length,
    removed: users.filter((managedUser) => getUserStatus(managedUser) === 'REMOVED').length,
  }), [users]);

  async function confirmAction() {
    if (!pendingAction) return;

    setIsActing(true);
    try {
      const updatedUser = await runUserAction(pendingAction);
      setUsers((prev) => prev.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
      toast.success(getSuccessMessage(pendingAction.type));
      setPendingAction(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update user.'));
    } finally {
      setIsActing(false);
    }
  }

  function runUserAction(action: PendingAction): Promise<AdminUser> {
    switch (action.type) {
      case 'BAN':
        return banUser(action.user.id);
      case 'UNBAN':
        return unbanUser(action.user.id);
      case 'REMOVE':
        return disableUser(action.user.id);
      case 'RESTORE':
        return restoreUser(action.user.id);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-users__loading">
        <div className="spinner" />
      </div>
    );
  }

  const modalCopy = pendingAction ? getModalCopy(pendingAction) : null;

  return (
    <div className="admin-users">
      <PageHeader
        title="Manage Users"
        subtitle={`${counts.total} users | ${counts.active} active | ${counts.banned} banned | ${counts.removed} removed`}
        action={
          <button className="admin-users__refresh-btn" onClick={fetchUsers}>
            <RotateCcw size={16} />
            Refresh
          </button>
        }
      />

      {error && (
        <div className="admin-users__error" role="alert">
          <span>{error}</span>
          <button onClick={fetchUsers}>Retry</button>
        </div>
      )}

      <div className="admin-users__toolbar">
        <div className="admin-users__search-wrap">
          <Search size={16} className="admin-users__search-icon" />
          <input
            className="admin-users__search"
            type="search"
            placeholder="Search users by name, email, role, or phone"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search users"
          />
        </div>
        <div className="admin-users__filters" aria-label="Filter users by status">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              className={`admin-users__filter ${statusFilter === filter.value ? 'admin-users__filter--active' : ''}`}
              onClick={() => setStatusFilter(filter.value)}
              aria-pressed={statusFilter === filter.value}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-users__table-wrap">
        <table className="admin-users__table">
          <thead>
            <tr>
              <th scope="col" className="admin-users__th">User</th>
              <th scope="col" className="admin-users__th">Role</th>
              <th scope="col" className="admin-users__th">Phone</th>
              <th scope="col" className="admin-users__th">Status</th>
              <th scope="col" className="admin-users__th admin-users__th--right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((managedUser) => {
              const isCurrentUser = managedUser.id === currentUser?.userId;
              const status = getUserStatus(managedUser);
              return (
                <tr key={managedUser.id} className="admin-users__row">
                  <td className="admin-users__td">
                    <div className="admin-users__identity">
                      <span className="admin-users__name">{managedUser.name}</span>
                      <span className="admin-users__email">{managedUser.email}</span>
                    </div>
                  </td>
                  <td className="admin-users__td">
                    <span className="admin-users__role">{managedUser.role}</span>
                  </td>
                  <td className="admin-users__td">{managedUser.phoneNumber || 'Not provided'}</td>
                  <td className="admin-users__td">
                    <span className={`admin-users__status admin-users__status--${status.toLowerCase()}`}>
                      {formatStatus(status)}
                    </span>
                  </td>
                  <td className="admin-users__td admin-users__td--right">
                    <div className="admin-users__actions">
                      {renderActions(managedUser, isCurrentUser)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="admin-users__empty">No users match the current filters.</div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingAction)}
        onClose={() => { if (!isActing) setPendingAction(null); }}
        onConfirm={confirmAction}
        title={modalCopy?.title ?? ''}
        description={modalCopy?.description}
        confirmLabel={modalCopy?.confirmLabel}
        isDanger={pendingAction?.type === 'BAN' || pendingAction?.type === 'REMOVE'}
        isConfirming={isActing}
      />
    </div>
  );

  function renderActions(managedUser: AdminUser, isCurrentUser: boolean) {
    if (isCurrentUser) {
      return <span className="admin-users__self-note">Current admin</span>;
    }

    if (!managedUser.enabled) {
      return (
        <button
          className="admin-users__action admin-users__action--restore"
          onClick={() => setPendingAction({ type: 'RESTORE', user: managedUser })}
        >
          <ShieldCheck size={15} />
          Restore
        </button>
      );
    }

    return (
      <>
        {managedUser.accountLocked ? (
          <button
            className="admin-users__action"
            onClick={() => setPendingAction({ type: 'UNBAN', user: managedUser })}
          >
            <ShieldCheck size={15} />
            Unban
          </button>
        ) : (
          <button
            className="admin-users__action admin-users__action--warning"
            onClick={() => setPendingAction({ type: 'BAN', user: managedUser })}
          >
            <Ban size={15} />
            Ban
          </button>
        )}
        <button
          className="admin-users__action admin-users__action--danger"
          onClick={() => setPendingAction({ type: 'REMOVE', user: managedUser })}
        >
          <Trash2 size={15} />
          Remove
        </button>
      </>
    );
  }
}

function getUserStatus(user: AdminUser): Exclude<StatusFilter, 'ALL'> {
  if (!user.enabled) return 'REMOVED';
  if (user.accountLocked) return 'BANNED';
  return 'ACTIVE';
}

function formatStatus(status: Exclude<StatusFilter, 'ALL'>): string {
  if (status === 'REMOVED') return 'Removed';
  if (status === 'BANNED') return 'Banned';
  return 'Active';
}

function getSuccessMessage(type: UserAction): string {
  switch (type) {
    case 'BAN':
      return 'User banned.';
    case 'UNBAN':
      return 'User unbanned.';
    case 'REMOVE':
      return 'User removed from active access.';
    case 'RESTORE':
      return 'User restored.';
  }
}

function getModalCopy(action: PendingAction): { title: string; description: string; confirmLabel: string } {
  switch (action.type) {
    case 'BAN':
      return {
        title: 'Ban User',
        description: `${action.user.name} will be blocked from signing in until an admin unbans the account.`,
        confirmLabel: 'Ban',
      };
    case 'UNBAN':
      return {
        title: 'Unban User',
        description: `${action.user.name} will be allowed to sign in again.`,
        confirmLabel: 'Unban',
      };
    case 'REMOVE':
      return {
        title: 'Remove User',
        description: `${action.user.name} will lose active access, while their order history remains intact.`,
        confirmLabel: 'Remove',
      };
    case 'RESTORE':
      return {
        title: 'Restore User',
        description: `${action.user.name} will regain active account access.`,
        confirmLabel: 'Restore',
      };
  }
}
