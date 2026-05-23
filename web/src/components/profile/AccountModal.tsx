import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Phone, RefreshCw, Shield } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAuth } from '../../shared/hooks/AuthContext';
import { useFavorites } from '../../shared/hooks/FavoritesContext';
import { useCustomerProfile } from '../../shared/hooks/useCustomerProfile';
import { ROUTES } from '../../shared/utils/routes';
import RewardProgressMap from '../rewards/RewardProgressMap';
import ProfileForm from './ProfileForm';
import AddressManager from './AddressManager';
import './AccountModal.css';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { user, updateCurrentUser } = useAuth();
  const { favoriteIds } = useFavorites();
  const navigate = useNavigate();
  const isCustomer = user?.role !== 'ADMIN';
  const {
    profile,
    addresses,
    isLoading,
    isSavingProfile,
    isSavingAddress,
    addressActionId,
    error,
    reload,
    saveProfile,
    saveAddress,
    removeAddress,
  } = useCustomerProfile(isOpen && isCustomer);

  function handleBrowseMenu() {
    onClose();
    navigate(ROUTES.MENU);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="My Account"
      description={user?.role === 'ADMIN' ? 'Administrator account' : 'Manage profile, addresses, rewards, and favorites.'}
      maxWidth={900}
      className="account-modal-shell"
    >
      <div className="account-modal">
        <div className="account-modal__profile">
          <div className="account-modal__avatar">
            {user ? getInitials(user.name) : '??'}
          </div>
          <div className="account-modal__identity">
            <span className="account-modal__name">{user?.name ?? '-'}</span>
            <span className="account-modal__role-badge">
              {user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
            </span>
          </div>
          {isCustomer && (
            <div className="account-modal__profile-actions">
              <Button type="button" variant="ghost" onClick={reload} disabled={isLoading}>
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="account-modal__error" role="alert">
            <RefreshCw size={15} />
            <span>{error}</span>
            <button type="button" onClick={reload}>Retry</button>
          </div>
        )}

        {isCustomer ? (
          <div className="account-modal__grid">
            <section className="account-section">
              <div className="account-section__header">
                <div>
                  <h3>Profile details</h3>
                  <p>Edit the details used for checkout and account display.</p>
                </div>
              </div>
              <ProfileForm
                profile={profile}
                fallbackName={user?.name ?? ''}
                fallbackEmail={user?.email ?? ''}
                isSaving={isSavingProfile}
                onSubmit={async (data) => {
                  const updated = await saveProfile(data);
                  updateCurrentUser({ name: updated.name, email: updated.email });
                }}
              />
            </section>

            <AddressManager
              addresses={addresses}
              isSaving={isSavingAddress}
              actionId={addressActionId}
              onSave={saveAddress}
              onDelete={removeAddress}
            />
          </div>
        ) : (
          <div className="account-modal__admin-card">
            <div className="account-modal__field-icon"><Shield size={18} /></div>
            <div>
              <h3>Administrator account</h3>
              <p>
                Admin profile editing and user management should use the future Manage Users area
                once admin user endpoints are available.
              </p>
            </div>
          </div>
        )}

        {isCustomer && (
          <>
            <RewardProgressMap completedOrders={profile?.completedOrders ?? 0} />
            <div className="account-modal__favorites">
              <div className="account-modal__favorites-info">
                <Heart size={16} className="account-modal__favorites-icon" />
                <div>
                  <div className="account-modal__favorites-count">
                    {favoriteIds.size} saved item{favoriteIds.size !== 1 ? 's' : ''}
                  </div>
                  <div className="account-modal__favorites-hint">
                    {profile
                      ? `${profile.totalOrders ?? 0} total orders, ${profile.cancelledOrders ?? 0} cancelled`
                      : 'Heart any cookie to save it'}
                  </div>
                </div>
              </div>
              <button className="account-modal__browse-btn" onClick={handleBrowseMenu}>
                Browse menu
              </button>
            </div>
          </>
        )}

        <div className="account-modal__store">
          <div className="account-modal__store-row">
            <MapPin size={13} className="account-modal__store-icon" />
            <span>Don Gil Garcia St., Capitol Site, Cebu City</span>
          </div>
          <div className="account-modal__store-row">
            <Phone size={13} className="account-modal__store-icon" />
            <span>09165667589</span>
          </div>
        </div>

        <p className="account-modal__note">
          Password changes are not shown here yet because the backend does not expose a password-change endpoint.
        </p>
      </div>
    </Modal>
  );
}
