import { useAuth } from '../context/AuthContext';
import TechnicalOfficerEquipment from './equipment/TechnicalOfficerEquipment';
import BrowseEquipment from './equipment/BrowseEquipment';

export default function EquipmentList() {
  const { user } = useAuth();

  if (user?.role === 'Technical_Officer') {
    return <TechnicalOfficerEquipment />;
  }

  return <BrowseEquipment user={user} />;
}
