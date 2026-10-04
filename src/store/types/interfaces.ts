import type {
  ApiPetType,
  ApiPetBreed,
  ApiPetColor,
  ApiPetSize,
  ApiPetSex,
  ApiReportType,
} from "@/services/types/interfaces";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  lat?: number;
  long?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    userData: Omit<User, "id"> & {
      password: string;
      lat: number;
      long: number;
    },
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
  registerPushNotifications: () => Promise<void>;

  _hydrateFromStorage: () => void;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Chat {
  id: string;
  reportId: string;
  report?: Report;
  participants: {
    id: string;
    name: string;
    email: string;
  }[];
  messages: Message[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  currentUser: { id: string; name: string } | null;
  startChat: (reportId: string, participantId: string) => Promise<string>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  loadChats: () => Promise<void>;
  loadChatById: (chatId: string) => Promise<void>;
  setCurrentUser: (user: { id: string; name: string } | null) => void;
  connectSocket: (token: string) => void;
  disconnectSocket: () => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  getChatsByUser: (userId: string) => Chat[];
  getChatById: (id: string) => Chat | undefined;
  setActiveChat: (chat: Chat | null) => void;
  getCurrentUser: () => { id: string; name: string } | null;
  clearError: () => void;
}

export interface Pet {
  id: string;
  name: string;
  species: "dog" | "cat" | "bird" | "other";
  breed: string;
  age: number;
  color: string;
  size: string;
  sex: string;
  distinguishingFeatures: string;
  photo?: string;
  ownerId: string;
  isTemporary?: boolean;
  typeId?: number;
  breedId?: number;
  colorId?: number;
  sizeId?: number;
  sexId?: number;
}

export interface Report {
  id: string;
  type: "lost" | "found";
  pet: Pet;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  date: string;
  time: string;
  description: string;
  contactInfo: {
    name: string;
    phone: string;
    email: string;
    additionalContacts?: Array<{ name: string; phone: string }>;
  };
  status: "active" | "resolved";
  createdAt: string;
  updatedAt: string;
  reportTypeId?: number;
  reportedById?: number;
  distanceKm?: number;
}

export interface CommonSlice {
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export interface CatalogSlice {
  petTypes: ApiPetType[];
  petBreeds: ApiPetBreed[];
  petColors: ApiPetColor[];
  petSizes: ApiPetSize[];
  petSexes: ApiPetSex[];
  reportTypes: ApiReportType[];

  loadPetTypes: () => Promise<void>;
  loadPetBreeds: () => Promise<void>;
  loadPetColors: () => Promise<void>;
  loadPetSizes: () => Promise<void>;
  loadPetSexes: () => Promise<void>;
  loadReportTypes: () => Promise<void>;
}

export interface PetSlice {
  pets: Pet[];

  addPet: (pet: Omit<Pet, "id">) => Promise<string>;
  updatePet: (id: string, pet: Partial<Pet>) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  loadPets: () => Promise<void>;
}

export interface ReportSlice {
  reports: Report[];
  userReports: Report[];

  addReport: (
    report: Omit<Report, "id" | "createdAt" | "updatedAt">,
  ) => Promise<string>;
  updateReport: (id: string, report: Partial<Report>) => Promise<void>;
  updateReportStatus: (
    id: string,
    status: "active" | "resolved",
  ) => Promise<void>;
  loadReports: (includeResolved?: boolean) => Promise<void>;
  loadUserReports: (includeResolved?: boolean) => Promise<Report[]>;
  loadReportById: (id: string) => Promise<Report | null>;

  getReportsByUser: (userId: string) => Report[];
  getLatestReports: () => Report[];
  getReportById: (id: string) => Report | undefined;
}

export type PetStoreState = CommonSlice & CatalogSlice & PetSlice & ReportSlice;

