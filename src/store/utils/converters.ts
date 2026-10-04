import {
  type Chat as ApiChat,
  type Message as ApiMessage,
  type Pet as ApiPet,
  type Report as ApiReport,
} from "@/services/api";
import { type SocketMessage } from "@/services/socket";
import { type Report } from "../petStore";
import { Chat, Message, Pet } from "../types/interfaces";
import config from "@/config";

export const convertApiChatToStoreChat = (apiChat: ApiChat): Chat => {
  return {
    id: apiChat.id.toString(),
    reportId: apiChat.reportId.toString(),
    report: apiChat.report
      ? convertApiReportToStoreReport(apiChat.report)
      : undefined,
    participants: apiChat.participants.map((p) => ({
      id: p.userId.toString(),
      name: p.user.name,
      email: p.user.email,
    })),
    messages: apiChat.messages.map(convertApiMessageToStoreMessage),
    lastMessage:
      apiChat.messages.length > 0
        ? convertApiMessageToStoreMessage(
            apiChat.messages[apiChat.messages.length - 1],
          )
        : undefined,
    createdAt: apiChat.createdAt,
    updatedAt: apiChat.updatedAt,
  };
};


export const convertApiMessageToStoreMessage = (apiMessage: ApiMessage): Message => {
  return {
    id: apiMessage.id.toString(),
    senderId: apiMessage.senderId.toString(),
    senderName: apiMessage.sender.name,
    content: apiMessage.content,
    timestamp: apiMessage.createdAt,
    read: apiMessage.read,
  };
};

export const convertSocketMessageToStoreMessage = (
  socketMessage: SocketMessage,
): Message => {
  return {
    id: socketMessage.id.toString(),
    senderId: socketMessage.senderId.toString(),
    senderName: socketMessage.senderName,
    content: socketMessage.content,
    timestamp: socketMessage.createdAt,
    read: socketMessage.read,
  };
};

// Helper function to convert API pet to store pet format
export const convertApiPetToStorePet = (apiPet: ApiPet): Pet => {
  const getSpecies = (typeName?: string): 'dog' | 'cat' | 'bird' | 'other' => {
    if (!typeName) return 'other'
    const lowerType = typeName.toLowerCase()
    if (['dog', 'cat', 'bird'].includes(lowerType)) {
      return lowerType as 'dog' | 'cat' | 'bird'
    }
    return 'other'
  }

  const getAbsolutePhotoUrl = (photoUrl?: string): string | undefined => {
    return config.resolveUploadUrl(photoUrl)
  }

  return {
    id: apiPet.id.toString(),
    name: apiPet.name,
    species: getSpecies(apiPet.type?.name),
    breed: apiPet.breed?.name || '',
    age: apiPet.age,
    color: apiPet.color?.name || '',
    size: apiPet.size?.name || '',
    sex: apiPet.sex?.name || '',
    distinguishingFeatures: apiPet.distinctiveCharacteristics || '',
    photo: getAbsolutePhotoUrl(apiPet.photoUrl),
    ownerId: apiPet.userId.toString(),
    typeId: apiPet.typeId,
    breedId: apiPet.breedId,
    colorId: apiPet.colorId,
    sizeId: apiPet.sizeId,
    sexId: apiPet.sexId,
  }
}

export const convertApiReportToStoreReport = (apiReport: ApiReport): Report => {
  const address = apiReport.address || (apiReport.lat != null && apiReport.long != null ? `${apiReport.lat.toFixed(4)}, ${apiReport.long.toFixed(4)}` : '')
  const rawType = (apiReport.type || apiReport.reportType?.name || 'lost').toLowerCase()
  const reportType: 'lost' | 'found' = (rawType.includes('found') || rawType.includes('encontrad')) ? 'found' : 'lost'

  return {
    id: apiReport.id.toString(),
    type: reportType,
    pet: apiReport.pet ? convertApiPetToStorePet(apiReport.pet) : {} as Pet,
    location: {
      address,
      coordinates: { lat: apiReport.lat ?? 0, lng: apiReport.long ?? 0 }
    },
    date: apiReport.reportedAt ? new Date(apiReport.reportedAt).toLocaleDateString() : '',
    time: apiReport.reportedAt ? new Date(apiReport.reportedAt).toLocaleTimeString() : '',
    description: apiReport.description || '',
    contactInfo: {
      name: apiReport.reportedBy?.name || '',
      phone: apiReport.reportedBy?.phone || '',
      email: apiReport.reportedBy?.email || '',
    },
    status: apiReport.resolved ? 'resolved' : 'active',
    createdAt: apiReport.reportedAt || new Date().toISOString(),
    updatedAt: apiReport.resolvedAt || apiReport.reportedAt || new Date().toISOString(),
    reportTypeId: apiReport.reportTypeId,
    reportedById: apiReport.reportedById,
    distanceKm: apiReport.distanceKm,
  }
}