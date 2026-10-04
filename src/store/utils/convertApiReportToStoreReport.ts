import { ApiReport } from "@/services/types/interfaces";
import { Pet, Report } from "../types/interfaces";
import { convertApiPetToStorePet } from "./convertApiPetToStorePet";

export const convertApiReportToStoreReport = (apiReport: ApiReport): Report => {
  const address =
    apiReport.address ||
    (apiReport.lat != null && apiReport.long != null
      ? `${apiReport.lat.toFixed(4)}, ${apiReport.long.toFixed(4)}`
      : '');
  const rawType = (
    apiReport.type ||
    apiReport.reportType?.name ||
    'lost'
  ).toLowerCase();
  const reportType: 'lost' | 'found' =
    rawType.includes('found') || rawType.includes('encontrad')
      ? 'found'
      : 'lost';

  return {
    id: apiReport.id.toString(),
    type: reportType,
    pet: apiReport.pet ? convertApiPetToStorePet(apiReport.pet) : ({} as Pet),
    location: {
      address,
      coordinates: { lat: apiReport.lat ?? 0, lng: apiReport.long ?? 0 },
    },
    date: apiReport.reportedAt
      ? new Date(apiReport.reportedAt).toLocaleDateString()
      : '',
    time: apiReport.reportedAt
      ? new Date(apiReport.reportedAt).toLocaleTimeString()
      : '',
    description: apiReport.description || '',
    contactInfo: {
      name: apiReport.reportedBy?.name || '',
      phone: apiReport.reportedBy?.phone || '',
      email: apiReport.reportedBy?.email || '',
    },
    status: apiReport.resolved ? 'resolved' : 'active',
    createdAt: apiReport.reportedAt || new Date().toISOString(),
    updatedAt:
      apiReport.resolvedAt || apiReport.reportedAt || new Date().toISOString(),
    reportTypeId: apiReport.reportTypeId,
    reportedById: apiReport.reportedById,
    distanceKm: apiReport.distanceKm,
  };
};
